from typing import Any


def booking_confirmed_template(booking: Any) -> str:
    """Plain-text email for a confirmed booking."""
    return (
        f"Dear {booking.customer.name},\n\n"
        f"Your booking at The Cabin Oasis has been confirmed!\n\n"
        f"Cabin: {booking.cabin.name}\n"
        f"Check-in: {booking.check_in_date}\n"
        f"Check-out: {booking.check_out_date}\n"
        f"Guests: {booking.num_guests}\n"
        f"Total: ${booking.total_price}\n"
        f"Booking ID: {booking.booking_id}\n\n"
        f"We look forward to welcoming you.\n"
        f"The Cabin Oasis Team"
    )


def booking_thank_you_after_stay_template(booking: Any) -> str:
    """Plain-text email to thank the guest after their stay."""
    return (
        f"Dear {booking.customer.name},\n\n"
        f"Thank you for staying at The Cabin Oasis! We hope you had a relaxing and memorable time.\n\n"
        f"Stay details:\n"
        f"- Cabin: {booking.cabin.name}\n"
        f"- Check-in: {booking.check_in_date}\n"
        f"- Check-out: {booking.check_out_date}\n"
        f"- Guests: {booking.num_guests}\n"
        f"- Booking ID: {booking.booking_id}\n\n"
        f"We would love to hear your feedback or see any photos from your stay.\n"
        f"If you have any questions or would like to book again, just reply to this email.\n\n"
        f"Warm regards,\n"
        f"The Cabin Oasis Team"
    )


def booking_expired_unpaid_template(booking: Any) -> str:
    """Plain-text email for a booking that expired due to non-payment."""
    return (
        f"Dear {booking.customer.name},\n\n"
        f"Your booking at The Cabin Oasis has expired and was cancelled because payment "+
        f"was not completed in time.\n\n"
        f"Cabin: {booking.cabin.name}\n"
        f"Check-in: {booking.check_in_date}\n"
        f"Check-out: {booking.check_out_date}\n"
        f"Guests: {booking.num_guests}\n"
        f"Booking ID: {booking.booking_id}\n\n"
        f"If you still wish to stay with us, please create a new reservation on our website.\n"
        f"The Cabin Oasis Team"
    )


def booking_cancelled_by_admin_template(booking: Any) -> str:
    """Plain-text email for a booking cancelled manually by staff/admin."""
    return (
        f"Dear {booking.customer.name},\n\n"
        f"Your booking at The Cabin Oasis has been cancelled.\n\n"
        f"Cabin: {booking.cabin.name}\n"
        f"Check-in: {booking.check_in_date}\n"
        f"Check-out: {booking.check_out_date}\n"
        f"Guests: {booking.num_guests}\n"
        f"Booking ID: {booking.booking_id}\n\n"
        f"If this cancellation was not expected, please contact us as soon as possible.\n"
        f"The Cabin Oasis Team"
    )
