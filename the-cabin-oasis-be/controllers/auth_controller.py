from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from fastapi import HTTPException, status
from dotenv import load_dotenv

from models import User, UserCreate, UserResponse, Token, UserRole, Staff, StaffCreate, StaffResponse

load_dotenv()

class AuthController:
    # Password hashing
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # JWT settings
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return AuthController.pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return AuthController.pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=AuthController.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, AuthController.SECRET_KEY, algorithm=AuthController.ALGORITHM)
        return encoded_jwt

    @staticmethod
    async def authenticate_staff(db: Session, email: str, password: str) -> Staff:
        """Authenticate staff with email and password"""
        staff = db.query(Staff).filter(Staff.email == email).first()
        if not staff:
            return None
        if not AuthController.verify_password(password, staff.password_hash):
            return None
        return staff

    @staticmethod
    async def register(user_data: UserCreate, db: Session) -> UserResponse:
        """Register a new user"""
        # Check if email already exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Hash password using passlib bcrypt if provided
        hashed = AuthController.get_password_hash(user_data.password) if user_data.password else ""

        # Create user with: name, email, password_hash, role='customer', is_active=1
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed,
            role=UserRole.customer,
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Return the created user
        return UserResponse.from_orm(new_user)

    @staticmethod
    async def create_staff(staff_data: StaffCreate, db: Session) -> StaffResponse:
        """Create a new staff member"""
        try:
            # Check if email already exists in staff
            existing_staff = db.query(Staff).filter(Staff.email == staff_data.email).first()
            if existing_staff:
                raise HTTPException(status_code=400, detail="Email already exists for staff")

            # Hash password
            hashed = AuthController.get_password_hash(staff_data.password)

            # Validate role
            if staff_data.role not in ['admin', 'manager', 'maintenance']:
                raise HTTPException(status_code=400, detail="Role must be 'admin', 'manager', or 'maintenance'")

            # Create staff
            new_staff = Staff(
                full_name=staff_data.full_name,
                email=staff_data.email,
                phone=staff_data.phone,
                password_hash=hashed,
                role=staff_data.role,
                status=True
            )

            db.add(new_staff)
            db.commit()
            db.refresh(new_staff)

            # Return the created staff
            return StaffResponse.from_orm(new_staff)
        except Exception as e:
            print(f"Error creating staff: {e}")
            raise

    @staticmethod
    async def login(email: str, password: str, db: Session) -> Token:
        """Login staff and return access token"""
        staff = await AuthController.authenticate_staff(db, email, password)
        if staff:
            access_token_expires = timedelta(minutes=AuthController.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = AuthController.create_access_token(
                data={"sub": staff.email}, expires_delta=access_token_expires
            )

            return Token(access_token=access_token, token_type="bearer")

        # Not found
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    @staticmethod
    async def update_staff_profile(staff_id: int, staff_update: dict, db: Session) -> StaffResponse:
        """Update staff profile"""
        staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")

        # If role is being updated, require password verification
        if 'role' in staff_update:
            if 'password' not in staff_update:
                raise HTTPException(status_code=400, detail="Password required to change role")
            if not AuthController.verify_password(staff_update['password'], staff.password_hash):
                raise HTTPException(status_code=401, detail="Invalid password")

        # Update allowed fields
        update_data = {}
        if 'full_name' in staff_update:
            update_data['full_name'] = staff_update['full_name']
        if 'email' in staff_update:
            # Check if email is already taken
            existing_staff = db.query(Staff).filter(
                Staff.email == staff_update['email'],
                Staff.staff_id != staff_id
            ).first()
            if existing_staff:
                raise HTTPException(status_code=400, detail="Email already taken")
            update_data['email'] = staff_update['email']
        if 'phone' in staff_update:
            update_data['phone'] = staff_update['phone']
        if 'role' in staff_update:
            if staff_update['role'] not in ['admin', 'maintenance']:
                raise HTTPException(status_code=400, detail="Invalid role")
            update_data['role'] = staff_update['role']

        for field, value in update_data.items():
            setattr(staff, field, value)

        staff.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(staff)

        return StaffResponse.from_orm(staff)
