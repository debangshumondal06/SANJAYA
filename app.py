import json
import shutil
import uuid
from pathlib import Path
from typing import Literal
import os
import re
import sqlite3
from contextlib import contextmanager

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile, Request, Response, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

from services.db import connect, initialise_database
from services.priority import calculate_priority


ROOT = Path(__file__).resolve().parent
UPLOADS = ROOT / "uploads"
FRONTEND = ROOT / "frontend"
UPLOADS.mkdir(exist_ok=True)

app = FastAPI(title="SANJAYA Civic Intelligence API")


class AuthorityUpdate(BaseModel):
    status: Literal["submitted", "under_review", "assigned", "in_progress", "resolved", "reopened"]
    department_id: int | None = Field(default=None, ge=1)
    note: str = Field(min_length=3, max_length=500)
    updated_by: str = Field(default="Authority operator", min_length=2, max_length=100)


@app.on_event("startup")
def startup() -> None:
    initialise_database()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/incidents")
def list_incidents(
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
) -> dict:
    clauses, values = [], []
    if status:
        clauses.append("i.status = ?")
        values.append(status)
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
    return {"items": items, "total": len(items)}


@app.post("/api/incidents", status_code=201)
def create_incident(
    category: Literal["pothole", "garbage_overflow", "waterlogging"] = Form(...),
    description: str = Form(..., min_length=10, max_length=1000),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    severity: Literal["low", "medium", "high", "critical"] = Form("medium"),
    evidence: UploadFile | None = File(default=None),
) -> dict:
    if evidence and evidence.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, or WEBP image.")

    filename = None
    if evidence and evidence.filename:
        extension = Path(evidence.filename).suffix.lower()
        filename = f"{uuid.uuid4().hex}{extension}"
        with (UPLOADS / filename).open("wb") as output:
            shutil.copyfileobj(evidence.file, output)

    priority = calculate_priority(category, severity, description)
    with connect() as connection:
        cursor = connection.execute(
            """
            INSERT INTO incidents (
                category, description, latitude, longitude, severity, priority_score,
                priority_label, priority_explanation, evidence_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (category, description, latitude, longitude, severity, priority.score,
             priority.label, json.dumps(priority.reasons), filename),
        )
        incident_id = cursor.lastrowid
        connection.execute(
            """
            INSERT INTO incident_updates (incident_id, previous_status, new_status, note, updated_by)
            VALUES (?, NULL, 'submitted', 'Citizen report received.', 'Citizen')
            """,
            (incident_id,),
        )
        connection.commit()
    return {"message": "Incident submitted successfully.", "incident_id": incident_id}


@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: int, update: AuthorityUpdate) -> dict:
    with connect() as connection:
        current = connection.execute("SELECT status FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Incident not found.")
        connection.execute(
            "UPDATE incidents SET status = ?, department_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (update.status, update.department_id, incident_id),
        )
        connection.execute(
            """
            INSERT INTO incident_updates (incident_id, previous_status, new_status, note, updated_by)
            VALUES (?, ?, ?, ?, ?)
            """,
            (incident_id, current["status"], update.status, update.note, update.updated_by),
        )
        connection.commit()
    return {"message": "Incident updated successfully."}


app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")
app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")

"""SANJAYA member-verification prototype.

This example validates an active member ID and display name against SQLite, then
stores a minimal verified identity in a signed session cookie. For production,
add a password, OTP, SSO, and a persistent secret manager before handling real
government staff identities.
"""



ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DATABASE = ROOT / "database" / "sanjaya.db"
SCHEMA = ROOT / "database" / "schema.sql"
SEED = ROOT / "database" / "seed.sql"
SESSION_SECRET = os.getenv("SANJAYA_SESSION_SECRET", "change-this-development-session-secret")

app = FastAPI(title="SANJAYA Member Verification", docs_url=None, redoc_url=None)
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="sanjaya_member_session",
    same_site="lax",
    https_only=os.getenv("SANJAYA_HTTPS_ONLY", "false").lower() == "true",
    max_age=60 * 60 * 8,
)


class LoginRequest(BaseModel):
    member_id: str = Field(min_length=4, max_length=32)
    member_name: str = Field(min_length=2, max_length=120)

    @field_validator("member_id")
    @classmethod
    def normalize_member_id(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not re.fullmatch(r"[A-Z0-9-]+", normalized):
            raise ValueError("Member ID may only contain letters, numbers, and hyphens.")
        return normalized

    @field_validator("member_name")
    @classmethod
    def normalize_member_name(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not re.fullmatch(r"[A-Za-z][A-Za-z .'-]*", normalized):
            raise ValueError("Enter a valid member name.")
        return normalized


def initialize_database() -> None:
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DATABASE) as connection:
        connection.executescript(SCHEMA.read_text(encoding="utf-8"))
        connection.executescript(SEED.read_text(encoding="utf-8"))


@contextmanager
def database_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def verified_member(request: Request) -> dict:
    member = request.session.get("member")
    if not member:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Verification required.")
    return member


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/", include_in_schema=False)
def root(request: Request):
    return RedirectResponse("/operations", status_code=status.HTTP_303_SEE_OTHER) if request.session.get("member") else RedirectResponse("/login", status_code=status.HTTP_303_SEE_OTHER)


@app.get("/login", include_in_schema=False)
def login_page(request: Request):
    return RedirectResponse("/operations", status_code=status.HTTP_303_SEE_OTHER) if request.session.get("member") else FileResponse(FRONTEND / "login.html")


@app.get("/operations", include_in_schema=False)
def operations_page(request: Request):
    return FileResponse(FRONTEND / "index.html") if request.session.get("member") else RedirectResponse("/login", status_code=status.HTTP_303_SEE_OTHER)


@app.post("/api/auth/login")
def login(payload: LoginRequest, request: Request):
    with database_connection() as connection:
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
        connection.execute("UPDATE members SET last_login_at = CURRENT_TIMESTAMP WHERE member_id = ?", (row["member_id"],))

    member = dict(row)
    request.session.clear()
    request.session["member"] = member
    return {"member": member}


@app.get("/api/auth/me")
def current_member(request: Request):
    return {"member": verified_member(request)}


@app.post("/api/auth/logout")
def logout(request: Request):
    request.session.clear()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.exception_handler(HTTPException)
async def http_error_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
