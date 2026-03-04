from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from models import AdminSettings, AdminSettingsResponse, AdminSettingsUpdate, Staff
from routes.staff import get_current_active_user

router = APIRouter()


def get_or_create_settings(db: Session) -> AdminSettings:
    settings = db.query(AdminSettings).first()
    if settings:
        return settings

    # Create with defaults (values also defined in AdminSettings defaults)
    settings = AdminSettings()
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("/", response_model=AdminSettingsResponse)
async def get_settings(
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_active_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    settings = get_or_create_settings(db)
    return settings


@router.put("/", response_model=AdminSettingsResponse)
async def update_settings(
    settings_update: AdminSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Staff = Depends(get_current_active_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    settings = get_or_create_settings(db)

    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
