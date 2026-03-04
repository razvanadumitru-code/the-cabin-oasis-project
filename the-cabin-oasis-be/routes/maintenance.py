from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import MaintenanceLog, MaintenanceLogCreate, MaintenanceLogResponse, MaintenanceLogUpdate
from controllers.maintenance_controller import MaintenanceController
from routes.staff import get_current_active_user
from config.database import get_db

router = APIRouter()

@router.post("/", response_model=MaintenanceLogResponse)
async def create_log(log_data: MaintenanceLogCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return await MaintenanceController.create_log(db, log_data)

@router.get("/", response_model=List[MaintenanceLogResponse])
async def get_all_logs(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return await MaintenanceController.get_all_logs(db)

@router.get("/{cabin_id}", response_model=List[MaintenanceLogResponse])
async def get_logs_by_cabin(cabin_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return await MaintenanceController.get_logs_by_cabin(db, cabin_id)

@router.put("/{log_id}", response_model=MaintenanceLogResponse)
async def update_log(log_id: int, log_data: MaintenanceLogUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    updated_log = await MaintenanceController.update_log(db, log_id, log_data.dict(exclude_unset=True))
    if not updated_log:
        raise HTTPException(status_code=404, detail="Log not found")
    return updated_log

@router.delete("/{log_id}")
async def delete_log(log_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    log = await MaintenanceController.delete_log(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"message": "Log deleted"}
