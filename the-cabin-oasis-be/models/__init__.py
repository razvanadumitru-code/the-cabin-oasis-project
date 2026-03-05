from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey, Boolean, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum

class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"
    manager = "manager"
    maintenance = "maintenance"

class CabinStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"
    cleaning = "cleaning"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    checked_in = "checked_in"
    completed = "completed"

class TransactionStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class MessageStatus(str, enum.Enum):
    unread = "unread"
    read = "read"
    replied = "replied"
    archived = "archived"

class MaintenanceStatus(str, enum.Enum):
    reported = "reported"
    in_progress = "in_progress"
    completed = "completed"
    deferred = "deferred"

class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    emergency = "emergency"

class MessageCategory(str, enum.Enum):
    booking = "booking"
    inquiry = "inquiry"
    payment = "payment"
    marketing = "marketing"

class MaintenanceLogType(str, enum.Enum):
    cleaning = "cleaning"
    repair = "repair"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Cabin(Base):
    __tablename__ = "cabins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    price_per_night = Column(Numeric(10,2), nullable=False)
    status = Column(Enum(CabinStatus), default=CabinStatus.available, nullable=False)
    image_url = Column(String(255))
    amenities = Column(Text)
    description = Column(Text)
    location = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bookings = relationship("Booking", back_populates="cabin")
    maintenance_logs = relationship("MaintenanceLog", back_populates="cabin")

class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    cabin_id = Column(Integer, ForeignKey("cabins.id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    num_guests = Column(Integer, nullable=False, default=1)
    total_price = Column(Numeric(10,2), nullable=False)
    status = Column(Enum(BookingStatus), nullable=False, default=BookingStatus.pending)
    special_requests = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="bookings")
    cabin = relationship("Cabin", back_populates="bookings")
    transactions = relationship("Transaction", back_populates="booking")

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bookings = relationship("Booking", back_populates="customer")
    messages = relationship("Message", back_populates="customer")

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'maintenance'), nullable=False)
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    messages = relationship("Message", back_populates="staff")
    maintenance_logs = relationship("MaintenanceLog", back_populates="staff")
    notifications = relationship("Notification", back_populates="staff")

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(TransactionStatus), nullable=False)
    payment_reference = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    booking = relationship("Booking", back_populates="transactions")

class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20))
    subject = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(Enum(MessageCategory), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    staff_id = Column(Integer, ForeignKey("staff.staff_id"), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="messages")
    staff = relationship("Staff", back_populates="messages")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cabin_id = Column(Integer, ForeignKey("cabins.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.staff_id"), nullable=True)
    log_type = Column(Enum(MaintenanceLogType), nullable=False)
    description = Column(Text, nullable=False)
    log_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cabin = relationship("Cabin", back_populates="maintenance_logs")
    staff = relationship("Staff", back_populates="maintenance_logs")

class Notification(Base):
    __tablename__ = 'notifications'

    notification_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey('staff.staff_id'), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationship
    staff = relationship('Staff', back_populates='notifications')


class AdminSettings(Base):
    __tablename__ = 'admin_settings'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # Notification settings
    new_bookings = Column(Boolean, default=True, nullable=False)
    booking_cancellations = Column(Boolean, default=True, nullable=False)
    payment_updates = Column(Boolean, default=False, nullable=False)
    system_maintenance = Column(Boolean, default=True, nullable=False)
    email_notifications = Column(Boolean, default=True, nullable=False)
    admin_email = Column(String(255), default='admin@cabin-oasis.com', nullable=False)
    notification_frequency = Column(String(50), default='realtime', nullable=False)
    # Cookie settings
    essential_cookies = Column(Boolean, default=True, nullable=False)
    analytics_cookies = Column(Boolean, default=False, nullable=False)
    functional_cookies = Column(Boolean, default=True, nullable=False)
    marketing_cookies = Column(Boolean, default=False, nullable=False)
    # Security
    two_factor_auth = Column(Boolean, default=False, nullable=False)
    session_timeout = Column(String(20), default='30', nullable=False)

# Pydantic models for API requests/responses
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CabinBase(BaseModel):
    name: str
    capacity: int
    price_per_night: float
    status: CabinStatus
    image_url: Optional[str] = None
    amenities: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class CabinCreate(CabinBase):
    pass

class CabinUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    price_per_night: Optional[float] = None
    status: Optional[CabinStatus] = None
    image_url: Optional[str] = None
    amenities: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class CabinResponse(CabinBase):
    id: int
    status: CabinStatus
    created_at: datetime

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    cabin_id: int
    check_in_date: date
    check_out_date: date
    guests: int = 1
    special_requests: Optional[str] = None
    expires_at: Optional[datetime] = None

class BookingCreate(BookingBase):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    special_requests: Optional[str] = None

class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BookingResponse(BookingBase):
    booking_id: int
    customer_id: int
    total_price: float
    status: BookingStatus
    created_at: datetime
    cabin: Optional[CabinResponse] = None
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True

# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: str  # 'admin', 'maintenance'

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None

class StaffResponse(BaseModel):
    staff_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    customer_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    subject: str
    content: str
    category: MessageCategory
    is_read: bool = False
    sent_at: Optional[datetime] = None
    staff_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    message_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MaintenanceLogBase(BaseModel):
    cabin_id: int
    staff_id: Optional[int] = None
    log_type: MaintenanceLogType
    description: str
    log_date: datetime

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogResponse(MaintenanceLogBase):
    log_id: int

    class Config:
        from_attributes = True

class MaintenanceLogUpdate(BaseModel):
    log_type: Optional[MaintenanceLogType] = None
    description: Optional[str] = None
    log_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    staff_id: int
    title: str
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    notification_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AdminSettingsBase(BaseModel):
    # Notification settings
    new_bookings: bool = True
    booking_cancellations: bool = True
    payment_updates: bool = False
    system_maintenance: bool = True
    email_notifications: bool = True
    admin_email: EmailStr = 'admin@cabin-oasis.com'
    notification_frequency: str = 'realtime'
    # Cookie settings
    essential_cookies: bool = True
    analytics_cookies: bool = False
    functional_cookies: bool = True
    marketing_cookies: bool = False
    # Security
    two_factor_auth: bool = False
    session_timeout: str = '30'


class AdminSettingsUpdate(BaseModel):
    new_bookings: Optional[bool] = None
    booking_cancellations: Optional[bool] = None
    payment_updates: Optional[bool] = None
    system_maintenance: Optional[bool] = None
    email_notifications: Optional[bool] = None
    admin_email: Optional[EmailStr] = None
    notification_frequency: Optional[str] = None
    essential_cookies: Optional[bool] = None
    analytics_cookies: Optional[bool] = None
    functional_cookies: Optional[bool] = None
    marketing_cookies: Optional[bool] = None
    two_factor_auth: Optional[bool] = None
    session_timeout: Optional[str] = None


class AdminSettingsResponse(AdminSettingsBase):
    id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    booking_id: int
    amount: float
    payment_method: str
    transaction_date: Optional[datetime] = None
    status: TransactionStatus
    payment_reference: Optional[str] = None
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None

class TransactionResponse(TransactionBase):
    transaction_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    booking: Optional[BookingResponse] = None

    class Config:
        from_attributes = True

# Authentication models
