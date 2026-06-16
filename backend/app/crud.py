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

def update_user_password(db: Session, email: str, new_password: str):
    from app.auth import hash_password
    db_user = get_user_by_email(db, email)
    if db_user:
        db_user.hashed_password = hash_password(new_password)
        db_user.current_status = "Active"
        db.commit()
        db.refresh(db_user)
    return db_user

def create_user(db: Session, user: schemas.UserCreate):
    from app.auth import hash_password
    import uuid
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        role_tier=user.role_tier,
        department_id=user.department_id,
        current_status=user.current_status,
        department=user.department,
        sub_department=user.sub_department,
        functional_role=user.functional_role,
        specialization=user.specialization,
        seniority_level=user.seniority_level,
        user_type=user.user_type,
        hashed_password=hash_password(uuid.uuid4().hex)
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

def update_user_metadata(db: Session, user_id: str, metadata: schemas.UserAdminUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        if metadata.department is not None:
            db_user.department = metadata.department
        if metadata.sub_department is not None:
            db_user.sub_department = metadata.sub_department
        if metadata.functional_role is not None:
            db_user.functional_role = metadata.functional_role
        if metadata.specialization is not None:
            db_user.specialization = metadata.specialization
        if metadata.seniority_level is not None:
            db_user.seniority_level = metadata.seniority_level
        if metadata.user_type is not None:
            db_user.user_type = metadata.user_type
        if metadata.current_status is not None:
            db_user.current_status = metadata.current_status
        db.commit()
        db.refresh(db_user)
    return db_user

# Project CRUD
def get_projects(db: Session):
    return db.query(models.Project).all()

def get_project(db: Session, project_id: str):
    return db.query(models.Project).filter(models.Project.project_id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    # Synchronize client_id and client_ids
    c_id = project.client_id
    c_ids = project.client_ids or []
    if c_ids and not c_id:
        c_id = c_ids[0]
    elif c_id and not c_ids:
        c_ids = [c_id]

    db_project = models.Project(
        title=project.title, 
        status=project.status, 
        client_id=c_id,
        client_ids=c_ids,
        deadline=project.deadline,
        worker_type=project.worker_type,
        assigned_user_id=project.assigned_user_id,
        assigned_group_id=project.assigned_group_id,
        department=project.department,
        pipeline=project.pipeline,
        timeline=project.timeline
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_data: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    if db_project:
        if project_data.title is not None:
            db_project.title = project_data.title
        if project_data.status is not None:
            db_project.status = project_data.status
        
        # Synchronize client_id and client_ids on update
        if project_data.client_ids is not None:
            db_project.client_ids = project_data.client_ids
            if project_data.client_ids and len(project_data.client_ids) > 0:
                db_project.client_id = project_data.client_ids[0]
            else:
                db_project.client_id = None
        elif project_data.client_id is not None:
            db_project.client_id = project_data.client_id if project_data.client_id != "" else None
            db_project.client_ids = [project_data.client_id] if project_data.client_id != "" else []
        elif "client_id" in project_data.model_fields_set:
            db_project.client_id = project_data.client_id if project_data.client_id != "" else None
            db_project.client_ids = [project_data.client_id] if project_data.client_id != "" else []
        
        if project_data.deadline is not None:
            db_project.deadline = project_data.deadline
        if project_data.worker_type is not None:
            db_project.worker_type = project_data.worker_type
        if project_data.assigned_user_id is not None:
            db_project.assigned_user_id = project_data.assigned_user_id if project_data.assigned_user_id != "" else None
        if project_data.assigned_group_id is not None:
            db_project.assigned_group_id = project_data.assigned_group_id if project_data.assigned_group_id != "" else None
        if project_data.department is not None:
            db_project.department = project_data.department if project_data.department != "" else None
        if project_data.pipeline is not None:
            db_project.pipeline = project_data.pipeline
        if project_data.timeline is not None:
            db_project.timeline = project_data.timeline
            
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
        assigned_user_id=task.assigned_user_id,
        due_date=task.due_date,
        priority=task.priority or "Medium",
        industry_meta=task.industry_meta or {}
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

def create_task_with_channel(db: Session, task_data: schemas.TaskCreate, user_id: str):
    task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        project_id=task_data.project_id,
        assigned_user_id=task_data.assigned_user_id or user_id,
        industry_meta=getattr(task_data, "industry_meta", {}),
        priority=getattr(task_data, "priority", "Medium"),
        due_date=getattr(task_data, "due_date", None)
    )
    db.add(task)
    db.flush()
    
    channel = models.Channel(
        attached_task_id=task.task_id,
        channel_type='Task'
    )
    db.add(channel)
    db.commit()
    db.refresh(task)
    return task

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

def create_message(
    db: Session,
    channel_id: str,
    sender_id: str,
    content: str = None,
    is_code_snippet: bool = False
):
    if not isinstance(channel_id, str):
        # Support old signature: (db, message_schema, sender_id)
        msg_obj = channel_id
        actual_channel_id = msg_obj.channel_id
        actual_sender_id = sender_id
        actual_content = msg_obj.content
        actual_is_code_snippet = msg_obj.is_code_snippet
    else:
        actual_channel_id = channel_id
        actual_sender_id = sender_id
        actual_content = content
        actual_is_code_snippet = is_code_snippet

    db_message = models.Message(
        channel_id=actual_channel_id,
        sender_id=actual_sender_id,
        content=actual_content,
        is_code_snippet=actual_is_code_snippet
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

def delete_user(db: Session, user_id: str) -> bool:
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def evaluate_lead_maturity(lead: models.Lead) -> str:
    has_contact = lead.contact_email is not None and lead.contact_email.strip() != ""
    is_verified = lead.email_verification_status == "valid"
    has_identity = lead.client_name is not None and lead.client_name.strip() != ""
    has_project = lead.project_title is not None and lead.project_title.strip() != ""
    
    if has_contact and is_verified and has_identity and has_project:
        return "mature"
    return "immature"

def create_lead(db: Session, lead_data: schemas.IncomingWebhookPayload):
    payload_dict = lead_data.model_dump() if hasattr(lead_data, "model_dump") else lead_data.dict()
    raw_payload = payload_dict.get("raw_payload") or payload_dict.get("data") or payload_dict
    normalized_data = payload_dict.get("normalized_data") or {}
    
    contact_email = normalized_data.get("contact_email") or raw_payload.get("contact_email")
    contact_person = normalized_data.get("contact_person") or raw_payload.get("contact_person")
    linkedin = normalized_data.get("linkedin_url") or raw_payload.get("linkedin_url")

    db_lead = models.Lead(
        source=lead_data.source,
        raw_payload=raw_payload,
        normalized_data=normalized_data,
        status="New",
        client_name=normalized_data.get("name"),
        project_title=normalized_data.get("industry") or raw_payload.get("title"),
        contact_email=contact_email,
        email_verification_status=normalized_data.get("email_verification_status") or "unknown",
        phone=normalized_data.get("phone"),
        website_url=normalized_data.get("website_url") or normalized_data.get("url"),
        apollo_id=normalized_data.get("apollo_id"),
        contact_person_name=contact_person,
        linkedin_url=linkedin
    )
    db_lead.maturity_status = evaluate_lead_maturity(db_lead)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

def get_leads(db: Session):
    return db.query(models.Lead).order_by(models.Lead.created_at.desc()).all()

def get_lead(db: Session, lead_id: str):
    return db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()

def update_lead_status(db: Session, lead_id: str, status: str):
    db_lead = get_lead(db, lead_id)
    if db_lead:
        db_lead.status = status
        db.commit()
        db.refresh(db_lead)
    return db_lead

def assign_lead(db: Session, lead_id: str, user_id: str):
    db_lead = get_lead(db, lead_id)
    if db_lead:
        db_lead.assigned_to = user_id if user_id != "" else None
        db.commit()
        db.refresh(db_lead)
    return db_lead

def create_manual_lead(db: Session, lead_data: schemas.LeadManualCreate):
    db_lead = models.Lead(
        source=lead_data.source,
        raw_payload={
            "budget": lead_data.budget,
            "description": lead_data.description
        },
        normalized_data={
            "name": lead_data.name,
            "industry": lead_data.industry,
            "url": lead_data.url,
            "contact_email": lead_data.contact_email,
            "contact_person": lead_data.contact_person_name,
            "phone": lead_data.phone
        },
        status="New",
        client_name=lead_data.name,
        project_title=lead_data.industry,
        website_url=lead_data.url,
        contact_email=lead_data.contact_email,
        contact_person_name=lead_data.contact_person_name,
        phone=lead_data.phone,
        email_verification_status=lead_data.email_verification_status or "unknown"
    )
    db_lead.maturity_status = evaluate_lead_maturity(db_lead)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

def create_work_log(db: Session, log_data: schemas.WorkLogCreate, user_id: str):
    db_log = models.WorkLog(
        user_id=user_id,
        task_id=log_data.task_id,
        hours_spent=log_data.hours_spent,
        description=log_data.description
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# Group CRUD
def get_groups(db: Session):
    return db.query(models.Group).all()

def get_group(db: Session, group_id: str):
    return db.query(models.Group).filter(models.Group.group_id == group_id).first()

def create_group(db: Session, group: schemas.GroupCreate):
    import uuid
    db_group = models.Group(
        group_id=str(uuid.uuid4()),
        name=group.name,
        description=group.description,
        project_id=group.project_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def update_group(db: Session, group_id: str, group_data: schemas.GroupUpdate):
    db_group = get_group(db, group_id)
    if db_group:
        if group_data.name is not None:
            db_group.name = group_data.name
        if group_data.description is not None:
            db_group.description = group_data.description
        if group_data.project_id is not None:
            db_group.project_id = group_data.project_id if group_data.project_id else None
        db.commit()
        db.refresh(db_group)
    return db_group

def delete_group(db: Session, group_id: str):
    db_group = get_group(db, group_id)
    if db_group:
        db.delete(db_group)
        db.commit()
        return True
    return False

# Group Membership CRUD
def get_group_members(db: Session, group_id: str):
    return db.query(models.UserGroup).filter(models.UserGroup.group_id == group_id).all()

def add_user_to_group(db: Session, group_id: str, member: schemas.UserGroupCreate):
    import uuid
    # Check if already in group
    existing = db.query(models.UserGroup).filter(
        models.UserGroup.group_id == group_id,
        models.UserGroup.user_id == member.user_id
    ).first()
    if existing:
        existing.role = member.role
        db.commit()
        db.refresh(existing)
        return existing
    db_user_group = models.UserGroup(
        id=str(uuid.uuid4()),
        group_id=group_id,
        user_id=member.user_id,
        role=member.role
    )
    db.add(db_user_group)
    db.commit()
    db.refresh(db_user_group)
    return db_user_group

def remove_user_from_group(db: Session, group_id: str, user_id: str):
    db_user_group = db.query(models.UserGroup).filter(
        models.UserGroup.group_id == group_id,
        models.UserGroup.user_id == user_id
    ).first()
    if db_user_group:
        db.delete(db_user_group)
        db.commit()
        return True
    return False


def create_proposal(db: Session, proposal: schemas.ProposalCreate):
    db_proposal = db.query(models.Proposal).filter(models.Proposal.doc_id == proposal.doc_id).first()
    if db_proposal:
        db_proposal.doc_type = proposal.doc_type
        db_proposal.doc_format = proposal.doc_format
        db_proposal.proposal_title = proposal.proposal_title
        db_proposal.client_name = proposal.client_name
        db_proposal.client_contact = proposal.client_contact
        db_proposal.client_email = proposal.client_email
        db_proposal.client_address = proposal.client_address
        db_proposal.our_company_name = proposal.our_company_name
        db_proposal.our_company_address = proposal.our_company_address
        db_proposal.our_company_email = proposal.our_company_email
        db_proposal.our_company_tax_id = proposal.our_company_tax_id
        db_proposal.currency = proposal.currency
        db_proposal.show_timeline = proposal.show_timeline
        db_proposal.apply_tax = proposal.apply_tax
        db_proposal.tax_percent = proposal.tax_percent
        db_proposal.sign_name = proposal.sign_name
        db_proposal.sign_title = proposal.sign_title
        db_proposal.sign_image = proposal.sign_image
        db_proposal.sections = proposal.sections
        db_proposal.services = proposal.services
    else:
        db_proposal = models.Proposal(
            doc_id=proposal.doc_id,
            doc_type=proposal.doc_type,
            doc_format=proposal.doc_format,
            proposal_title=proposal.proposal_title,
            client_name=proposal.client_name,
            client_contact=proposal.client_contact,
            client_email=proposal.client_email,
            client_address=proposal.client_address,
            our_company_name=proposal.our_company_name,
            our_company_address=proposal.our_company_address,
            our_company_email=proposal.our_company_email,
            our_company_tax_id=proposal.our_company_tax_id,
            currency=proposal.currency,
            show_timeline=proposal.show_timeline,
            apply_tax=proposal.apply_tax,
            tax_percent=proposal.tax_percent,
            sign_name=proposal.sign_name,
            sign_title=proposal.sign_title,
            sign_image=proposal.sign_image,
            sections=proposal.sections,
            services=proposal.services
        )
        db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

def get_proposals(db: Session):
    return db.query(models.Proposal).order_by(models.Proposal.created_at.desc()).all()

def get_proposal(db: Session, doc_id: str):
    return db.query(models.Proposal).filter(models.Proposal.doc_id == doc_id).first()

def delete_project(db: Session, project_id: str) -> bool:
    db_project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False


def create_employee_custom_log(db: Session, log_data: schemas.EmployeeCustomLogCreate, user_id: str):
    import uuid
    db_log = models.EmployeeCustomLog(
        log_id=str(uuid.uuid4()),
        user_id=user_id,
        log_content=log_data.log_content
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_employee_custom_logs(db: Session, user_id: str):
    return db.query(models.EmployeeCustomLog).filter(models.EmployeeCustomLog.user_id == user_id).order_by(models.EmployeeCustomLog.created_at.desc()).all()


def get_all_employee_custom_logs(db: Session):
    """CEO audit: return all custom logs across all users, ordered by latest first."""
    return db.query(models.EmployeeCustomLog).order_by(models.EmployeeCustomLog.created_at.desc()).all()


def create_project_remark(db: Session, project_id: str, user_id: str, remark_data: schemas.ProjectRemarkCreate):
    import uuid
    db_remark = models.ProjectRemark(
        remark_id=str(uuid.uuid4()),
        project_id=project_id,
        user_id=user_id,
        content=remark_data.content
    )
    db.add(db_remark)
    db.commit()
    db.refresh(db_remark)
    return db_remark


def get_project_remarks(db: Session, project_id: str):
    return db.query(models.ProjectRemark).filter(models.ProjectRemark.project_id == project_id).order_by(models.ProjectRemark.created_at.asc()).all()


