import { useState, useEffect } from 'react';
import BookingForm from '../components/bookingForm';

export default function Booking() {
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const storedBookingData = sessionStorage.getItem('bookingData');
    if (storedBookingData) {
      const data = JSON.parse(storedBookingData);
      setBookingData(data);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto py-8 sm:py-12">
          <div className="bg-pine_teal-500/20 backdrop-blur-sm rounded-2xl border border-dry_sage-300/30 p-8 sm:p-12 mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fern-400 mb-6 text-center">Booking</h1>
            <p className="text-lg sm:text-xl text-dry_sage-100 text-center mb-0">Reserve your stay at The Cabin Oasis</p>
          </div>
          
          {/* Display selected room information if available */}
          {bookingData && (
            <div className="bg-green-900/60 backdrop-blur-sm rounded-2xl border border-green-700/50 p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-50 mb-4">Selected Cabin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-200"><span className="font-medium">Cabin:</span> {bookingData.roomName}</p>
                  <p className="text-green-200"><span className="font-medium">Price:</span> ${bookingData.roomPrice}/night</p>
                  <p className="text-green-200"><span className="font-medium">Capacity:</span> {bookingData.roomCapacity} guests</p>
                </div>
                <div>
                  <p className="text-green-200"><span className="font-medium">Check-in:</span> {new Date(bookingData.startDate).toLocaleDateString()}</p>
                  <p className="text-green-200"><span className="font-medium">Check-out:</span> {new Date(bookingData.endDate).toLocaleDateString()}</p>
                  <p className="text-green-200"><span className="font-medium">Total:</span> ${bookingData.total}</p>
                </div>
              </div>
            </div>
          )}
          
          <BookingForm bookingData={bookingData} />
        </div>
      </main>
    </div>
  );
}
