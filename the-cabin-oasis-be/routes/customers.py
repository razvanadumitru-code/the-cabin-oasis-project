from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from models import Customer, Staff, CustomerResponse
from routes.staff import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CustomerResponse])
async def get_all_customers(
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all customers (admin/manager only)"""
    if current_user.role not in ['admin', 'maintenance']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers
