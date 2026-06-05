# Technical Project Context & Architecture: SEVEN Workspace Ecosystem

This document provides a comprehensive overview of the technical architecture, data model, directory structure, components, and implementation logic of the SEVEN Workspace Ecosystem.

---

## 1. System Architecture Overview

SEVEN is constructed as a decoupled client-server web application. The frontend is built on **Next.js 16 (App Router)** and coordinates user interfaces, real-time WebSocket state, and granular permission checking. The backend is a **FastAPI** application serving RESTful routes and managing active WebSocket channels, persisting database records via **SQLAlchemy ORM** to a local SQLite database (`seven.db`) or a production PostgreSQL instance.

```
       +-----------------------------------------------------------+
       |                  CLIENT-SIDE (Next.js 16)                 |
       |  Zustand Store (useSevenStore) & State Hooks              |
       +-----------------------------------------------------------+
                        /                         \
         HTTP REST Requests                        WebSocket Connection
        (JWT Auth Header)                         (Real-Time JSON Events)
                      /                             \
                     v                               v
       +--------------------+                    +------------------+
       |   FastAPI REST     |                    |   FastAPI WS     |
       |  Controllers &     |                    |  Connection      |
       |  Auth Guards       |                    |  Manager         |
       +--------------------+                    +------------------+
                     \                               /
                      \                             /
                       v                           v
                +-----------------------------------------+
                |             SQLAlchemy ORM              |
                |  (sqlite:///seven.db or PostgreSQL URL) |
                +-----------------------------------------+
```

---

## 2. Directory Structure Map

Below is a complete index of the files in the codebase, detailing their technical responsibilities.

### 2.1 Project Root
* [start_local.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/start_local.py) — Ecosystem bootstrapper. Spins up the FastAPI uvicorn backend on port 8000 and the Next.js dev server on port 3000 as concurrent child processes, passing environments down.
* [schema.sql](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/schema.sql) — PostgreSQL reference schema defining strict tables, custom ENUMs, and relationships.
* [deploy.txt](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/deploy.txt) — Simplistic execution command record.
* [PRD.md](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/PRD.md) — Product Requirements Document mapping capabilities and user roles.

### 2.2 Backend Directory (`/backend`)
* [requirements.txt](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/requirements.txt) — Python dependencies list (FastAPI, SQLAlchemy, PyJWT, PyOTP, passlib, etc.).
* [create_admin.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/create_admin.py) — CLI utility to provision the initial Tier 1 Executive Admin. Prompts for details, generates TOTP secret, outputs ASCII QR code, and verifies the first code.
* [seed_capabilities.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/seed_capabilities.py) — Inserts default system capability tokens (`dev:override_blocker`, `admin:manage_users`, `strategy:view_matrix`) into the database.
* [supabase_schema.sql](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/supabase_schema.sql) — Production PostgreSQL schema mapping tables with Row Level Security (RLS) policies.
* `seven.db` — SQLite database file (generated automatically upon start).
* `venv/` — Virtual environment containing local python packages.

#### `/backend/app`
* [database.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/database.py) — Database connection manager. Evaluates the `DATABASE_URL` environment variable; if absent, falls back to SQLite (`seven.db`) and injects connection parameters like `check_same_thread=False` for thread safety.
* [models.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/models.py) — Core SQLAlchemy models mapping schema tables (Users, Projects, Tasks, Channels, Messages, Capabilities, UserCapabilities).
* [schemas.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/schemas.py) — Pydantic serialization models representing request inputs, API response models, and consolidated dashboards.
* [crud.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/crud.py) — DB interaction queries handling user management, task lifecycles, and capability override records.
* [auth.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/auth.py) — Security logic containing password hashing (bcrypt), JWT generation/signing, and TOTP key verification.
* [main.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/main.py) — The FastAPI main execution entrypoint. Handles REST routes, dependency-injection auth checks, capability-guards, and WebSocket connection/broadcast routing.

### 2.3 Frontend Directory (`/frontend`)
* [package.json](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/package.json) — Node.js configuration mapping Next.js 16, React 19, Zustand, Framer Motion, and Tailwind CSS.
* [AGENTS.md](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/AGENTS.md) — Custom agent rules regarding Next.js 16 breaking changes.
* [tsconfig.json](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/tsconfig.json) — TS settings.

#### `/frontend/src`
* `store/`
  * [useSevenStore.ts](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/store/useSevenStore.ts) — Consolidated Zustand store. Manages state for:
    * *Session State:* User profiles, JWT token storage, loading, and auth verification.
    * *WebSocket State:* Socket connections, connection listeners, activity log ledger.
    * *Admin State:* User profiles list, global capability list, toggling override statuses.
* `hooks/`
  * [useHasCapability.ts](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/hooks/useHasCapability.ts) — Essential client-side security hook. Inspects user profile and granular capabilities to resolve whether a client-side layout should grant access to a component.
* `components/`
  * [Sidebar.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/Sidebar.tsx) — Main navigation panel rendering links based on role authorization tier.
  * [AdminDashboard.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/AdminDashboard.tsx) — Analytics overview for Tier 1 Executives, displaying tasks, velocity, blockers list, and admin controls.
  * [DeveloperDashboard.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/DeveloperDashboard.tsx) — Focused portal for Tier 4 Execution devs, showing assigned tasks, and focus widgets.
  * `workspace/`
    * [ActivityLedger.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/workspace/ActivityLedger.tsx) — Terminal-style stream of real-time workspace actions.
    * [AdminOverrideDrawer.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/workspace/AdminOverrideDrawer.tsx) — Interactive slider managing capability overrides.
    * [BlockerBeacon.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/workspace/BlockerBeacon.tsx) — Overlay widget alerting team to blocked items.
    * [ContextChat.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/workspace/ContextChat.tsx) — Task-associated chat panel.
    * [SystemBroadcastOverlay.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/components/workspace/SystemBroadcastOverlay.tsx) — Global warning overlay parsing capability access constraints.
    * `Tier*View.tsx` — Custom view layouts based on user tiers.
* `app/`
  * [globals.css](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/app/globals.css) — Custom styling parameters including dark mode configurations.
  * [layout.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/app/layout.tsx) — Root layout initializing styles and page viewport.
  * [page.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/app/page.tsx) — Dynamic root handler. Redirects to `/login` or `/workspace` depending on JWT existence.
  * `login/page.tsx` — Login landing page verifying passwords and TOTP codes.
  * `workspace/`
    * [layout.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/app/workspace/layout.tsx) — Secure layout bootstrapper. Hydrates store profile, hooks up real-time websocket, manages sidebar links.
    * [page.tsx](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/frontend/src/app/workspace/page.tsx) — Renders either `AdminDashboard` or `DeveloperDashboard` depending on User tier.
    * `admin/page.tsx` — Admin panel housing the capability matrix grid.

---

## 3. Core Technical Architectures

### 3.1 Authentication & Security Lifecycle

```
[User] --(Enters Email/Password/TOTP)--> [Login Page]
                                               |
                                        (POST /api/auth/login)
                                               |
                                               v
                                      [FastAPI backend]
                                               |
                                     (Verify password-hash)
                                     (Check & verify TOTP)
                                               |
         <--[Returns access_token & User JSON]--+
         |
    (Writes to LocalStorage)
         |
         v
[Workspace Layout Load]
         |
    (Reads Token) ---> (Headers: Bearer JWT) ---> [FastAPI /api/auth/users]
```

### 3.2 Granular Capability Inheritance vs. Overrides

The security model implements standard role-tier permission levels, but permits administrators to bypass inheritance via explicit capability entries in the database.

```
                  +----------------------------------+
                  |  Evaluate useHasCapability(token) |
                  +----------------------------------+
                                    |
                    Does user have explicit override in 
                  user_capabilities table for this token?
                                   / \
                                 Yes  No
                                 /     \
            Evaluate Override value     Is user Role Tier == 1 (Admin)?
            [is_granted == True/False]                 / \
                       |                             Yes  No
                       v                             /     \
             Return override value             Return True   Check default matrix:
                                                             - dev:override_blocker (Tier <= 3)
                                                             - admin:manage_users (Tier == 1)
                                                             - strategy:view_matrix (Tier <= 2)
```

**FastAPI Guard implementation** (`require_capability` in [main.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/main.py#L34-L59)):
* Intercepts incoming requests.
* Queries `UserCapability` joined with `Capability` mapping `user_id` and `token`.
* If a record exists: returns user if `is_granted` is True, else raises HTTP 403.
* If no record exists: falls back to Role Tier matching rules (e.g., Tier 1 has absolute access, Tier 4 cannot execute blocker overrides).

### 3.3 Real-time WebSocket Protocol

FastAPI maintains active sockets via a connection dictionary inside the class `ConnectionManager`. When any data change API path is hit, a WebSocket broadcast dispatches events to all active terminals.

#### Main Broadcast Payloads Structure:

1. **User Status Changed:**
   ```json
   {
     "type": "user_status_changed",
     "user_id": "97e68205-...",
     "status": "Blocked"
   }
   ```
2. **Task Updated:**
   ```json
   {
     "type": "task_updated",
     "task": {
       "task_id": "4b92b6a...",
       "title": "Fix Memory Leaks",
       "status": "Blocked",
       "project_id": "...",
       "assigned_user": { "full_name": "Dev User", "role_tier": 4 }
     }
   }
   ```
3. **Blocker Beacon Activated:**
   ```json
   {
     "type": "blocker_beacon",
     "task_id": "4b92b6a...",
     "user_id": "97e68205-...",
     "message": "Blocker Beacon activated by Dev User on: 'Fix Memory Leaks'"
   }
   ```
4. **System Broadcast Warning:**
   ```json
   {
     "type": "system_broadcast",
     "sender": "Exec Administrator",
     "message": "Immediate security audits scheduled at 1800 hrs.",
     "target_capability": "strategy:view_matrix"
   }
   ```
