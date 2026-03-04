from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr
from models import Message, MessageCreate, MessageResponse, Notification, Staff
from controllers.messages_controller import MessageController
from routes.staff import get_current_active_user
from config.database import get_db
from main import send_email

router = APIRouter()


class OutboundEmail(BaseModel):
    to: EmailStr
    subject: str
    content: str

@router.post("/", response_model=MessageResponse)
async def create_message(message_data: MessageCreate, db: Session = Depends(get_db)):
    # No auth for creating messages
    message = await MessageController.create_message(db, message_data)

    # Add notifications for admins
    admins = db.query(Staff).filter(Staff.role == 'admin').all()
    for admin in admins:
        db.add(Notification(
            staff_id=admin.staff_id,
            title="New Message",
            message=f"A new message from {message.name}: {message.subject}"
        ))
    db.commit()

    return message

@router.get("/", response_model=List[MessageResponse])
async def get_all_messages(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    if current_user.role not in ['admin', 'maintenance']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await MessageController.get_all_messages(db)

@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(message_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    message = await MessageController.get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@router.put("/{message_id}/read", response_model=MessageResponse)
async def mark_message_as_read(message_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    message = await MessageController.mark_as_read(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@router.delete("/{message_id}")
async def delete_message(message_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    message = await MessageController.delete_message(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

@router.post("/send")
async def send_custom_email(
    email: OutboundEmail,
    current_user = Depends(get_current_active_user),
):
    """Send a custom email from the admin panel via Mailtrap.

    This uses the same send_email helper that other booking emails use,
    so everything goes through Mailtrap in test mode.
    """

    # Only staff users are allowed to send outbound emails from admin
    if current_user.role not in ["admin", "maintenance"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Use the logged-in staff member's email as the visible From address
    send_email(email.to, email.subject, email.content, from_address=current_user.email)
    return {"message": "Email sent successfully"}
