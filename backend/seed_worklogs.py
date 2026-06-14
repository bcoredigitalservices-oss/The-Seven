import sys
import os
import uuid
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User, Task, WorkLog

def seed_worklogs():
    db = SessionLocal()
    
    users = db.query(User).all()
    tasks = db.query(Task).all()
    
    if not tasks:
        print("No tasks found. Please seed tasks/users first.")
        return
        
    log_count = 0
    for u in users:
        # Check if user already has any worklogs
        existing_log = db.query(WorkLog).filter(WorkLog.user_id == u.user_id).first()
        if not existing_log:
            # Find a task assigned to this user, or fallback to the first task
            task = db.query(Task).filter(Task.assigned_user_id == u.user_id).first()
            if not task:
                task = tasks[0]
                
            # Create a mock worklog
            new_log = WorkLog(
                log_id=str(uuid.uuid4()),
                user_id=u.user_id,
                task_id=task.task_id,
                date_logged=datetime.utcnow() - timedelta(days=1),
                hours_spent=6.5,
                description=f"Initial workspace setup & role task audit for: {u.full_name}"
            )
            db.add(new_log)
            log_count += 1
            
    db.commit()
    db.close()
    print(f"Successfully seeded {log_count} new work logs for users who didn't have any.")

if __name__ == "__main__":
    seed_worklogs()
