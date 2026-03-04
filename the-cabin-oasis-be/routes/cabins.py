from fastapi import APIRouter, Depends, HTTPException, status, Query, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from datetime import date

from config.database import get_db
from models import Cabin, CabinCreate, CabinUpdate, CabinResponse, User, UserRole, Staff
from routes.staff import get_current_active_user, get_current_user
from controllers.cabins_controller import CabinController

router = APIRouter()

@router.get("/", response_model=List[CabinResponse])
async def get_cabins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    capacity: Optional[int] = Query(None, ge=1),
    db: Session = Depends(get_db)
):
    """Get all cabins with optional filters"""
    return await CabinController.get_cabins(
        db, skip, limit, status_filter, min_price, max_price, capacity
    )

@router.get("/{cabin_id}", response_model=CabinResponse)
async def get_cabin(cabin_id: int, db: Session = Depends(get_db)):
    """Get cabin by ID"""
    cabin = await CabinController.get_cabin_by_id(db, cabin_id)
    if not cabin:
        raise HTTPException(status_code=404, detail="Cabin not found")
    return cabin

@router.get("/available/{check_in}/{check_out}")
async def get_available_cabins(
    check_in: str,
    check_out: str,
    db: Session = Depends(get_db)
):
    """Get cabins available for the given dates"""
    try:
        check_in_date = date.fromisoformat(check_in)
        check_out_date = date.fromisoformat(check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if check_in_date >= check_out_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    return await CabinController.get_available_cabins(db, check_in_date, check_out_date)

@router.post("/", response_model=CabinResponse)
async def create_cabin(
    cabin: CabinCreate,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new cabin (admin/manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    print("Cabin data received:", cabin.dict())
    return await CabinController.create_cabin(db, cabin)

@router.put("/{cabin_id}", response_model=CabinResponse)
async def update_cabin(
    cabin_id: int,
    cabin_update: CabinUpdate,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update cabin (admin/manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return await CabinController.update_cabin(db, cabin_id, cabin_update)

@router.delete("/{cabin_id}")
async def delete_cabin(
    cabin_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete cabin (admin/manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    cabin = await CabinController.get_cabin_by_id(db, cabin_id)

    if not cabin:
        raise HTTPException(status_code=404, detail="Cabin not found")

    success = await CabinController.delete_cabin(db, cabin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cabin not found")

    return {"message": "Cabin deleted successfully"}

