from fastapi.testclient import TestClient

from app import app


def test_valid_member_can_log_in_and_read_session():
    with TestClient(app) as client:
        login = client.post(
            "/api/auth/login",
            json={"member_id": "SNY-MUN-1001", "member_name": "Neha Rao"},
        )
        assert login.status_code == 200

        current = client.get("/api/auth/me")
        assert current.status_code == 200
        assert current.json()["member"]["display_name"] == "Neha Rao"


def test_unknown_or_inactive_member_cannot_log_in():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"member_id": "SNY-OLD-0099", "member_name": "Inactive Member"},
        )
        assert response.status_code == 401


def test_operations_redirects_when_not_logged_in():
    with TestClient(app, follow_redirects=False) as client:
        response = client.get("/operations")
        assert response.status_code == 303
        assert response.headers["location"] == "/login"