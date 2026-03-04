from sqlalchemy.orm import Session
from models import Message, MessageCreate, MessageResponse
from typing import List

class MessageController:
    @staticmethod
    async def create_message(db: Session, message_data: MessageCreate):
        message = Message(**message_data.dict())
        message.staff_id = None  # Ensure staff_id is None for new messages
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    async def get_all_messages(db: Session):
        return db.query(Message).all()

    @staticmethod
    async def get_message_by_id(db: Session, message_id: int):
        return db.query(Message).filter(Message.message_id == message_id).first()

    @staticmethod
    async def mark_as_read(db: Session, message_id: int):
        message = db.query(Message).filter(Message.message_id == message_id).first()
        if message:
            message.is_read = True
            db.commit()
            db.refresh(message)
        return message

    @staticmethod
    async def delete_message(db: Session, message_id: int):
        message = db.query(Message).filter(Message.message_id == message_id).first()
        if message:
            db.delete(message)
            db.commit()
        return message
