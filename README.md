# SANJAYA

SANJAYA is a civic incident reporting and authority-management prototype. It supports pothole, garbage-overflow, and waterlogging reports, then prioritises, groups, routes, and tracks them.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000