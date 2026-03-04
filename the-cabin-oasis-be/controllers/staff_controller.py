from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Staff
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_staff(staff_data, db: Session):
    try:
        # Check if email exists
        existing = db.query(Staff).filter(Staff.email == staff_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Hash password
        hashed = pwd_context.hash(staff_data.password)

        # Create staff
        new_staff = Staff(
            full_name=staff_data.full_name,
            email=staff_data.email,
            phone=staff_data.phone,
            password_hash=hashed,
            role=staff_data.role,
            status=True
        )

        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)

        return new_staff
    except Exception as e:
        print(f"Error: {e}")
        raise
