import os
from app.database import SessionLocal
from app.models import Project

db = SessionLocal()
projects = db.query(Project).all()
print(f"DATABASE URL: {os.getenv('DATABASE_URL')}")
print(f"Total projects: {len(projects)}")
for p in projects:
    print(f"ID: {p.project_id} | Title: {p.title} | Status: {p.status} | ClientID: {p.client_id} | ClientIDs: {p.client_ids}")
db.close()
