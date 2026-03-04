from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Any
from datetime import datetime
from fastapi import HTTPException, status

from models import Cabin, CabinCreate, CabinUpdate, CabinResponse, CabinStatus, Booking

class CabinController:
    @staticmethod
    async def get_cabins(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        capacity: Optional[int] = None
    ) -> List[CabinResponse]:
        """Get cabins with optional filters"""
        query = db.query(Cabin)

        # Apply filters
        if status_filter:
            query = query.filter(Cabin.status == status_filter)

        if min_price is not None:
            query = query.filter(Cabin.price_per_night >= min_price)

        if max_price is not None:
            query = query.filter(Cabin.price_per_night <= max_price)

        if capacity is not None:
            query = query.filter(Cabin.capacity >= capacity)

        # Order by creation date (newest first)
        query = query.order_by(Cabin.created_at.desc())

        cabins = query.offset(skip).limit(limit).all()
        return [CabinResponse.from_orm(cabin) for cabin in cabins]
    @staticmethod
    async def get_cabin_by_id(db: Session, cabin_id: int) -> Optional[CabinResponse]:
        """Get a single cabin by ID"""
        cabin = db.query(Cabin).filter(Cabin.id == cabin_id).first()
        return CabinResponse.from_orm(cabin) if cabin else None
    @staticmethod
    async def get_available_cabins(
        db: Session,
        check_in_date,
        check_out_date
    ) -> dict:
        """Get cabins available for the given dates"""
        # Query cabins that are available and not booked during the period
        cabins = db.query(Cabin).outerjoin(Booking, and_(
            Cabin.id == Booking.cabin_id,
            Booking.status.in_(["pending", "confirmed"]),
            Booking.check_in_date < check_out_date,
            Booking.check_out_date > check_in_date
        )).filter(
            Cabin.status == CabinStatus.available,
            Booking.cabin_id.is_(None)
        ).all()

        cabin_responses = [CabinResponse.from_orm(cabin) for cabin in cabins]
        return {
            "message": "no available cabins for this dates" if not cabin_responses else "Available cabins retrieved",
            "cabins": cabin_responses
        }

    @staticmethod
    async def create_cabin(db: Session, cabin_data: CabinCreate) -> CabinResponse:
        """Create a new cabin"""
        # Validate capacity
        if cabin_data.capacity <= 0:
            raise HTTPException(status_code=400, detail="Capacity must be greater than 0")

        # Validate price
        if cabin_data.price_per_night <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")

        # Create new cabin
        db_cabin = Cabin(
            name=cabin_data.name,
            capacity=cabin_data.capacity,
            price_per_night=cabin_data.price_per_night,
            amenities=cabin_data.amenities,
            image_url=cabin_data.image_url,
            description=cabin_data.description,
            location=cabin_data.location,
            status=CabinStatus.available
        )

        db.add(db_cabin)
        db.commit()
        db.refresh(db_cabin)

        return CabinResponse.from_orm(db_cabin)

    @staticmethod
    async def update_cabin(db: Session, cabin_id: int, cabin_update: CabinUpdate) -> Optional[CabinResponse]:
        """Update cabin"""
        cabin = db.query(Cabin).filter(Cabin.id == cabin_id).first()
        if not cabin:
            return None

        # Update fields
        update_data = cabin_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "capacity" and value <= 0:
                raise HTTPException(status_code=400, detail="Capacity must be greater than 0")
            if field == "price_per_night" and value <= 0:
                raise HTTPException(status_code=400, detail="Price must be greater than 0")
            setattr(cabin, field, value)

        cabin.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(cabin)

        return CabinResponse.from_orm(cabin)

    @staticmethod
    async def delete_cabin(db: Session, cabin_id: int) -> bool:
        """Delete cabin"""
        cabin = db.query(Cabin).filter(Cabin.id == cabin_id).first()
        if not cabin:
            return False

        # Check if cabin has active bookings
        active_bookings = db.query(Booking).filter(
            and_(
                Booking.cabin_id == cabin_id,
                Booking.status.in_(['confirmed', 'checked_in']),
                Booking.check_out_date > datetime.utcnow()
            )
        ).first()

        if active_bookings:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete cabin with active bookings"
            )

        db.delete(cabin)
        db.commit()
        return True

