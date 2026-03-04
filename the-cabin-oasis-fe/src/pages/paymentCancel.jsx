import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    console.log('Payment cancelled for booking:', bookingId);
    // We intentionally do not cancel the booking here; it will expire after 15 minutes
  }, [searchParams]);

  const handleRetry = () => {
    navigate('/payment');
  };

  const handleBackToRooms = () => {
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
          <div className="bg-red-900/70 backdrop-blur-sm rounded-2xl border border-red-700/50 p-8 sm:p-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-red-50">Payment Not Completed</h1>
            <p className="text-red-100 mb-6">
              Your Stripe payment was cancelled or did not complete. Your booking will remain pending
              for a short time and will automatically expire if not paid.
            </p>
            <p className="text-red-100 mb-8">
              You can try the payment again or go back to browse other cabins.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg transition-colors"
              >
                Try Payment Again
              </button>
              <button
                onClick={handleBackToRooms}
                className="px-6 py-3 rounded-lg border border-red-500 text-red-100 hover:bg-red-800/60 transition-colors"
              >
                Back to Rooms
              </button>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
