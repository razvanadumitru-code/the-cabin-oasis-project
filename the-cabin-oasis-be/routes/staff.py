from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

from config.database import get_db
from models import User, UserCreate, UserResponse, Token, LoginRequest, TokenData, Staff, UserRole, StaffCreate, StaffResponse, StaffUpdate
from controllers.staff_controller import create_staff
from controllers.auth_controller import AuthController

load_dotenv()

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/staff/login")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    staff = db.query(Staff).filter(Staff.email == email).first()
    if staff is None:
        raise credentials_exception
    return staff

async def get_current_active_user(current_user: Staff = Depends(get_current_user)):
    if not current_user.status:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.post("/register-staff", response_model=StaffResponse)
async def register_staff(staff_data: StaffCreate, db: Session = Depends(get_db)):
    """Register a new staff member with admin role"""
    # Force role to 'admin'
    staff_data.role = 'admin'
    return StaffResponse.from_orm(create_staff(staff_data, db))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login staff and return access token"""
    staff = db.query(Staff).filter(Staff.email == form_data.username).first()
    if not staff or not pwd_context.verify(form_data.password, staff.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token({"sub": staff.email})
    return Token(access_token=access_token, token_type="bearer")

@router.post("/", response_model=StaffResponse)
async def create_staff_member(
    staff_data: StaffCreate,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new staff member (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create staff")
    
    return StaffResponse.from_orm(await create_staff(staff_data, db))

@router.get("/me", response_model=StaffResponse)
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current staff profile"""
    current_user = await get_current_user(token, db)
    return StaffResponse.from_orm(current_user)

@router.put("/me", response_model=StaffResponse)
async def update_staff_profile(
    user_update: dict,
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Update current staff profile"""
    current_user = await get_current_user(credentials, db)
    return await AuthController.update_staff_profile(current_user.staff_id, user_update, db)

@router.get("/", response_model=List[StaffResponse])
async def get_all_staff(
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all staff members (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can view all staff")
    
    return db.query(Staff).all()

@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: int,
    staff_update: StaffUpdate,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update staff member (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can update staff")
    
    staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    for key, value in staff_update.dict(exclude_unset=True).items():
        setattr(staff, key, value)
    
    db.commit()
    db.refresh(staff)
    return staff

@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete staff member (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can delete staff")
    
    staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted"}
