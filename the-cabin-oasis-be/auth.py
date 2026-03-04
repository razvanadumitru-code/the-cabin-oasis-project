from fastapi import HTTPException, status, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import os
from config.database import get_db
from models import Staff

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

oauth2_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme), db: Session = Depends(get_db)) -> Staff:
    print("Auth called for user")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        print("Decoded email:", email)
        if email is None:
            raise credentials_exception
    except JWTError:
        print("JWT decode error")
        raise credentials_exception
    user = db.query(Staff).filter(Staff.email == email).first()
    print("User found:", user is not None, user.email if user else None)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: Staff = Depends(get_current_user)) -> Staff:
    if not current_user.status:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
