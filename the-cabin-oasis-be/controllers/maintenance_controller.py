from sqlalchemy.orm import Session
from models import MaintenanceLog, MaintenanceLogCreate, MaintenanceLogResponse
from typing import List

class MaintenanceController:
    @staticmethod
    async def create_log(db: Session, log_data: MaintenanceLogCreate):
        log = MaintenanceLog(**log_data.dict())
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    async def get_all_logs(db: Session):
        return db.query(MaintenanceLog).all()

    @staticmethod
    async def get_logs_by_cabin(db: Session, cabin_id: int):
        return db.query(MaintenanceLog).filter(MaintenanceLog.cabin_id == cabin_id).all()

    @staticmethod
    async def update_log(db: Session, log_id: int, log_data: dict):
        log = db.query(MaintenanceLog).filter(MaintenanceLog.log_id == log_id).first()
        if log:
            for key, value in log_data.items():
                setattr(log, key, value)
            db.commit()
            db.refresh(log)
        return log

    @staticmethod
    async def delete_log(db: Session, log_id: int):
        log = db.query(MaintenanceLog).filter(MaintenanceLog.log_id == log_id).first()
        if log:
            db.delete(log)
            db.commit()
        return log
