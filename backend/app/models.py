import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    totp_secret = Column(String(255), nullable=True)
    role_tier = Column(Integer, default=4)  # 1: Exec, 2: Dir, 3: Lead, 4: Exec
    department_id = Column(String(255), nullable=True)
    current_status = Column(String(50), default="Active")

    # Relationships
    tasks = relationship("Task", back_populates="assigned_user")
    messages = relationship("Message", back_populates="sender")
    capabilities = relationship("UserCapability", back_populates="user", cascade="all, delete-orphan")

class Capability(Base):
    __tablename__ = "capabilities"

    capability_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)

class UserCapability(Base):
    __tablename__ = "user_capabilities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    capability_id = Column(String(36), ForeignKey("capabilities.capability_id", ondelete="CASCADE"), nullable=False)
    is_granted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="capabilities")
    capability = relationship("Capability")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="Active")

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False)
    assigned_user_id = Column(String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Backlog")  # 'Backlog', 'Assigned', 'In Progress', 'Blocked', 'Review', 'QA', 'Deployed', 'Done'

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")
    channels = relationship("Channel", back_populates="task", cascade="all, delete-orphan")

class Channel(Base):
    __tablename__ = "channels"

    channel_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attached_task_id = Column(String(36), ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=True)
    channel_type = Column(String(50), nullable=False)  # 'Task', 'Epic', 'Blocker_Beacon'

    # Relationships
    task = relationship("Task", back_populates="channels")
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    message_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(36), ForeignKey("channels.channel_id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    is_code_snippet = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    channel = relationship("Channel", back_populates="messages")
    sender = relationship("User", back_populates="messages")
