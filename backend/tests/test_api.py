from fastapi.testclient import TestClient

from app import app


def test_creates_a_civic_incident():
    with TestClient(app) as client:
        response = client.post(
            "/api/incidents",
            data={
                "category": "pothole",
                "description": "A deep pothole beside a school crossing is forcing traffic into the opposite lane.",
                "ward": "Ward 07",
                "latitude": "19.06325",
                "longitude": "72.85110",
                "severity": "high",
            },
        )
        assert response.status_code == 201
        assert response.json()["incident_id"] > 0