import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

client = TestClient(app)

# Get a project
db = SessionLocal()
project = db.query(models.Project).first()
project_id = project.project_id if project else "some-id"
db.close()

print(f"Testing API endpoint with project_id: {project_id}")

# Send task creation request
payload = {
    "title": "API Test Task",
    "description": "Created from TestClient",
    "status": "Backlog",
    "project_id": project_id,
    "assigned_user_id": None,
    "due_date": "2026-06-20T12:00:00" # include due_date like the frontend
}

response = client.post("/api/tasks", json=payload)
print(f"Status Code (POST): {response.status_code}")
print(f"Response JSON: {response.text}")

if response.status_code == 200:
    task_id = response.json()["task_id"]
    print(f"Testing PUT /api/tasks/{task_id}...")
    update_payload = {
        "due_date": "2026-06-25T15:30:00"
    }
    put_response = client.put(f"/api/tasks/{task_id}", json=update_payload)
    print(f"Status Code (PUT): {put_response.status_code}")
    print(f"Updated Response JSON: {put_response.text}")

