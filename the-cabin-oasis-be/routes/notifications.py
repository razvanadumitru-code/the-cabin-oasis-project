from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Notification, NotificationResponse, Staff
from routes.staff import get_current_active_user
from config.database import get_db

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current staff member"""
    return db.query(Notification).filter(Notification.staff_id == current_user.staff_id).order_by(Notification.created_at.desc()).all()

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.staff_id == current_user.staff_id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}
