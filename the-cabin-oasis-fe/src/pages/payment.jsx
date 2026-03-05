import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { apiUrl } from '../config/api';

export default function PaymentMethod() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [backendBooking, setBackendBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const storedBookingData = sessionStorage.getItem('bookingData');
    const storedFormData = sessionStorage.getItem('userFormData');
    const storedBackendBooking = sessionStorage.getItem('backendBooking');
    
    if (storedBookingData) {
      const data = JSON.parse(storedBookingData);
      setBookingData(data);
    }
    
    if (storedBackendBooking) {
      setBackendBooking(JSON.parse(storedBackendBooking));
    }
  }, []);
  const startStripeCheckout = async () => {
    if (!backendBooking) {
      alert('No backend booking found. Please go back and start your booking again.');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch(apiUrl('/api/payments/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: backendBooking.booking_id }),
      });

      console.log('Create Checkout Session response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create checkout session:', errorText);
        alert('Could not start payment. Please try again or restart your booking.');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      if (!data.checkout_url) {
        alert('Payment service did not return a checkout URL.');
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('Error starting Stripe Checkout:', err);
      alert('An unexpected error occurred while starting payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/booking');
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto py-8 sm:py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg">No booking data found. Please start over.</p>
              <button
                onClick={() => navigate('/rooms')}
                className="mt-4 px-6 py-2 bg-fern-500 text-white rounded-lg hover:bg-fern-600"
              >
                Go to Rooms
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto py-8 sm:py-12">
          {/* Header */}
          <div className="bg-pine_teal-500/20 backdrop-blur-sm rounded-2xl border border-dry_sage-300/30 p-8 sm:p-12 mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fern-400 mb-6 text-center">Payment Method</h1>
            <p className="text-lg sm:text-xl text-dry_sage-100 text-center mb-0">Complete your booking securely</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-green-900/60 backdrop-blur-sm rounded-2xl border border-green-700/50 p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-50 mb-4">Booking Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-green-200"><span className="font-medium">Cabin:</span> {bookingData.roomName}</p>
                <p className="text-green-200"><span className="font-medium">Price:</span> ${bookingData.roomPrice}/night</p>
                <p className="text-green-200"><span className="font-medium">Guests:</span> {bookingData.guests || 1}</p>
              </div>
              <div>
                <p className="text-green-200"><span className="font-medium">Check-in:</span> {format(new Date(bookingData.startDate), 'MMM dd, yyyy')}</p>
                <p className="text-green-200"><span className="font-medium">Check-out:</span> {format(new Date(bookingData.endDate), 'MMM dd, yyyy')}</p>
                <p className="text-green-200"><span className="font-medium text-lg">Total:</span> ${bookingData.total}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="space-y-6">
                <p className="text-dust_grey-800">
                  You will be redirected to Stripe to complete your payment securely in test mode.
                  Use Stripe test cards (for example, <code>4242 4242 4242 4242</code>) when prompted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border border-dust_grey-300 text-dust_grey-700 rounded-lg hover:bg-dust_grey-50 transition-colors duration-200"
                  >
                    Back to Booking
                  </button>
                  <motion.button
                    type="button"
                    onClick={startStripeCheckout}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-fern-500 to-hunter_green-500 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fern-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isProcessing ? 1 : 1.01 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.99 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Pay with Stripe (Test Mode)</span>
                        <span className="font-bold">${bookingData.total}</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
