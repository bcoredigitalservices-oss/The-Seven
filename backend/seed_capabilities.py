import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Capability, UserCapability

def seed_capabilities():
    print("==================================================")
    print("  SEVEN WORKSPACE: SEEDING CAPABILITIES")
    print("==================================================\n")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    baseline_caps = [
        {"token": "dev:override_blocker", "description": "Can manually override and clear blocker beacons", "category": "development"},
        {"token": "admin:manage_users", "description": "Can provision and delete users", "category": "administration"},
        {"token": "strategy:view_matrix", "description": "Can view the top-level strategy matrix", "category": "leadership"}
    ]

    for cap_data in baseline_caps:
        existing = db.query(Capability).filter(Capability.token == cap_data["token"]).first()
        if not existing:
            new_cap = Capability(**cap_data)
            db.add(new_cap)
            print(f"[+] Added capability: {cap_data['token']}")
        else:
            print(f"[*] Capability {cap_data['token']} already exists.")
    
    db.commit()
    db.close()
    print("\n[SUCCESS] Baseline capabilities seeded.")

if __name__ == "__main__":
    seed_capabilities()
