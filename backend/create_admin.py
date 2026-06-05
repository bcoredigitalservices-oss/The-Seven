import os
import sys
import getpass
import pyotp
import qrcode
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User
from app.auth import hash_password

def create_admin():
    print("==================================================")
    print("  SEVEN WORKSPACE: MASTER ADMIN SETUP")
    print("==================================================\n")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing_admin = db.query(User).filter(User.role_tier == 1).first()
    if existing_admin:
        print("[!] An Executive Admin already exists in the database.")
        print(f"    Email: {existing_admin.email}")
        sys.exit(0)

    print("[*] Creating a new Tier 1 Executive Admin...")
    
    full_name = input("Enter Full Name: ").strip()
    email = input("Enter Admin Email: ").strip()
    
    password = ""
    while True:
        password = getpass.getpass("Enter Strong Password (Hidden): ")
        if len(password) < 8:
            print("[!] Password must be at least 8 characters long.")
            continue
        confirm = getpass.getpass("Confirm Password: ")
        if password != confirm:
            print("[!] Passwords do not match. Try again.")
            continue
        break

    print("\n[*] Hashing password securely in memory...")
    hashed_pw = hash_password(password)

    print("[*] Generating TOTP (Google Authenticator) Secret...")
    totp_secret = pyotp.random_base32()
    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name=email, issuer_name="SEVEN Workspace")

    print("\n==================================================")
    print("  SCAN THIS QR CODE WITH GOOGLE AUTHENTICATOR")
    print("==================================================\n")
    
    qr = qrcode.QRCode()
    qr.add_data(totp_uri)
    qr.make(fit=True)
    qr.print_ascii()
    
    print(f"\nManual Secret Key: {totp_secret}")
    print("\n==================================================")
    
    code = input("\nEnter the 6-digit code from your app to verify: ")
    totp = pyotp.TOTP(totp_secret)
    if not totp.verify(code):
        print("[!] Invalid code. Setup aborted. Please run the script again.")
        sys.exit(1)

    print("[*] 2FA Verified! Injecting Master Admin into database...")
    admin_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_pw,
        totp_secret=totp_secret,
        role_tier=1,
        department_id="EXEC",
        current_status="Active"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print(f"\n[SUCCESS] Master Admin {email} created successfully!")
    print("You can now start the local ecosystem and log in.")

if __name__ == "__main__":
    create_admin()
