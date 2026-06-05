from sqlalchemy.orm import Session
from app import models, schemas
# Hashing moved to app.auth

# User CRUD
def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, user: schemas.UserCreate):
    from app.auth import hash_password
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        role_tier=user.role_tier,
        department_id=user.department_id,
        current_status=user.current_status,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_status(db: Session, user_id: str, status: str):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.current_status = status
        db.commit()
        db.refresh(db_user)
    return db_user

# Project CRUD
def get_projects(db: Session):
    return db.query(models.Project).all()

def get_project(db: Session, project_id: str):
    return db.query(models.Project).filter(models.Project.project_id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(title=project.title, status=project.status)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# Task CRUD
def get_tasks(db: Session):
    return db.query(models.Task).all()

def get_task(db: Session, task_id: str):
    return db.query(models.Task).filter(models.Task.task_id == task_id).first()

def get_tasks_by_user(db: Session, user_id: str):
    return db.query(models.Task).filter(models.Task.assigned_user_id == user_id).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        project_id=task.project_id,
        assigned_user_id=task.assigned_user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Automatically create a context channel for this task
    db_channel = models.Channel(
        attached_task_id=db_task.task_id,
        channel_type="Task"
    )
    db.add(db_channel)
    db.commit()

    return db_task

def update_task_status(db: Session, task_id: str, status: str):
    db_task = get_task(db, task_id)
    if db_task:
        db_task.status = status
        db.commit()
        db.refresh(db_task)
    return db_task

def assign_task(db: Session, task_id: str, user_id: str):
    db_task = get_task(db, task_id)
    if db_task:
        db_task.assigned_user_id = user_id
        db.commit()
        db.refresh(db_task)
    return db_task

# Channel & Message CRUD
def get_channel(db: Session, channel_id: str):
    return db.query(models.Channel).filter(models.Channel.channel_id == channel_id).first()

def get_channel_by_task(db: Session, task_id: str):
    return db.query(models.Channel).filter(models.Channel.attached_task_id == task_id).first()

def create_channel(db: Session, channel: schemas.ChannelCreate):
    db_channel = models.Channel(
        attached_task_id=channel.attached_task_id,
        channel_type=channel.channel_type
    )
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

def get_messages(db: Session, channel_id: str, limit: int = 100):
    return db.query(models.Message).filter(
        models.Message.channel_id == channel_id
    ).order_by(models.Message.created_at.asc()).limit(limit).all()

def create_message(db: Session, message: schemas.MessageCreate, sender_id: str):
    db_message = models.Message(
        channel_id=message.channel_id,
        sender_id=sender_id,
        content=message.content,
        is_code_snippet=message.is_code_snippet
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# Capability CRUD
def get_capabilities(db: Session):
    return db.query(models.Capability).all()

def get_user_capabilities(db: Session, user_id: str):
    return db.query(models.UserCapability).filter(models.UserCapability.user_id == user_id).all()

def upsert_user_capability(db: Session, user_id: str, capability_id: str, is_granted: bool):
    uc = db.query(models.UserCapability).filter(
        models.UserCapability.user_id == user_id,
        models.UserCapability.capability_id == capability_id
    ).first()
    if uc:
        uc.is_granted = is_granted
    else:
        uc = models.UserCapability(user_id=user_id, capability_id=capability_id, is_granted=is_granted)
        db.add(uc)
    db.commit()
    db.refresh(uc)
    return uc

def delete_user_capability(db: Session, user_id: str, capability_id: str):
    uc = db.query(models.UserCapability).filter(
        models.UserCapability.user_id == user_id,
        models.UserCapability.capability_id == capability_id
    ).first()
    if uc:
        db.delete(uc)
        db.commit()
        return True
    return False
