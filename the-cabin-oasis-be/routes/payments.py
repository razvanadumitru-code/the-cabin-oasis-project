from datetime import datetime
import os
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.params import Body
from sqlalchemy.orm import Session, joinedload

from config.database import get_db
from models import (
    Booking,
    BookingStatus,
    Transaction,
    TransactionStatus,
)
from main import send_email
from email_templates import booking_confirmed_template

router = APIRouter()

# Stripe configuration (test mode)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "usd")  # change to "ron" later when ready


def _ensure_query_param(url: str, key: str, value: str, preserve_braces: bool = False) -> str:
    """Ensure the given query param exists on the URL."""
    parsed = list(urlparse(url))
    query = dict(parse_qsl(parsed[4], keep_blank_values=True))
    query[key] = value
    encoded_query = urlencode(query)
    if preserve_braces:
        encoded_query = encoded_query.replace('%7B', '{').replace('%7D', '}')
    parsed[4] = encoded_query
    return urlunparse(parsed)


@router.post("/create-checkout-session")
async def create_checkout_session(
    booking_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """Create a Stripe Checkout Session for a pending booking.

    Expects a JSON body: { "booking_id": <id> }
    """
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe secret key is not configured on the server.",
        )

    # Load booking
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.status != BookingStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be paid.",
        )

    if booking.expires_at and booking.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This booking has expired. Please start a new reservation.",
        )

    # Configure Stripe
    stripe.api_key = STRIPE_SECRET_KEY

    # total_price is Numeric -> convert to float then cents
    amount_cents = int(float(booking.total_price) * 100)

    # Build success/cancel URLs for the website frontend
    success_url = os.getenv(
        "FRONTEND_SUCCESS_URL",
        "http://localhost:5174/payment-success",
    )
    cancel_url = os.getenv(
        "FRONTEND_CANCEL_URL",
        "http://localhost:5174/payment-cancel",
    )

    # Ensure required query parameters are present even if env vars omit them
    success_url = _ensure_query_param(
        _ensure_query_param(success_url, "booking_id", str(booking.booking_id)),
        "session_id",
        "{CHECKOUT_SESSION_ID}",
        preserve_braces=True,
    )
    cancel_url = _ensure_query_param(
        cancel_url,
        "booking_id",
        str(booking.booking_id),
    )

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": STRIPE_CURRENCY,
                        "product_data": {
                            "name": f"Cabin {booking.cabin.name}",
                        },
                        "unit_amount": amount_cents,
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"booking_id": booking.booking_id},
        )
    except Exception as e:  # StripeError or generic
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Stripe Checkout Session: {e}",
        )

    return {"checkout_url": session.url}


@router.post("/confirm-booking/{booking_id}")
async def confirm_booking_payment(
    booking_id: int,
    session_id: str | None = None,
    db: Session = Depends(get_db),
):
    """Confirm a pending booking after successful Stripe payment.

    This endpoint is called from the public website after Stripe redirects
    to the success URL. In production, you should also validate the Stripe
    session or webhook; for now, this assumes test-mode success.
    """

    booking = (
        db.query(Booking)
        .options(joinedload(Booking.customer), joinedload(Booking.cabin))
        .filter(Booking.booking_id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.confirmed:
        # Already confirmed, just return the current state
        return {
            "message": "Booking already confirmed",
            "booking_id": booking.booking_id,
            "status": booking.status,
        }

    if booking.status != BookingStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Booking is not in a pending state and cannot be confirmed.",
        )

    if booking.expires_at and booking.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Booking has expired and cannot be confirmed.",
        )

    # Optionally validate Stripe session when a session_id is provided
    if session_id:
        if not STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe secret key is not configured on the server.",
            )

        try:
            stripe.api_key = STRIPE_SECRET_KEY
            checkout_session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Could not verify Stripe session: {e}",
            )

        # Basic validation: ensure session is paid and metadata.booking_id matches
        if checkout_session.get("payment_status") != "paid":
            raise HTTPException(
                status_code=400,
                detail="Stripe payment is not completed.",
            )

        session_booking_id = checkout_session.get("metadata", {}).get("booking_id")
        if session_booking_id is None or int(session_booking_id) != booking.booking_id:
            raise HTTPException(
                status_code=400,
                detail="Stripe session does not match this booking.",
            )

    # Mark as confirmed
    booking.status = BookingStatus.confirmed

    # Create transaction record
    transaction = Transaction(
        booking_id=booking.booking_id,
        amount=booking.total_price,
        payment_method="card",
        status=TransactionStatus.completed,
    )
    db.add(transaction)
    db.commit()
    db.refresh(booking)

    # Send confirmation email using shared template
    confirmation_body = booking_confirmed_template(booking)
    send_email(
        booking.customer.email,
        f"Booking Confirmed - Booking #{booking.booking_id}",
        confirmation_body,
        booking=booking,
    )

    return {
        "message": "Booking confirmed successfully",
        "booking_id": booking.booking_id,
        "status": booking.status,
    }
