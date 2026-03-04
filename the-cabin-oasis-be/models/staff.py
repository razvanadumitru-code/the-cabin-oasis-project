from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'manager', 'maintenance'), nullable=False)
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
