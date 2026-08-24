import json
import shutil
import uuid
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

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