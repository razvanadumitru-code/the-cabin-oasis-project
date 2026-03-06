import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiUrl } from '../config/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Confirming your booking...');

  useEffect(() => {
    const bookingIdParam = searchParams.get('booking_id');
    const sessionId = searchParams.get('session_id');
    if (!bookingIdParam) {
      setStatus('error');
      setMessage('Missing booking information.');
      return;
    }

    const bookingId = Number(bookingIdParam);
    if (!bookingId) {
      setStatus('error');
      setMessage('Invalid booking information.');
      return;
    }

    const confirmBooking = async () => {
      try {
        let endpoint = `/api/payments/confirm-booking/${bookingId}`;
        if (sessionId) {
          endpoint += `?session_id=${encodeURIComponent(sessionId)}`;
        }

        const response = await fetch(apiUrl(endpoint), {
          method: 'POST',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to confirm booking:', errorText);
          setStatus('error');
          if (response.status === 400 && errorText.includes('expired')) {
            setMessage(
              'Your booking has expired before payment confirmation. Please make a new reservation.'
            );
          } else if (response.status === 400 && errorText.includes('not completed')) {
            setMessage(
              'Stripe indicates the payment was not completed. If you were charged, please contact support.'
            );
          } else {
            setMessage('We could not confirm your booking. Please contact support or try again.');
          }
          return;
        }

        const data = await response.json();
        console.log('Booking confirmed:', data);

        // Clear local booking data now that backend has authoritative record
        sessionStorage.removeItem('bookingData');
        sessionStorage.removeItem('userFormData');
        sessionStorage.removeItem('backendBooking');

        setStatus('success');
        setMessage('Your booking is confirmed! A confirmation email has been sent.');
      } catch (err) {
        console.error('Error confirming booking:', err);
        setStatus('error');
        setMessage('An unexpected error occurred while confirming your booking.');
      }
    };

    confirmBooking();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewRooms = () => {
    navigate('/rooms');
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto py-8 sm:py-12">
          <div className="bg-green-900/70 backdrop-blur-sm rounded-2xl border border-green-700/50 p-8 sm:p-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-green-50">
              {status === 'success' ? 'Payment Successful' : status === 'error' ? 'Payment Completed' : 'Processing Payment'}
            </h1>
            <p className="text-green-100 mb-8">{message}</p>

            {status === 'loading' && (
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="px-6 py-3 rounded-lg border border-green-500 text-green-100 hover:bg-green-800/60 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={handleViewRooms}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg transition-colors"
              >
                Explore More Cabins
              </button>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
