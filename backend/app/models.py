import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Integer, JSON, Float
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
    
    # Organizational Metadata
    department = Column(String(50), nullable=True)
    sub_department = Column(String(100), nullable=True)
    functional_role = Column(String(100), nullable=True)
    specialization = Column(String(100), nullable=True)
    seniority_level = Column(String(50), nullable=True)
    user_type = Column(String(50), default="Employee")

    # Relationships
    tasks = relationship("Task", back_populates="assigned_user")
    messages = relationship("Message", back_populates="sender")
    capabilities = relationship("UserCapability", back_populates="user", cascade="all, delete-orphan")
    work_logs = relationship("WorkLog", back_populates="user", cascade="all, delete-orphan")

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
    client_id = Column(String(36), ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)
    worker_type = Column(String(50), nullable=True)  # 'Individual', 'Group'
    assigned_user_id = Column(String(36), ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    assigned_group_id = Column(String(36), ForeignKey('groups.group_id', ondelete='SET NULL'), nullable=True)
    department = Column(String(50), nullable=True)
    pipeline = Column(JSON, nullable=True)
    timeline = Column(JSON, nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])
    assigned_group = relationship("Group", foreign_keys=[assigned_group_id])

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False)
    assigned_user_id = Column(String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Backlog")  # 'Backlog', 'Assigned', 'In Progress', 'Blocked', 'Review', 'QA', 'Deployed', 'Done'
    industry_meta = Column(JSON, default=dict)
    priority = Column(String(50), default="Medium")
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")
    channels = relationship("Channel", back_populates="task", cascade="all, delete-orphan")
    work_logs = relationship("WorkLog", back_populates="task", cascade="all, delete-orphan")

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

class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(100), nullable=False)
    raw_payload = Column(JSON, default=dict)
    normalized_data = Column(JSON, default=dict)

    # New Enrichment Fields
    client_name = Column(String(255), nullable=True) # Extracted Company
    project_title = Column(String(255), nullable=True) # Extracted Need
    contact_email = Column(String(255), nullable=True)
    email_verification_status = Column(String(50), nullable=True) # 'valid', 'invalid', etc.
    phone = Column(String(50), nullable=True)
    website_url = Column(Text, nullable=True)
    apollo_id = Column(String(255), nullable=True)

    status = Column(String(50), default="New")
    assigned_to = Column(String(36), ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Lead Maturity & Enrichment State Tracking
    maturity_status = Column(String(50), default="immature") # 'immature', 'enriching', 'mature', 'rejected'
    enrichment_attempts = Column(Integer, default=0)
    last_enrichment_error = Column(Text, nullable=True)
    contact_person_name = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    assigned_user = relationship("User")

class WorkLog(Base):
    __tablename__ = "work_logs"

    log_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    task_id = Column(String(36), ForeignKey('tasks.task_id', ondelete='CASCADE'), nullable=False)
    date_logged = Column(DateTime, default=datetime.utcnow)
    hours_spent = Column(Float, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="work_logs")
    task = relationship("Task", back_populates="work_logs")

class Group(Base):
    __tablename__ = "groups"

    group_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(String(36), ForeignKey('projects.project_id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    members = relationship("UserGroup", back_populates="group", cascade="all, delete-orphan")
    project = relationship("Project", foreign_keys=[project_id])

class UserGroup(Base):
    __tablename__ = "user_groups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    group_id = Column(String(36), ForeignKey("groups.group_id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="Member")  # 'Lead', 'Member'

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User")


class BeaconAlert(Base):
    __tablename__ = "beacon_alerts"

    beacon_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = Column(Text, nullable=False)
    target_type = Column(String(50), nullable=False)  # 'all', 'user', 'project', 'group'
    target_id = Column(String(255), nullable=True)  # user_id, project_id, group_id, or "all"
    sender_id = Column(String(36), ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=False)  # created_at + 40 minutes
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    responses = Column(JSON, default=list)  # list of replies: [{"user_id": "...", "reply": "...", "timestamp": "..."}]

    sender = relationship("User")


class MeetingSchedule(Base):
    __tablename__ = "meeting_schedules"

    meeting_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    day = Column(String(50), nullable=False)  # 'YYYY-MM-DD'
    time = Column(String(50), nullable=False)  # 'HH:MM'
    link = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    target_type = Column(String(50), nullable=True, default="all")
    target_id = Column(String(255), nullable=True)

    creator = relationship("User")


class ReminderNotification(Base):
    __tablename__ = "reminder_notifications"

    reminder_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = Column(Text, nullable=False)
    target_id = Column(String(36), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=False)  # created_at + 6 hours
    is_replied = Column(Boolean, default=False)
    replied_at = Column(DateTime, nullable=True)
    reply_content = Column(Text, nullable=True)

    target_user = relationship("User")


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    dm_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(36), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    receiver_id = Column(String(36), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    is_code_snippet = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])



class GroupMessage(Base):
    __tablename__ = "group_messages"

    gm_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String(36), ForeignKey('groups.group_id', ondelete='CASCADE'), nullable=False)
    sender_id = Column(String(36), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    is_code_snippet = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group")
    sender = relationship("User")


class SurveyForm(Base):
    __tablename__ = "survey_forms"

    survey_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_product = Column(String(255), nullable=True)
    questions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FinanceLog(Base):
    __tablename__ = "finance_logs"

    log_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # 'Investment', 'Expense', 'Salaries', 'Marketing', 'R&D', 'Operations'
    amount = Column(Float, nullable=False)
    reference = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SupportRequest(Base):
    __tablename__ = "support_requests"

    request_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    created_by_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    assigned_to_id = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    status = Column(String(50), default="Pending")  # "Pending", "Assigned", "Resolved"
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by_id])
    assignee = relationship("User", foreign_keys=[assigned_to_id])


class Proposal(Base):
    __tablename__ = "proposals"

    doc_id = Column(String(50), primary_key=True)  # Proper Ref ID: BCD-xxxxxx
    doc_type = Column(String(50), default="single")
    doc_format = Column(String(50), default="proposal")
    proposal_title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=True)
    client_contact = Column(String(255), nullable=True)
    client_email = Column(String(255), nullable=True)
    client_address = Column(Text, nullable=True)
    our_company_name = Column(String(255), nullable=True)
    our_company_address = Column(Text, nullable=True)
    our_company_email = Column(String(255), nullable=True)
    our_company_tax_id = Column(String(100), nullable=True)
    currency = Column(String(10), default="USD")
    show_timeline = Column(Boolean, default=False)
    apply_tax = Column(Boolean, default=False)
    tax_percent = Column(Float, default=18.0)
    sign_name = Column(String(255), nullable=True)
    sign_title = Column(String(255), nullable=True)
    sign_image = Column(Text, nullable=True)  # Base64 string
    sections = Column(JSON, nullable=True)
    services = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
