# SEVEN Workspace

SEVEN is a comprehensive enterprise workspace ecosystem for B-Core Digital Services.

## Setup Instructions

### 1. Backend Setup
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. First Core User (CEO / Master Admin) Setup
To initialize the workspace and create the very first Executive Admin (Tier 1) user, use the provided CLI script. This is required because creating the first admin requires setting up Two-Factor Authentication (TOTP).

Run the following command from the `backend` directory while your virtual environment is active:
```bash
python create_admin.py
```

**Steps during the script execution:**
1. Enter the Admin's Full Name.
2. Enter the Admin's Email.
3. Provide a strong password (minimum 8 characters).
4. The script will generate a QR code in your terminal. Scan this QR code with Google Authenticator, Authy, or any standard TOTP app.
5. Enter the 6-digit code from your authenticator app to verify the setup.
6. Once verified, the Tier 1 Master Admin is securely injected into the database.

### 3. Running the Ecosystem
From the root directory, run the initialization script to boot both the FastAPI backend and the Next.js frontend:
```bash
python3 start_local.py
```
*Note: Make sure your `FRONTEND_URL`, `SMTP_*` / `RESEND_API_KEY`, and other `.env` variables are configured.*
