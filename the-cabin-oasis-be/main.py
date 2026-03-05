from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from datetime import datetime, date
from config.database import SessionLocal
from models import Booking, BookingStatus, Message, MessageCategory
from email_templates import booking_expired_unpaid_template, booking_thank_you_after_stay_template
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os
from sqlalchemy.orm import joinedload
import smtplib
from email.mime.text import MIMEText

# Load environment variables
load_dotenv()

# Mailtrap configuration
MAILTRAP_HOST = os.getenv("MAILTRAP_HOST", "smtp.mailtrap.io")
MAILTRAP_PORT = int(os.getenv("MAILTRAP_PORT", "2525"))
MAILTRAP_USER = os.getenv("MAILTRAP_USER")
MAILTRAP_PASS = os.getenv("MAILTRAP_PASS")
MAILTRAP_FROM = os.getenv("MAILTRAP_FROM", "admin@cabin-oasis.com")

# Import database and models
from config.database import engine, get_db, test_connection
from models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Test database connection
test_connection()

# Background task to expire pending bookings
async def expire_pending_bookings():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        expired = db.query(Booking).options(joinedload(Booking.customer)).filter(
            Booking.status == "pending",
            Booking.expires_at < now,
            Booking.expires_at != None
        ).all()
        for booking in expired:
            booking.status = "cancelled"
            body = booking_expired_unpaid_template(booking)
            send_email(
                booking.customer.email,
                "Booking Cancelled - Payment Not Received",
                body,
                booking=booking,
            )
            print(f"❌ Booking {booking.booking_id} expired automatically")
        db.commit()
        print(f"✅ Checked for expired bookings: {len(expired)} cancelled")
    except Exception as e:
        print(f"Error expiring bookings: {e}")
    finally:
        db.close()


async def send_thank_you_emails_after_checkout():
    """Send thank-you emails for bookings whose stay has completed."""
    db = SessionLocal()
    try:
        today = date.today()
        # Select bookings that have checked out before today and were successfully completed
        bookings = db.query(Booking).filter(
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]),
            Booking.check_out_date < today,
        ).all()

        for booking in bookings:
            # Check if a thank-you email has already been logged for this booking
            subject = f"Thank you for staying with us - Booking #{booking.booking_id}"
            existing_message = (
                db.query(Message)
                .filter(
                    Message.customer_id == booking.customer_id,
                    Message.subject == subject,
                    Message.category == MessageCategory.booking,
                )
                .first()
            )
            if existing_message:
                continue

            body = booking_thank_you_after_stay_template(booking)
            send_email(booking.customer.email, subject, body, booking=booking)
            print(f"📧 Sent thank-you email for completed booking {booking.booking_id}")

        db.commit()
    except Exception as e:
        print(f"Error sending thank-you emails: {e}")
    finally:
        db.close()

def send_email(to: str, subject: str, body: str, booking=None, from_address: str | None = None):
    """Send email using Mailtrap SMTP (test environment)."""
    from models import Message, MessageCategory
    from datetime import datetime

    if not MAILTRAP_USER or not MAILTRAP_PASS:
        # Fallback to console log if Mailtrap is not configured
        print(f"[Mailtrap not configured] Would send email to {to}: {subject}\n{body}")
        return

    try:
      msg = MIMEText(body, "plain", "utf-8")
      # Allow overriding the visible From for staff emails; default to configured sender
      msg["From"] = from_address or MAILTRAP_FROM
      msg["To"] = to
      msg["Subject"] = subject

      with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
          server.login(MAILTRAP_USER, MAILTRAP_PASS)
          server.send_message(msg)
      print(f"[Mailtrap] Email sent to {to}: {subject}")
    except Exception as e:
      print(f"[Mailtrap] Failed to send email to {to}: {e}")

    # Log email to messages table if it's a booking-related email
    if booking:
        db = SessionLocal()
        try:
            message = Message(
                name=booking.customer.name,
                email=booking.customer.email,
                phone=booking.customer.phone,
                subject=subject,
                content=body,
                category=MessageCategory.booking,
                customer_id=booking.customer_id,
                staff_id=None,  # Outbound from system
                is_read=True,  # Mark as read since it's sent
                sent_at=datetime.utcnow()
            )
            db.add(message)
            db.commit()
            print(f"[Messages] Logged outbound booking email for booking {booking.booking_id}")
        except Exception as e:
            print(f"[Messages] Failed to log email to messages table: {e}")
        finally:
            db.close()

# Initialize FastAPI app
app = FastAPI(
    title="Cabin Oasis API",
    description="Backend API for Cabin Oasis booking system",
    version="1.0.0"
)

# Configure CORS
allowed_origins = [
    "http://localhost:5173",  # Admin panel on Vite dev server
    "http://localhost:5174",  # Public website on Vite dev server
    "https://the-cabin-oasis-client.onrender.com",  # Public site on Render
    "https://the-cabin-oasis-admin.onrender.com",  # Admin panel on Render
]

render_backend_url = os.getenv("RENDER_EXTERNAL_URL")
if render_backend_url:
    allowed_origins.append(render_backend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve backend images folder at /images
app.mount("/images", StaticFiles(directory="images"), name="images")

# Security scheme
from routes.staff import oauth2_scheme

# Import routes
from routes.staff import router as staff_router
from routes.cabins import router as cabins_router
from routes.bookings import router as bookings_router
from routes.messages import router as messages_router
from routes.maintenance import router as maintenance_router
from routes.customers import router as customers_router
from routes.notifications import router as notifications_router
from routes.transactions import router as transactions_router
from routes.settings import router as settings_router
from routes.payments import router as payments_router

# Include routers
app.include_router(staff_router, prefix="/api/staff", tags=["Staff Auth"])
app.include_router(cabins_router, prefix="/api/cabins", tags=["Cabins"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(messages_router, prefix="/api/messages", tags=["Messages"])
app.include_router(maintenance_router, prefix="/api/maintenance", tags=["Maintenance"])
app.include_router(customers_router, prefix="/api/customers", tags=["Customers"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Server is running"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Cabin Oasis API"}


@app.get("/api/test-email")
async def test_email():
    """Test endpoint to verify Mailtrap email integration."""
    send_email(
        to=MAILTRAP_FROM,
        subject="Test email from Cabin Oasis",
        body="This is a test email sent via Mailtrap from the Cabin Oasis backend."
    )
    return {"status": "sent"}

@app.on_event("startup")
async def start_expiry_task():
    async def run_periodically():
        while True:
            await expire_pending_bookings()
            await send_thank_you_emails_after_checkout()
            await asyncio.sleep(60)
    asyncio.create_task(run_periodically())

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
