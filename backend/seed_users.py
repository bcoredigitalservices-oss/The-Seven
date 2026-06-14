import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User
from app.auth import hash_password
import uuid

def seed_users():
    db = SessionLocal()
    
    users_to_add = [
        {"email": "test.admin@seven.com", "full_name": "Test Admin", "role_tier": 1, "department": "IT_SAAS", "user_type": "Admin"},
        {"email": "test.arch1@seven.com", "full_name": "Test Architect 1", "role_tier": 2, "department": "IT_SAAS", "user_type": "Architect"},
        {"email": "test.arch2@seven.com", "full_name": "Test Architect 2", "role_tier": 2, "department": "CORPORATE", "user_type": "Architect"},
        {"email": "test.dev1@seven.com", "full_name": "Test Developer 1", "role_tier": 3, "department": "IT_SAAS", "user_type": "Employee"},
        {"email": "test.dev2@seven.com", "full_name": "Test Developer 2", "role_tier": 3, "department": "IT_SAAS", "user_type": "Employee"},
        {"email": "test.sales@seven.com", "full_name": "Test Sales Lead", "role_tier": 2, "department": "ADS_AGENCY", "user_type": "Department Lead"},
        {"email": "test.marketer@seven.com", "full_name": "Test Marketer", "role_tier": 3, "department": "ADS_AGENCY", "user_type": "Employee"},
        {"email": "test.hr@seven.com", "full_name": "Test HR", "role_tier": 2, "department": "CORPORATE", "user_type": "Department Lead"},
        {"email": "test.support@seven.com", "full_name": "Test Support", "role_tier": 3, "department": "CORPORATE", "user_type": "Employee"},
        {"email": "test.client@client.com", "full_name": "Test Client", "role_tier": 4, "department": None, "user_type": "Client"},
    ]
    
    password = "TestPassword123!"
    hashed_password = hash_password(password)
    
    added_count = 0
    for u in users_to_add:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_user = User(
                user_id=str(uuid.uuid4()),
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=hashed_password,
                role_tier=u["role_tier"],
                department=u["department"],
                user_type=u["user_type"]
            )
            db.add(new_user)
            added_count += 1
            
    # Seed Projects
    from app.models import Project
    projects_to_add = [
        {"title": "Project Alpha", "status": "Active"},
        {"title": "Nexus Redesign", "status": "Active"},
        {"title": "Titan DB Migration", "status": "Active"},
        {"title": "Client Portal v2", "status": "Active"},
    ]
    proj_added = 0
    for p in projects_to_add:
        existing_proj = db.query(Project).filter(Project.title == p["title"]).first()
        if not existing_proj:
            new_proj = Project(
                project_id=str(uuid.uuid4()),
                title=p["title"],
                status=p["status"]
            )
            db.add(new_proj)
            proj_added += 1

    db.commit()
    db.close()
    print(f"Successfully seeded {added_count} users and {proj_added} projects. Password is '{password}'.")

if __name__ == "__main__":
    seed_users()
