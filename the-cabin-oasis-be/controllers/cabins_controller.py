import os
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Any
from datetime import datetime
from fastapi import HTTPException, status

from models import Cabin, CabinCreate, CabinUpdate, CabinResponse, CabinStatus, Booking

class CabinController:
    _asset_base_cache: Optional[str] = None

    @classmethod
    def _get_asset_base(cls) -> Optional[str]:
        if cls._asset_base_cache is None:
            asset_base = os.getenv("PUBLIC_ASSET_BASE_URL") or os.getenv("RENDER_EXTERNAL_URL")
            cls._asset_base_cache = asset_base.rstrip("/") if asset_base else None
        return cls._asset_base_cache

    @classmethod
    def _sanitize_image_input(cls, image_url: Optional[str]) -> Optional[str]:
        if not image_url:
            return image_url

        trimmed = image_url.strip()
        if not trimmed:
            return None

        prefixes = (
            "http://localhost:3000",
            "https://localhost:3000",
        )
        for prefix in prefixes:
            if trimmed.startswith(prefix):
                trimmed = trimmed[len(prefix):]
                break

        asset_base = cls._get_asset_base()
        if asset_base and trimmed.startswith(asset_base):
            trimmed = trimmed[len(asset_base):]

        if trimmed.startswith("//"):
            trimmed = trimmed[1:]

        if trimmed.startswith("/"):
            return trimmed

        if trimmed.startswith("images/"):
            return f"/{trimmed}"

        return trimmed

    @classmethod
    def _normalize_image_for_response(cls, image_url: Optional[str]) -> Optional[str]:
        if not image_url:
            return image_url

        trimmed = image_url.strip()
        if not trimmed:
            return None

        asset_base = cls._get_asset_base()
        localhost_prefixes = (
            "http://localhost:3000",
            "https://localhost:3000",
        )

        for prefix in localhost_prefixes:
            if trimmed.startswith(prefix):
                return trimmed.replace(prefix, asset_base, 1) if asset_base else trimmed

        if trimmed.startswith("http://") or trimmed.startswith("https://"):
            return trimmed

        if asset_base:
            if trimmed.startswith("/"):
                return f"{asset_base}{trimmed}"
            if trimmed.startswith("images/"):
                return f"{asset_base}/{trimmed}"

        return trimmed

    @classmethod
    def _build_response(cls, cabin: Cabin) -> CabinResponse:
        response = CabinResponse.from_orm(cabin)
        response.image_url = cls._normalize_image_for_response(response.image_url)
        return response

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
        return [CabinController._build_response(cabin) for cabin in cabins]
    @staticmethod
    async def get_cabin_by_id(db: Session, cabin_id: int) -> Optional[CabinResponse]:
        """Get a single cabin by ID"""
        cabin = db.query(Cabin).filter(Cabin.id == cabin_id).first()
        return CabinController._build_response(cabin) if cabin else None
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

        cabin_responses = [CabinController._build_response(cabin) for cabin in cabins]
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
            image_url=CabinController._sanitize_image_input(cabin_data.image_url),
            description=cabin_data.description,
            location=cabin_data.location,
            status=CabinStatus.available
        )

        db.add(db_cabin)
        db.commit()
        db.refresh(db_cabin)

        return CabinController._build_response(db_cabin)

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
            if field == "image_url":
                value = CabinController._sanitize_image_input(value)
            setattr(cabin, field, value)

        cabin.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(cabin)

        return CabinController._build_response(cabin)

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

