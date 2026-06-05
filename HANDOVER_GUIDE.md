# Workspace Transition & Handover Guide: SEVEN Ecosystem

This document serves as the guide for system administrators, incoming developers, or operations personnel shifting the SEVEN Workspace Ecosystem codebase to a new workspace, machine, or hosting server.

---

## 1. Prerequisites Checklist

Ensure the target machine has the following tools installed and accessible via system paths before beginning the setup:

* **Python:** version `3.10` or higher (verify via `python --version`)
* **Node.js:** version `18.x` or `20.x` (verify via `node --version`)
* **NPM:** version `9.x` or higher (verify via `npm --version`)
* **Git:** (verify via `git --version`)
* **PostgreSQL:** (Optional: only required if migrating from local SQLite to PostgreSQL production environment)

---

## 2. Step-by-Step New Workspace Setup

Follow this sequence to download, initialize, and execute the workspace ecosystem.

### Step 2.1: Clone/Copy the Codebase
Transfer the project directory containing `/backend` and `/frontend` directories, along with the helper scripts. Ensure you do not transfer target-specific venv directories or node modules.

```bash
# Verify directory structure matches:
# - backend/
# - frontend/
# - start_local.py
# - seed_capabilities.py
# - create_admin.py
```

### Step 2.2: Setup the Python Backend Environment

1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```

2. Create a clean virtual environment:
   ```bash
   # Windows
   python -m venv venv
   
   # macOS / Linux
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   .\venv\Scripts\activate.bat
   
   # macOS / Linux Terminal
   source venv/bin/activate
   ```

4. Install the backend dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

### Step 2.3: Initialize and Seed the Database

By default, the backend falls back to SQLite (`seven.db` in `/backend`) if no `DATABASE_URL` is set in the environment.

1. **Seed Baseline Capabilities:**
   This writes default capability records (`dev:override_blocker`, `admin:manage_users`, etc.) into the database.
   ```bash
   python seed_capabilities.py
   ```

2. **Provision the Master Executive Admin:**
   Run the interactive script to create the Tier 1 Admin.
   ```bash
   python create_admin.py
   ```
   * **Full Name:** Enter the user's name.
   * **Admin Email:** Enter their email (this will be the login username).
   * **Password:** Enter a strong password (hidden inputs).
   * **2FA Setup:** The script outputs a QR code inside your shell window. Scan this using Google Authenticator, Duo, or Microsoft Authenticator.
   * **Verification:** Enter the current 6-digit code shown on the authenticator app to authorize and database-commit the Master Admin user.

> [!WARNING]
> **Clock Drift Alert:** If the `create_admin.py` verification fails repeatedly despite entering the correct 6-digit code, verify that the target machine's system time is accurately synchronized with internet time servers. Even a 30-second drift will cause TOTP validation to fail.

### Step 2.4: Setup the Next.js Frontend

1. Navigate to the `/frontend` folder:
   ```bash
   cd ../frontend
   ```

2. Install the required Node packages:
   ```bash
   npm install
   ```

3. **Verify Environment Variables:**
   Create or edit the local environment file: `frontend/.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
   Ensure the API URL points to the running backend service.

---

## 3. Launching the Workspace Ecosystem

SEVEN contains a master orchestrator python script in the root directory: [start_local.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/start_local.py).

To execute the entire workspace, run the following command from the root directory:

```bash
# Windows / macOS / Linux
python start_local.py
```

### Script Execution Log Details:
1. Bootstraps the FastAPI backend on port `8000`.
2. Connects to `seven.db` (SQLite file).
3. Bootstraps Next.js frontend in development mode on port `3000`.
4. Console will print:
   * **Frontend Interface:** `http://localhost:3000`
   * **Backend REST API:** `http://localhost:8000`
5. Pressing `Ctrl + C` in the terminal triggers a cleanup handler, safely terminating both child processes and freeing ports.

---

## 4. Production Workspace Migration (PostgreSQL / Supabase)

If moving from local testing (SQLite) to production database hosting:

### Step 4.1: Target PostgreSQL Schema Initialization
Connect to your target PostgreSQL database (e.g., hosted on Supabase, AWS RDS, or Render) and run the initialization commands inside:
* Local Schema: [schema.sql](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/schema.sql)
* Production/Supabase Schema: [supabase_schema.sql](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/supabase_schema.sql)

### Step 4.2: Update Environment Variables
Configure the backend server running environment variables:
```bash
# Windows
$env:DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Linux / macOS
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```
FastAPI automatically intercepts this variable on startup ([database.py](file:///c:/Users/ABHINAV/Documents/Workspace/Development/The-Seven/backend/app/database.py#L6-L19)) and bypasses SQLite connectivity in favor of PostgreSQL.

---

## 5. Git & GitHub Handover Instructions

When storing or handing over this project via GitHub:

### Step 5.1: Verify `.gitignore` Settings
Ensure sensitive files are ignored to avoid leaking local credentials.
Verify `/frontend/.gitignore` contains:
```text
.env.local
.next/
node_modules/
```
Verify `/backend/.gitignore` (or root `.gitignore`) contains:
```text
seven.db
venv/
__pycache__/
*.pyc
```

### Step 5.2: Re-align Git Remote
If pushing to a new repository or shifting ownership:
```bash
# Check current origin
git remote -v

# Update remote address to the new owner/repository
git remote set-url origin https://github.com/new-user/The-Seven.git

# Verify remote changes
git remote -v

# Stage, commit, and push files
git add .
git commit -m "docs: generate full system context and handover documentation"
git push -u origin main
```

---

## 6. Ecosystem Verification Checklist

To confirm a successful workspace installation, run through these testing validations:

* **[ ] Setup Check:** Confirm virtual environment compiles without error and `npm install` finishes cleanly.
* **[ ] Database Seeding:** Run `python seed_capabilities.py` and confirm baseline tokens insert without warnings.
* **[ ] Admin Enrollment:** Run `python create_admin.py`, generate QR, and complete registration with authentication app.
* **[ ] Launch Verification:** Run `python start_local.py`. Confirm servers run on `localhost:3000` and `localhost:8000` simultaneously.
* **[ ] Login flow:** Browse to `localhost:3000/login`. Fill out admin details and submit a valid TOTP token. Verify redirect to the Admin Dashboard.
* **[ ] WebSocket Bindings:** Open developer console (F12) in chrome/firefox. Logins must print `[WS] Connected to SEVEN Ecosystem` indicating successful websocket binding.
* **[ ] Real-time updates:** Open two browser windows side-by-side:
  * Window A: Logged in as Master Admin.
  * Window B: Logged in as a newly created Developer.
  * Create a task in Window A. Verify it instantly renders in the Kanban board of Window B without reloading.
* **[ ] Blocker Beacon Trigger:** As Developer, move a task status to "Blocked". Validate that both browser windows immediately pop up the system-wide Blocker Beacon alert with warning styling.
* **[ ] Revocation verification:** In the Admin Dashboard override drawer, revoke the `dev:override_blocker` capability for the developer. Attempt to drag/resolve the blocker on the developer window; verify it displays an authorization denial toast.
* **[ ] Terminate Link:** Click "TERMINATE LINK" on the sidebar. Verify local session parameters are removed and you are redirected to `/login`.
