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
    department: Optional[str] = None
    sub_department: Optional[str] = None
    functional_role: Optional[str] = None
    specialization: Optional[str] = None
    seniority_level: Optional[str] = None
    user_type: Optional[str] = "Employee"

class UserAdminUpdate(BaseModel):
    department: Optional[str] = None
    sub_department: Optional[str] = None
    functional_role: Optional[str] = None
    specialization: Optional[str] = None
    seniority_level: Optional[str] = None
    user_type: Optional[str] = None

class UserCreate(UserBase):
    pass


class UserLogin(BaseModel):
    email: str
    password: str
    totp_code: Optional[str] = None

class SetupPassword(BaseModel):
    token: str
    new_password: str

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
    deadline: Optional[datetime] = None
    worker_type: Optional[str] = None
    assigned_user_id: Optional[str] = None
    assigned_group_id: Optional[str] = None
    department: Optional[str] = None
    pipeline: Optional[list] = None
    timeline: Optional[list] = None

class ProjectCreate(ProjectBase):
    client_id: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    client_id: Optional[str] = None
    deadline: Optional[datetime] = None
    worker_type: Optional[str] = None
    assigned_user_id: Optional[str] = None
    assigned_group_id: Optional[str] = None
    department: Optional[str] = None
    pipeline: Optional[list] = None
    timeline: Optional[list] = None

class ProjectResponse(ProjectBase):
    project_id: str
    client_id: Optional[str] = None
    created_at: datetime

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

Message = MessageResponse

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

class DashboardOverview(BaseModel):
    active_projects: Optional[List[ProjectResponse]] = None
    assigned_tasks: Optional[List[TaskResponse]] = None
    department_blockers: Optional[List[TaskResponse]] = None
    system_metrics: Optional[dict] = None

    class Config:
        from_attributes = True

class IncomingWebhookPayload(BaseModel):
    source: str
    data: Optional[dict] = None

    class Config:
        extra = "allow"

class WorkLogCreate(BaseModel):
    task_id: str
    hours_spent: float
    description: Optional[str] = None

class WorkLogResponse(BaseModel):
    log_id: str
    user_id: str
    task_id: str
    date_logged: datetime
    hours_spent: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Group Schemas
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_id: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[str] = None

class UserGroupBase(BaseModel):
    user_id: str
    role: str = "Member"

class UserGroupCreate(UserGroupBase):
    pass

class GroupResponse(GroupBase):
    group_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserGroupResponse(BaseModel):
    id: str
    user_id: str
    group_id: str
    role: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True

# Lead Schemas
class LeadResponse(BaseModel):
    lead_id: str
    source: str
    raw_payload: Optional[dict] = None
    normalized_data: Optional[dict] = None

    # New Enrichment Fields
    client_name: Optional[str] = None
    project_title: Optional[str] = None
    contact_email: Optional[str] = None
    email_verification_status: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    apollo_id: Optional[str] = None

    status: str
    assigned_to: Optional[str] = None
    created_at: datetime

    # Lead Maturity & Enrichment State Tracking
    maturity_status: Optional[str] = "immature"
    enrichment_attempts: Optional[int] = 0
    last_enrichment_error: Optional[str] = None
    contact_person_name: Optional[str] = None
    linkedin_url: Optional[str] = None

    class Config:
        from_attributes = True

class LeadUpdateStatus(BaseModel):
    status: str

class LeadAssign(BaseModel):
    assigned_to: Optional[str] = None

class LeadManualCreate(BaseModel):
    source: str
    name: str
    industry: str
    budget: Optional[str] = "Not Specified"
    url: Optional[str] = ""
    description: Optional[str] = ""
    contact_email: Optional[str] = None
    contact_person_name: Optional[str] = None
    phone: Optional[str] = None
    email_verification_status: Optional[str] = "unknown"

class LeadUpdateContact(BaseModel):
    contact_person_name: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    client_name: Optional[str] = None
    project_title: Optional[str] = None

# Enrichment and Scrape schemas
class ApolloPullRequest(BaseModel):
    query: str
    location: Optional[str] = None
    limit: Optional[int] = 10

class HunterFindRequest(BaseModel):
    domain: str
    first_name: str
    last_name: str

class SnovVerifyRequest(BaseModel):
    email: str

class ScrapeRunRequest(BaseModel):
    target_urls: List[str]
    depth: Optional[int] = 1

class ProposalCreate(BaseModel):
    doc_id: str
    doc_type: str = "single"
    doc_format: str = "proposal"
    proposal_title: str
    client_name: Optional[str] = None
    client_contact: Optional[str] = None
    client_email: Optional[str] = None
    client_address: Optional[str] = None
    our_company_name: Optional[str] = None
    our_company_address: Optional[str] = None
    our_company_email: Optional[str] = None
    our_company_tax_id: Optional[str] = None
    currency: str = "USD"
    show_timeline: bool = False
    apply_tax: bool = False
    tax_percent: float = 18.0
    sign_name: Optional[str] = None
    sign_title: Optional[str] = None
    sign_image: Optional[str] = None
    sections: Optional[list] = None
    services: Optional[list] = None

class ProposalResponse(ProposalCreate):
    created_at: datetime

    class Config:
        from_attributes = True
