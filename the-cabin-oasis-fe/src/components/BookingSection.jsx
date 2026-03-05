import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function BookingSection({ selectedRoom }) {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null); // null = not checked yet
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  useEffect(() => {
    if (selectedRoom) {
      const element = document.getElementById('booking-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedRoom]);

  // Check availability whenever selected room or dates change
  useEffect(() => {
    const checkAvailability = async () => {
      // Only check when a room is selected
      if (!selectedRoom) {
        setIsAvailable(null);
        setAvailabilityMessage('');
        return;
      }

      const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

      try {
        setIsCheckingAvailability(true);
        setAvailabilityMessage('Checking availability...');

        const response = await fetch(
          apiUrl(`/api/cabins/available/${checkIn}/${checkOut}`)
        );
        console.log('Availability API raw response:', response);

        if (!response.ok) {
          console.error('Availability API returned non-OK status:', response.status);
          setIsAvailable(null);
          setAvailabilityMessage('Could not verify availability. Please try again.');
          return;
        }

        const data = await response.json();
        console.log('Availability API data:', data);

        const cabins = Array.isArray(data.cabins) ? data.cabins : [];
        const found = cabins.some((cabin) => cabin.id === selectedRoom.id);

        if (found) {
          setIsAvailable(true);
          setAvailabilityMessage('Good news! This cabin is available for your selected dates.');
        } else {
          setIsAvailable(false);
          setAvailabilityMessage('This cabin is not available for your selected dates. Please adjust dates or choose another cabin.');
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(null);
        setAvailabilityMessage('Could not verify availability due to a network error.');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedRoom, dateRange]);

  const handleDateChange = (field, value) => {
    // Properly parse the date string from HTML date input
    // HTML date inputs return 'yyyy-MM-dd' format, which needs to be parsed correctly
    const parsedDate = new Date(value + 'T00:00:00'); // Add time to ensure local timezone
    
    const newDateRange = [...dateRange];
    newDateRange[0][field] = parsedDate;
    
    // If changing start date, ensure end date is not before start date
    if (field === 'startDate' && parsedDate > newDateRange[0].endDate) {
      // Set end date to one day after start date if it's invalid
      const nextDay = new Date(parsedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      newDateRange[0].endDate = nextDay;
    }
    
    setDateRange(newDateRange);
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const diffTime = Math.abs(dateRange[0].endDate - dateRange[0].startDate);
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays * selectedRoom.price;
  };

  const handleSubmit = () => {
    // Prevent booking if we have a negative availability check
    if (isAvailable === false) {
      return;
    }
    const bookingData = {
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomType: selectedRoom.type,
      roomPrice: selectedRoom.price,
      roomCapacity: selectedRoom.capacity,
      startDate: dateRange[0].startDate,
      endDate: dateRange[0].endDate,
      total: calculateTotal()
    };
    
    // Store booking data in sessionStorage to pass to booking page
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to booking page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    navigate('/booking');
  };

  return (
    <section id="booking-section" className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="bg-green-900/60 backdrop-blur-sm rounded-2xl border border-green-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700/50 to-green-600/50 p-6 border-b border-green-600/30">
            <h2 className="text-2xl font-bold text-green-50 text-center">Reservation Details</h2>
          </div>
          
          {/* Room Details */}
          <div className="p-6 border-b border-green-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-green-50 mb-1">
                  {selectedRoom ? selectedRoom.name : 'Select a Room'}
                </h3>
                {selectedRoom ? (
                  <div className="flex items-center gap-4 text-green-200">
                    <span>${selectedRoom.price}/night</span>
                    <span>Max {selectedRoom.capacity} guests</span>
                  </div>
                ) : (
                  <p className="text-green-300">Please select a cabin to proceed</p>
                )}
              </div>
              {selectedRoom && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-50">${calculateTotal()}</div>
                  <div className="text-sm text-green-300">Total Amount</div>
                </div>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="p-6 border-b border-green-600/30">
            <h4 className="text-lg font-semibold text-green-50 mb-4">Stay Dates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-green-200 text-sm mb-2">Check-in</label>
                <input
                  type="date"
                  value={format(dateRange[0].startDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-green-800/50 border border-green-600 text-green-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-green-200 text-sm mb-2">Check-out</label>
                <input
                  type="date"
                  value={format(dateRange[0].endDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={format(dateRange[0].startDate, 'yyyy-MM-dd')}
                  className="w-full bg-green-800/50 border border-green-600 text-green-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            {selectedRoom && (
              <div className="mt-4 text-sm">
                <p
                  className={
                    isAvailable === false
                      ? 'text-red-300'
                      : 'text-green-300'
                  }
                >
                  {availabilityMessage}
                </p>
              </div>
            )}
            {selectedRoom && (
              <div className="mt-3 text-sm text-green-300">
                {Math.max(1, Math.round((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)))} nights
              </div>
            )}
          </div>


          {/* Booking Button */}
          <div className="p-6">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                !selectedRoom ||
                isCheckingAvailability ||
                isAvailable === false
              }
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                selectedRoom && isAvailable !== false
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                  : 'bg-green-800/50 text-green-400 cursor-not-allowed'
              }`}
            >
              Proceed to Check out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
