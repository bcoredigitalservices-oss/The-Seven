import json
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import logging
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth import verify_password, verify_totp, create_access_token

from app import models, schemas, crud
from app.database import engine, get_db

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    from app.auth import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = crud.get_user_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def require_capability(token: str):
    def capability_checker(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
        # Check for explicit Granular Override
        override = db.query(models.UserCapability).join(models.Capability).filter(
            models.UserCapability.user_id == current_user.user_id,
            models.Capability.token == token
        ).first()

        if override:
            if not override.is_granted:
                raise HTTPException(status_code=403, detail=f"Capability '{token}' explicitly revoked by admin.")
            return current_user # Granted by explicit override

        # Fallback to base role permissions if no override exists
        if current_user.role_tier == 1:
            return current_user # Master Admins have all capabilities
        
        # Example logic for Phase 5
        if token == "dev:override_blocker":
            # Only Leadership (Tier 1-3) can override blockers by default. Tier 4 Execution cannot unless explicitly granted.
            if current_user.role_tier > 3:
                raise HTTPException(status_code=403, detail=f"Access Denied. Missing Capability: {token}")

        return current_user

    return capability_checker

# Initialize FastAPI
app = FastAPI(title="SEVEN Core Workspace API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development. We can narrow down to http://localhost:3000 later.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database tables
models.Base.metadata.create_all(bind=engine)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Active connections for user: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected.")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting message: {message.get('type')}")
        for user_id, websockets in list(self.active_connections.items()):
            for websocket in websockets:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
                    # We will clean up disconnected sockets on disconnect events

manager = ConnectionManager()

# Automated Seed Data on Startup removed in favor of create_admin.py CLI

# WebSocket Endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    # Verify user exists
    user = crud.get_user(db, user_id)
    if not user:
        # Default or fallback connection
        logger.warning(f"WebSocket attempt by unknown user: {user_id}")
    
    await manager.connect(websocket, user_id)
    try:
        while True:
            # We listen for messages from the client.
            # Client can send client status updates, ping, or chat typing.
            data = await websocket.receive_text()
            payload = json.loads(data)
            logger.info(f"Received WS payload from {user_id}: {payload}")
            
            # Echo or process custom payload
            # If client wants to send a fast status update:
            if payload.get("type") == "update_status":
                status_val = payload.get("status")
                crud.update_user_status(db, user_id, status_val)
                # Broadcast the update
                await manager.broadcast({
                    "type": "user_status_changed",
                    "user_id": user_id,
                    "status": status_val
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        # Optionally set user status to offline
        crud.update_user_status(db, user_id, "Offline")
        await manager.broadcast({
            "type": "user_status_changed",
            "user_id": user_id,
            "status": "Offline"
        })
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

# --- REST Endpoints ---

# Authentication Endpoints
@app.post("/api/admin/users", response_model=schemas.UserResponse)
def create_admin_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role_tier != 1:
        raise HTTPException(status_code=403, detail="Only Tier 1 Executive Admins can create users")
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/auth/login")
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, login_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
        
    if user.totp_secret:
        if not login_data.totp_code:
            raise HTTPException(status_code=401, detail="TOTP_REQUIRED")
        if not verify_totp(user.totp_secret, login_data.totp_code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")
            
    access_token = create_access_token(
        data={"user_id": user.user_id, "email": user.email, "role_tier": user.role_tier}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": schemas.UserResponse.from_orm(user)}

@app.get("/api/auth/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_users(db)

# User status endpoints
@app.put("/api/users/{user_id}/status", response_model=schemas.UserResponse)
async def update_status(user_id: str, status_data: schemas.UserUpdateStatus, db: Session = Depends(get_db)):
    user = crud.update_user_status(db, user_id, status_data.current_status)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Broadcast status change
    await manager.broadcast({
        "type": "user_status_changed",
        "user_id": user_id,
        "status": status_data.current_status
    })
    return user

# Project Endpoints
@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return crud.get_projects(db)

@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, project)

# Task Endpoints
@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)

@app.post("/api/tasks", response_model=schemas.TaskResponse)
async def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    new_task = crud.create_task(db, task)
    
    # Fetch completed task schema with project/user relationships
    full_task = crud.get_task(db, new_task.task_id)
    task_schema = schemas.TaskResponse.from_orm(full_task)
    
    # Broadcast to all clients
    await manager.broadcast({
        "type": "task_created",
        "task": task_schema.dict()
    })
    return task_schema

@app.put("/api/tasks/{task_id}/status", response_model=schemas.TaskResponse)
async def update_task_status(
    task_id: str, 
    status_data: schemas.TaskUpdateStatus, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_capability("dev:override_blocker"))
):
    task = crud.update_task_status(db, task_id, status_data.status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_schema = schemas.TaskResponse.from_orm(task)
    
    # Broadcast task status update
    await manager.broadcast({
        "type": "task_updated",
        "task": task_schema.dict()
    })
    
    # If status is Blocked, we also trigger blocker beacon WebSocket message
    if status_data.status == "Blocked":
        # Make sure user status is also Blocked
        crud.update_user_status(db, task.assigned_user_id, "Blocked")
        await manager.broadcast({
            "type": "user_status_changed",
            "user_id": task.assigned_user_id,
            "status": "Blocked"
        })
        await manager.broadcast({
            "type": "blocker_beacon",
            "task_id": task_id,
            "user_id": task.assigned_user_id,
            "message": f"Blocker Beacon activated by {task.assigned_user.full_name if task.assigned_user else 'Developer'} on: '{task.title}'"
        })
        
    return task_schema

@app.put("/api/tasks/{task_id}/assign/{user_id}", response_model=schemas.TaskResponse)
async def assign_task(task_id: str, user_id: str, db: Session = Depends(get_db)):
    task = crud.assign_task(db, task_id, user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task or User not found")
    
    task_schema = schemas.TaskResponse.from_orm(task)
    await manager.broadcast({
        "type": "task_updated",
        "task": task_schema.dict()
    })
    return task_schema

# Channel & Message Endpoints
@app.get("/api/tasks/{task_id}/channel", response_model=schemas.ChannelResponse)
def get_task_channel(task_id: str, db: Session = Depends(get_db)):
    channel = crud.get_channel_by_task(db, task_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found for this task")
    return channel

@app.get("/api/channels/{channel_id}/messages", response_model=List[schemas.MessageResponse])
def get_channel_messages(channel_id: str, db: Session = Depends(get_db)):
    return crud.get_messages(db, channel_id)

@app.post("/api/messages", response_model=schemas.MessageResponse)
async def send_message(message: schemas.MessageCreate, sender_id: str, db: Session = Depends(get_db)):
    # Save to database
    db_msg = crud.create_message(db, message, sender_id)
    
    # Reload to join sender profile
    sender = crud.get_user(db, sender_id)
    msg_schema = schemas.MessageResponse.from_orm(db_msg)
    
    # Broadcast new message to channel
    await manager.broadcast({
        "type": "new_message",
        "message": msg_schema.dict()
    })
    return msg_schema

class BroadcastMessage(schemas.BaseModel):
    message: str
    target_capability: str | None = None

@app.post("/api/broadcast")
async def broadcast_message(
    broadcast: BroadcastMessage,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_capability("admin:manage_users"))
):
    await manager.broadcast({
        "type": "system_broadcast",
        "sender": current_user.full_name,
        "message": broadcast.message,
        "target_capability": broadcast.target_capability
    })
    return {"status": "success"}

# Role-Based Dashboards
@app.get("/api/dashboard/developer/{user_id}", response_model=schemas.DeveloperDashboardResponse)
def get_developer_dashboard(user_id: str, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tasks = crud.get_tasks_by_user(db, user_id)
    return schemas.DeveloperDashboardResponse(
        user=schemas.UserResponse.from_orm(user),
        tasks=[schemas.TaskResponse.from_orm(t) for t in tasks]
    )

@app.get("/api/dashboard/admin", response_model=schemas.AdminDashboardResponse)
def get_admin_dashboard(db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db)
    all_tasks = [schemas.TaskResponse.from_orm(t) for t in tasks]
    
    total = len(all_tasks)
    completed = len([t for t in all_tasks if t.status in ["Done", "Deployed"]])
    blocked = len([t for t in all_tasks if t.status == "Blocked"])
    
    velocity = (completed / total * 100) if total > 0 else 0.0
    active_blockers = [t for t in all_tasks if t.status == "Blocked"]
    
    return schemas.AdminDashboardResponse(
        total_tasks=total,
        completed_tasks=completed,
        blocked_tasks=blocked,
        velocity_rate=round(velocity, 2),
        active_blockers=active_blockers,
        all_tasks=all_tasks
    )

# Capability Endpoints
@app.get("/api/capabilities", response_model=List[schemas.CapabilityResponse])
def get_capabilities(db: Session = Depends(get_db)):
    return crud.get_capabilities(db)

@app.get("/api/users/{user_id}/capabilities", response_model=List[schemas.UserCapabilityResponse])
def get_user_capabilities(user_id: str, db: Session = Depends(get_db)):
    return crud.get_user_capabilities(db, user_id)

@app.put("/api/users/{user_id}/capabilities/{capability_id}", response_model=schemas.UserCapabilityResponse)
def upsert_user_capability(
    user_id: str, 
    capability_id: str, 
    update_data: schemas.UserCapabilityUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_capability("admin:manage_users"))
):
    return crud.upsert_user_capability(db, user_id, capability_id, update_data.is_granted)

@app.delete("/api/users/{user_id}/capabilities/{capability_id}")
def delete_user_capability(
    user_id: str, 
    capability_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_capability("admin:manage_users"))
):
    success = crud.delete_user_capability(db, user_id, capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Override not found")
    return {"status": "success"}
