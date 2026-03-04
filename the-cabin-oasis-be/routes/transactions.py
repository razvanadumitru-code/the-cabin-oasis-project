from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from config.database import get_db
from models import Transaction, TransactionResponse, TransactionUpdate, TransactionStatus, Booking
from routes.staff import get_current_active_user, oauth2_scheme

router = APIRouter()

@router.get("/", response_model=List[TransactionResponse])
async def get_all_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all transactions (admin only)"""
    if current_user.role not in ['admin']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(Transaction).options(joinedload(Transaction.booking).joinedload(Booking.cabin))

    if status_filter:
        query = query.filter(Transaction.status == status_filter)

    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return [TransactionResponse.from_orm(t) for t in transactions]

@router.get("/booking/{booking_id}", response_model=List[TransactionResponse])
async def get_transactions_by_booking(
    booking_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get transactions for a specific booking (admin only)"""
    if current_user.role not in ['admin']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    transactions = db.query(Transaction).options(joinedload(Transaction.booking).joinedload(Booking.cabin)).filter(
        Transaction.booking_id == booking_id
    ).order_by(Transaction.created_at.desc()).all()

    return [TransactionResponse.from_orm(t) for t in transactions]

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update transaction status (admin only)"""
    if current_user.role not in ['admin']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    # Reload with booking
    transaction = db.query(Transaction).options(joinedload(Transaction.booking).joinedload(Booking.cabin)).filter(Transaction.transaction_id == transaction_id).first()
    return TransactionResponse.from_orm(transaction)
