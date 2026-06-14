import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL configuration (PostgreSQL target)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Use default PostgreSQL database URL
    DATABASE_URL = "postgresql://traveluser:travelpassword@localhost:5433/seven"

# Create database engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
