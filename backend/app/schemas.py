from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Token Schemas for Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role_tier: Optional[int] = None

# Capability Schemas
class CapabilityBase(BaseModel):
    token: str
    description: Optional[str] = None
    category: Optional[str] = None

class CapabilityResponse(CapabilityBase):
    capability_id: str

    class Config:
        from_attributes = True

class UserCapabilityBase(BaseModel):
    is_granted: bool

class UserCapabilityCreate(UserCapabilityBase):
    user_id: str
    capability_id: str

class UserCapabilityUpdate(UserCapabilityBase):
    pass

class UserCapabilityResponse(UserCapabilityBase):
    id: str
    user_id: str
    capability: CapabilityResponse

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    full_name: str
    email: str
    role_tier: int = 4
    department_id: Optional[str] = None
    current_status: str = "Active"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    totp_code: Optional[str] = None

class UserUpdateStatus(BaseModel):
    current_status: str

class UserResponse(UserBase):
    user_id: str

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    status: str = "Active"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: str

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Backlog"  # 'Backlog', 'Assigned', 'In Progress', 'Blocked', 'Review', 'QA', 'Deployed', 'Done'
    project_id: str
    assigned_user_id: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Backlog"
    project_id: str
    assigned_user_id: Optional[str] = None

class TaskUpdateStatus(BaseModel):
    status: str

class TaskResponse(TaskBase):
    task_id: str
    project: Optional[ProjectResponse] = None
    assigned_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    content: str
    is_code_snippet: bool = False

class MessageCreate(MessageBase):
    channel_id: str

class MessageResponse(BaseModel):
    message_id: str
    channel_id: str
    sender_id: Optional[str] = None
    content: str
    is_code_snippet: bool
    created_at: datetime
    sender: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Channel Schemas
class ChannelBase(BaseModel):
    attached_task_id: Optional[str] = None
    channel_type: str  # 'Task', 'Epic', 'Blocker_Beacon'

class ChannelCreate(ChannelBase):
    pass

class ChannelResponse(ChannelBase):
    channel_id: str
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# Aggregated Dashboard Response
class DeveloperDashboardResponse(BaseModel):
    user: UserResponse
    tasks: List[TaskResponse]

class AdminDashboardResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    blocked_tasks: int
    velocity_rate: float  # Deployed/Done tasks ratio
    active_blockers: List[TaskResponse]
    all_tasks: List[TaskResponse]
