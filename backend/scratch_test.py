import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app import models, schemas, crud

db = SessionLocal()
try:
    # Get a project
    project = db.query(models.Project).first()
    if not project:
        print("No projects found in database. Creating a test project first...")
        project = models.Project(title="Test Project")
        db.add(project)
        db.commit()
        db.refresh(project)
    
    print(f"Using Project: {project.title} (ID: {project.project_id})")
    
    task_in = schemas.TaskCreate(
        title="Test Task via Script",
        description="Script test description",
        status="Backlog",
        project_id=project.project_id,
        assigned_user_id=None
    )
    
    print("Attempting to call crud.create_task...")
    new_task = crud.create_task(db, task_in)
    print(f"Success! Created task: {new_task.title} (ID: {new_task.task_id})")
    
except Exception as e:
    import traceback
    print("ERROR creating task:")
    traceback.print_exc()
finally:
    db.close()
