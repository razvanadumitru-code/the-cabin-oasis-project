from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional, Any
from datetime import datetime, timedelta, date
from fastapi import HTTPException, status

from models import Booking, BookingCreate, BookingUpdate, BookingResponse, BookingStatus, Cabin, CabinStatus, Customer

class BookingController:
    @staticmethod
    async def get_user_bookings(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[BookingResponse]:
        """Get bookings for a specific user"""
        bookings = db.query(Booking).options(
            joinedload(Booking.cabin),
            joinedload(Booking.customer)
        ).filter(
            Booking.customer_id == user_id
        ).order_by(
            Booking.created_at.desc()
        ).offset(skip).limit(limit).all()

        return [BookingResponse.from_orm(booking) for booking in bookings]

    @staticmethod
    async def get_booking_by_id(db: Session, booking_id: int) -> Optional[BookingResponse]:
        """Get booking by ID with related data"""
        booking = db.query(Booking).options(
            joinedload(Booking.cabin),
            joinedload(Booking.customer)
        ).filter(Booking.booking_id == booking_id).first()

        if not booking:
            return None
        return BookingResponse.from_orm(booking)

    @staticmethod
    async def create_booking(
        db: Session, customer_id: int, booking_data: BookingCreate
    ) -> BookingResponse:
        """Create a new booking"""
        # Parse dates
        check_in_date = booking_data.check_in_date
        check_out_date = booking_data.check_out_date

        # Check if cabin exists and is available
        cabin = db.query(Cabin).filter(Cabin.id == booking_data.cabin_id).first()
        if not cabin:
            raise HTTPException(status_code=404, detail="Cabin not found")

        if cabin.status != CabinStatus.available:
            raise HTTPException(status_code=400, detail="Cabin is not available")

        # Check cabin capacity
        if cabin.capacity < booking_data.guests:
            raise HTTPException(
                status_code=400,
                detail=f"Cabin capacity ({cabin.capacity}) is less than requested guests ({booking_data.guests})"
            )

        # Check for conflicting bookings
        conflicting_booking = db.query(Booking).filter(
            and_(
                Booking.cabin_id == booking_data.cabin_id,
                Booking.status.in_(['confirmed', 'checked_in']),
                or_(
                    and_(Booking.check_in_date <= check_in_date,
                         Booking.check_out_date > check_in_date),
                    and_(Booking.check_in_date < check_out_date,
                         Booking.check_out_date >= check_out_date),
                    and_(Booking.check_in_date >= check_in_date,
                         Booking.check_out_date <= check_out_date)
                )
            )
        ).first()

        if conflicting_booking:
            raise HTTPException(
                status_code=409,
                detail="Cabin is not available for the selected dates"
            )

        # Availability check
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

        # Calculate total price (per cabin per night)
        nights = (check_out_date - check_in_date).days
        total_price = nights * cabin.price_per_night

        # Create booking
        db_booking = Booking(
            customer_id=customer_id,
            cabin_id=booking_data.cabin_id,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            num_guests=booking_data.guests,
            total_price=total_price,
            special_requests=booking_data.special_requests,
            status=BookingStatus.pending,
            expires_at=datetime.utcnow() + timedelta(minutes=15)
        )

        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)

        # Return booking with related data
        return await BookingController.get_booking_by_id(db, db_booking.booking_id)

    @staticmethod
    async def update_booking(
        db: Session,
        booking_id: int,
        booking_update: BookingUpdate
    ) -> Optional[BookingResponse]:
        """Update booking"""
        booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
        if not booking:
            return None

        # Update fields
        update_data = booking_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(booking, field, value)

        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)

        return await BookingController.get_booking_by_id(db, booking_id)

    @staticmethod
    async def cancel_booking(db: Session, booking_id: int) -> bool:
        """Cancel a booking"""
        booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
        if not booking:
            return False

        booking.status = BookingStatus.cancelled
        booking.cancelled_at = datetime.utcnow()
        booking.updated_at = datetime.utcnow()

        db.commit()
        return True

    @staticmethod
    async def get_all_bookings(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[str] = None
    ) -> List[BookingResponse]:
        """Get all bookings (admin only)"""
        query = db.query(Booking).options(
            joinedload(Booking.cabin),
            joinedload(Booking.customer)
        )

        if status_filter:
            query = query.filter(Booking.status == status_filter)

        bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
        return [BookingResponse.from_orm(booking) for booking in bookings]
