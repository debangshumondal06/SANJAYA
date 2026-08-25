import json
import os
import re
import shutil
import uuid
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from starlette.middleware.sessions import SessionMiddleware

from services.db import connect, initialise_database
from services.priority import calculate_priority


# KEEP THESE PATHS AT THE BEGINNING OF THE FILE.
ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"
UPLOADS = ROOT / "uploads"
UPLOADS.mkdir(exist_ok=True)

# CREATE ONE FASTAPI APPLICATION ONLY.
app = FastAPI(title="SANJAYA Civic Intelligence API")
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SANJAYA_SESSION_SECRET", "development-only-change-this-secret"),
    session_cookie="sanjaya_member_session",
    same_site="lax",
    https_only=os.getenv("SANJAYA_HTTPS_ONLY", "false" ).lower() == "true",
    max_age=60 * 60 * 8,
)


class LoginRequest(BaseModel):
    member_id: str = Field(min_length=4, max_length=32)
    member_name: str = Field(min_length=2, max_length=120)

    @field_validator("member_id")
    @classmethod
    def normalise_member_id(cls, value: str) -> str:
        value = value.strip().upper()
        if not re.fullmatch(r"[A-Z0-9-]+", value):
            raise ValueError("Member ID may contain letters, numbers, and hyphens only.")
        return value

    @field_validator("member_name")
    @classmethod
    def normalise_member_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if not re.fullmatch(r"[A-Za-z][A-Za-z .'-]*", value):
            raise ValueError("Enter a valid member name.")
        return value


class AuthorityUpdate(BaseModel):
    status: Literal["submitted", "under_review", "assigned", "in_progress", "resolved", "reopened"]
    department_id: int | None = Field(default=None, ge=1)
    note: str = Field(min_length=3, max_length=500)
    updated_by: str = Field(default="Authority operator", min_length=2, max_length=100)


@app.on_event("startup")
def startup() -> None:
    initialise_database()


def require_member(request: Request) -> dict:
    member = request.session.get("member")
    if not member:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Verification required.")
    return member


# ---------- Page routes ----------
# KEEP THESE ROUTES ABOVE THE /uploads static mount at the end.

@app.get("/", include_in_schema=False)
def public_home():
    return FileResponse(FRONTEND / "index.html")


@app.get("/login", include_in_schema=False)
def login_page(request: Request):
    if request.session.get("member"):
        return RedirectResponse("/operations", status_code=status.HTTP_303_SEE_OTHER)
    return FileResponse(FRONTEND / "login.html")


@app.get("/operations", include_in_schema=False)
def operations_page(request: Request):
    if not request.session.get("member"):
        return RedirectResponse("/login", status_code=status.HTTP_303_SEE_OTHER)
    # IMPORTANT: This must be dashboard.html, not index.html.
    return FileResponse(FRONTEND / "dashboard.html")


@app.get("/complaint", include_in_schema=False)
def complaint_page():
    return FileResponse(FRONTEND / "complaint.html")


# ---------- Member verification routes ----------

@app.post("/api/auth/login")
def login(payload: LoginRequest, request: Request):
    with connect() as connection:
        row = connection.execute(
            """
            SELECT member_id, display_name, department, access_role
            FROM members
            WHERE member_id = ?
              AND display_name = ? COLLATE NOCASE
              AND is_active = 1
            """,
            (payload.member_id, payload.member_name),
        ).fetchone()

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="We could not verify an active SANJAYA member with those details.",
            )

        connection.execute(
            "UPDATE members SET last_login_at = CURRENT_TIMESTAMP WHERE member_id = ?",
            (row["member_id"],),
        )

    member = dict(row)
    request.session.clear()
    request.session["member"] = member
    return {"member": member}


@app.get("/api/auth/me")
def current_member(request: Request):
    return {"member": require_member(request)}


@app.post("/api/auth/logout")
def logout(request: Request):
    request.session.clear()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Incident routes ----------

@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/incidents")
def list_incidents(
    incident_status: str | None = Query(default=None, alias="status"),
    category: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
) -> dict:
    clauses: list[str] = []
    values: list[object] = []

    if incident_status:
        clauses.append("i.status = ?")
        values.append(incident_status)
    if category:
        clauses.append("i.category = ?")
        values.append(category)
    if department_id:
        clauses.append("i.department_id = ?")
        values.append(department_id)

    where_clause = "WHERE " + " AND ".join(clauses) if clauses else ""
    query = f"""
        SELECT i.*, d.name AS department_name
        FROM incidents i
        LEFT JOIN departments d ON d.id = i.department_id
        {where_clause}
        ORDER BY i.priority_score DESC, i.created_at DESC
    """
    with connect() as connection:
        items = [dict(row) for row in connection.execute(query, values)]

    for item in items:
        item["evidence_url"] = f"/uploads/{item['evidence_filename']}" if item["evidence_filename"] else None
    return {"items": items, "total": len(items)}


@app.post("/api/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(
    category: Literal["pothole", "garbage_overflow", "waterlogging"] = Form(...),
    description: str = Form(..., min_length=10, max_length=1000),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    ward: str = Form(..., min_length=2, max_length=120),
    severity: Literal["low", "medium", "high", "critical"] = Form("medium"),
    evidence: UploadFile | None = File(default=None),
) -> dict:
    if evidence and evidence.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Upload a JPG, PNG, or WEBP image.")

    evidence_filename = None
    if evidence and evidence.filename:
        extension = Path(evidence.filename).suffix.lower()
        evidence_filename = f"{uuid.uuid4().hex}{extension}"
        with (UPLOADS / evidence_filename).open("wb") as output:
            shutil.copyfileobj(evidence.file, output)

    priority = calculate_priority(category, severity, description)
    with connect() as connection:
        cursor = connection.execute(
            """
            INSERT INTO incidents (
                category, description, latitude, longitude, ward, severity,
                priority_score, priority_label, priority_explanation,
                status, evidence_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
            """,
            (
                category, description, latitude, longitude, ward, severity,
                priority.score, priority.label, json.dumps(priority.reasons), evidence_filename,
            ),
        )
        incident_id = cursor.lastrowid
        connection.execute(
            """
            INSERT INTO incident_updates (incident_id, previous_status, new_status, note, updated_by)
            VALUES (?, NULL, 'submitted', 'Citizen report received.', 'Citizen')
            """,
            (incident_id,),
        )
    return {"message": "Incident submitted successfully.", "incident_id": incident_id}


@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: int, update: AuthorityUpdate, request: Request) -> dict:
    member = require_member(request)
    with connect() as connection:
        current = connection.execute("SELECT status FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        connection.execute(
            """
            UPDATE incidents
            SET status = ?, department_id = COALESCE(?, department_id), updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (update.status, update.department_id, incident_id),
        )
        connection.execute(
            """
            INSERT INTO incident_updates (incident_id, previous_status, new_status, note, updated_by)
            VALUES (?, ?, ?, ?, ?)
            """,
            (incident_id, current["status"], update.status, update.note, member["display_name"]),
        )
    return {"message": "Incident updated successfully."}


@app.exception_handler(HTTPException)
async def http_error_handler(_: Request, exc: HTTPException ):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# KEEP THIS MOUNT AS THE LAST LINE OF THE FILE.
# DELETE the current root mount: app.mount("/", StaticFiles(...)).
app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")