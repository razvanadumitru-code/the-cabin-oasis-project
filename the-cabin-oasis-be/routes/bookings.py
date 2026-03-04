from fastapi import APIRouter, Depends, HTTPException, status, Query, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Any
from datetime import datetime, timezone, date, timedelta

from config.database import get_db
from models import Booking, BookingCreate, BookingUpdate, BookingResponse, User, UserRole, BookingStatus, Customer, Transaction, TransactionStatus, Staff, Notification, Cabin, CabinStatus
from routes.staff import get_current_active_user, oauth2_scheme, get_current_user
from controllers.booking_controller import BookingController

router = APIRouter()

from main import send_email
from email_templates import (
    booking_confirmed_template,
    booking_expired_unpaid_template,
    booking_cancelled_by_admin_template,
)

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get booking by ID (user can only see their own bookings, admin can see all)"""
    booking = await BookingController.get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    current_user = await get_current_user(credentials, db)
    # Check if user can access this booking
    if current_user.role != UserRole.admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return booking

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    # Validate dates
    check_in_date = booking_data.check_in_date
    check_out_date = booking_data.check_out_date
    if check_in_date >= check_out_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    if check_in_date < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    # Check availability
    existing = db.query(Booking).filter(
        Booking.cabin_id == booking_data.cabin_id,
        Booking.status.in_(["pending", "confirmed"]),
        Booking.check_in_date < check_out_date,
        Booking.check_out_date > check_in_date
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Cabin is not available for the selected dates"
        )

    # Create or find customer
    customer = db.query(Customer).filter(Customer.email == booking_data.customer_email).first()
    if not customer:
        customer = Customer(
            name=booking_data.customer_name,
            email=booking_data.customer_email,
            phone=booking_data.customer_phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Create booking
    booking = await BookingController.create_booking(db, customer.customer_id, booking_data)

    # Add notifications for admins
    admins = db.query(Staff).filter(Staff.role == 'admin').all()
    for admin in admins:
        db.add(Notification(
            staff_id=admin.staff_id,
            title="New Booking",
            message=f"A new booking has been created for cabin {booking.cabin.name} by {booking.customer.name}. Booking ID: {booking.booking_id}"
        ))
    db.commit()

    return booking

@router.post("/public-update-pending/{booking_id}", response_model=BookingResponse)
async def public_update_pending_booking(
    booking_id: int,
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
):
    """Update an existing pending booking without auth (public flow).

    Used when a customer modifies dates/cabin while the booking is still
    in the 15-minute pending window. Keeps the same booking ID.
    """

    # Load existing booking
    db_booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if db_booking.status != BookingStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Only pending bookings can be updated this way.",
        )

    if db_booking.expires_at and db_booking.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Booking has expired and cannot be updated.",
        )

    # Validate dates
    check_in_date = booking_data.check_in_date
    check_out_date = booking_data.check_out_date
    if check_in_date >= check_out_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    if check_in_date < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    # Check if cabin exists and is available
    cabin = db.query(Cabin).filter(Cabin.id == booking_data.cabin_id).first()
    if not cabin:
        raise HTTPException(status_code=404, detail="Cabin not found")

    if cabin.status != CabinStatus.available:
        raise HTTPException(status_code=400, detail="Cabin is not available")

    # Check capacity
    if cabin.capacity < booking_data.guests:
        raise HTTPException(
            status_code=400,
            detail=f"Cabin capacity ({cabin.capacity}) is less than requested guests ({booking_data.guests})",
        )

    # Check overlapping bookings, excluding this booking itself
    existing = db.query(Booking).filter(
        Booking.cabin_id == booking_data.cabin_id,
        Booking.booking_id != booking_id,
        Booking.status.in_(["pending", "confirmed"]),
        Booking.check_in_date < check_out_date,
        Booking.check_out_date > check_in_date,
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Cabin is not available for the selected dates",
        )

    # Create or find customer (in case email/phone changed)
    customer = db.query(Customer).filter(Customer.email == booking_data.customer_email).first()
    if not customer:
        customer = Customer(
            name=booking_data.customer_name,
            email=booking_data.customer_email,
            phone=booking_data.customer_phone,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Recalculate total price (per cabin per night)
    nights = (check_out_date - check_in_date).days
    total_price = nights * cabin.price_per_night

    # Apply updates to existing booking
    db_booking.customer_id = customer.customer_id
    db_booking.cabin_id = booking_data.cabin_id
    db_booking.check_in_date = check_in_date
    db_booking.check_out_date = check_out_date
    db_booking.num_guests = booking_data.guests
    db_booking.special_requests = booking_data.special_requests
    db_booking.total_price = total_price
    db_booking.updated_at = datetime.utcnow()
    db_booking.expires_at = datetime.utcnow() + timedelta(minutes=15)

    db.commit()
    db.refresh(db_booking)

    # Return booking with related data
    return await BookingController.get_booking_by_id(db, db_booking.booking_id)

@router.post("/confirm-payment/{booking_id}")
async def confirm_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    booking = db.query(Booking).options(joinedload(Booking.customer), joinedload(Booking.cabin)).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == BookingStatus.confirmed:
        # Create transaction
        transaction = Transaction(
            booking_id=booking.booking_id,
            amount=booking.total_price,
            payment_method="card",
            status=TransactionStatus.completed,
        )
        db.add(transaction)
        db.commit()

        # Send confirmation email
        body = booking_confirmed_template(booking)
        send_email(
            booking.customer.email,
            f"Booking Confirmed - Booking #{booking.booking_id}",
            body,
            booking=booking,
        )

        return BookingResponse.from_orm(booking)
    
    elif booking.status == BookingStatus.cancelled:
        # Send cancellation email for already-cancelled booking (likely unpaid)
        body = booking_expired_unpaid_template(booking)
        send_email(
            booking.customer.email,
            f"Booking Cancelled - Booking #{booking.booking_id}",
            body,
            booking=booking,
        )

        return BookingResponse.from_orm(booking)
    
    elif booking.status == BookingStatus.pending:
        # Update to confirmed
        booking.status = BookingStatus.confirmed

        # Create transaction
        transaction = Transaction(
            booking_id=booking.booking_id,
            amount=booking.total_price,
            payment_method="card",
            status=TransactionStatus.completed,
        )
        db.add(transaction)
        db.commit()

        # Send confirmation email
        body = booking_confirmed_template(booking)
        send_email(
            booking.customer.email,
            f"Booking Confirmed - Booking #{booking.booking_id}",
            body,
            booking=booking,
        )

        return BookingResponse.from_orm(booking)
    
    else:
        raise HTTPException(status_code=400, detail="Invalid booking status")

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Update booking (user can only update their own bookings)"""
    booking = await BookingController.get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    current_user = await get_current_user(credentials, db)
    # Check permissions
    if current_user.role != UserRole.admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Users can only update certain fields
    if current_user.role != UserRole.admin:
        allowed_updates = {"special_requests"}
        for field in booking_update.dict(exclude_unset=True):
            if field not in allowed_updates:
                raise HTTPException(status_code=403, detail=f"Cannot update field: {field}")

    updated_booking = await BookingController.update_booking(db, booking_id, booking_update)
    if not updated_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return updated_booking

@router.put("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = await BookingController.get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    current_user = await get_current_user(credentials, db)
    # Check permissions
    if current_user.role != UserRole.admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check if booking can be cancelled
    if booking.status in [BookingStatus.cancelled, BookingStatus.checked_in]:
        raise HTTPException(status_code=400, detail="Booking cannot be cancelled")

    if booking.check_in_date <= datetime.utcnow().date():
        raise HTTPException(status_code=400, detail="Cannot cancel booking that has already started")

    success = await BookingController.cancel_booking(db, booking_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to cancel booking")

    # Send cancellation email
    cancellation_body = booking_cancelled_by_admin_template(booking)
    send_email(
        booking.customer.email,
        f"Booking Cancelled - Booking #{booking.booking_id}",
        cancellation_body,
        booking=booking,
    )

    return {"message": "Booking cancelled successfully"}

@router.get("/admin/all", response_model=List[BookingResponse])
async def get_all_bookings(
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = None
):
    """Get all bookings (staff only)"""
    current_user = await get_current_user(credentials, db)
    if current_user.role not in ['admin', 'maintenance']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return await BookingController.get_all_bookings(db, skip, limit, status_filter)

@router.get("/customer/{customer_id}", response_model=List[BookingResponse])
async def get_customer_bookings(
    customer_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get bookings for a specific customer (admin/maintenance only)"""
    if current_user.role not in ['admin', 'maintenance']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    bookings = db.query(Booking).options(joinedload(Booking.customer)).filter(Booking.customer_id == customer_id).all()
    return bookings

@router.get("/cabin/{cabin_id}", response_model=List[BookingResponse])
async def get_bookings_by_cabin(
    cabin_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get bookings for a specific cabin (admin/maintenance only)"""
    if current_user.role not in ['admin', 'maintenance']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    bookings = db.query(Booking).options(joinedload(Booking.customer), joinedload(Booking.cabin)).filter(Booking.cabin_id == cabin_id).all()
    return bookings

@router.delete("/{booking_id}")
async def delete_booking(
    booking_id: int,
    current_user: Staff = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a booking (admin/manager only)"""
    if current_user.role not in ['admin']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}
