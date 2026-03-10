import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';

const BookingForm = ({ bookingData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomType: 'standard',
    guests: 1,
    specialRequests: ''
  });
  const [backendBooking, setBackendBooking] = useState(null);

  useEffect(() => {
    if (bookingData) {
      setFormData(prev => ({
        ...prev,
        checkIn: format(new Date(bookingData.startDate), 'yyyy-MM-dd'),
        checkOut: format(new Date(bookingData.endDate), 'yyyy-MM-dd'),
        roomType: bookingData.roomType,
        guests: Math.min(bookingData.roomCapacity, 6) // Cap at 6 for the select options
      }));
    }

    // Load existing backend booking if present (pending booking awaiting payment)
    const storedBackendBooking = sessionStorage.getItem('backendBooking');
    if (storedBackendBooking) {
      try {
        setBackendBooking(JSON.parse(storedBackendBooking));
      } catch (e) {
        console.error('Failed to parse backendBooking from sessionStorage', e);
      }
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingData) {
      console.error('No bookingData found in BookingForm');
      return;
    }

    // Merge bookingData from selection with form input, ensuring dates/total are up to date
    let completeBookingData = {
      ...formData,
      ...bookingData
    };

    if (bookingData) {
      const checkInDate = new Date(formData.checkIn + 'T00:00:00');
      const checkOutDate = new Date(formData.checkOut + 'T00:00:00');
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      const updatedTotal = diffDays * bookingData.roomPrice;

      completeBookingData = {
        ...completeBookingData,
        startDate: checkInDate.toISOString(),
        endDate: checkOutDate.toISOString(),
        total: updatedTotal,
      };
    }

    const payload = {
      cabin_id: bookingData.roomId,
      check_in_date: formData.checkIn,
      check_out_date: formData.checkOut,
      guests: Number(formData.guests) || 1,
      special_requests: formData.specialRequests || null,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
    };

    try {
      let createdOrUpdatedBooking = null;

      const createNewBooking = async () => {
        const response = await fetch(apiUrl('/api/bookings/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Create booking API response:', response);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to create booking:', errorText);
          alert('Could not create booking. Please check your details and try again.');
          return null;
        }

        const data = await response.json();
        console.log('Created booking:', data);
        return data;
      };

      // If we already have a pending backend booking, update it to keep the same ID
      if (backendBooking && backendBooking.status === 'pending') {
        const updateResponse = await fetch(
          apiUrl(`/api/bookings/public-update-pending/${backendBooking.booking_id}`),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        console.log('Update pending booking API response:', updateResponse);

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Failed to update pending booking:', errorText);
          const normalized = errorText.toLowerCase();

          const isStaleBooking =
            updateResponse.status === 400 &&
            (normalized.includes('only pending bookings') || normalized.includes('expired'));

          if (isStaleBooking) {
            // Clear stale booking cache and fall back to creating a brand new booking
            sessionStorage.removeItem('backendBooking');
            createdOrUpdatedBooking = await createNewBooking();
            if (!createdOrUpdatedBooking) {
              return;
            }
          } else {
            alert('Could not update your booking. It may have expired; please try again.');
            return;
          }
        } else {
          createdOrUpdatedBooking = await updateResponse.json();
          console.log('Updated booking:', createdOrUpdatedBooking);
        }
      } else {
        // No existing pending booking, create a new one
        createdOrUpdatedBooking = await createNewBooking();
        if (!createdOrUpdatedBooking) {
          return;
        }
      }

      // Store user form data and backend booking in sessionStorage
      sessionStorage.setItem('userFormData', JSON.stringify(formData));
      sessionStorage.setItem('bookingData', JSON.stringify(completeBookingData));
      sessionStorage.setItem('backendBooking', JSON.stringify(createdOrUpdatedBooking));

      // Navigate to payment page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      navigate('/payment');
    } catch (err) {
      console.error('Error calling create booking API:', err);
      alert('An unexpected error occurred while creating your booking. Please try again.');
    }
  };

  const roomTypes = [
    { id: 'standard', name: 'Standard Cabin', price: '$150/night' },
    { id: 'deluxe', name: 'Deluxe Cabin', price: '$250/night' },
    { id: 'suite', name: 'Cabin Suite', price: '$350/night' },
    { id: 'forest-view', name: 'Forest View Cabin', price: '$200/night' },
    { id: 'mountain-view', name: 'Mountain View Cabin', price: '$300/night' },
    { id: 'lakeside', name: 'Lakeside Cabin', price: '$400/night' },
  ];

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-pine_teal-600 mb-2">Book Your Stay</h2>
            <p className="text-dust_grey-100">Experience nature's tranquility in our cozy cabins</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-pine_teal-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-black placeholder-dust_grey-400 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-pine_teal-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-pine_teal-900 placeholder-dust_grey-400 transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-pine_teal-700">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-pine_teal-900 placeholder-dust_grey-400 transition-all duration-200"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <label htmlFor="checkIn" className="block text-sm font-medium text-pine_teal-700">Check-in Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-pine_teal-900 placeholder-dust_grey-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <label htmlFor="checkOut" className="block text-sm font-medium text-pine_teal-700">Check-out Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-pine_teal-900 placeholder-dust_grey-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Room Type - Read-only if pre-selected */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-pine_teal-700 mb-2">Room Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {roomTypes.map((room) => (
                    <div key={room.id} className="relative">
                      <input
                        type="radio"
                        id={room.id}
                        name="roomType"
                        value={room.id}
                        checked={formData.roomType === room.id}
                        onChange={handleChange}
                        disabled={bookingData && bookingData.roomType === room.id}
                        className="peer hidden"
                      />
                      <label
                        htmlFor={room.id}
                        className={`block p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.roomType === room.id
                            ? 'border-fern-500 bg-fern-50 shadow-md'
                            : 'border-dust_grey-300 hover:border-fern-300'
                        } ${
                          bookingData && bookingData.roomType === room.id
                            ? 'opacity-75 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <div className="text-sm font-semibold text-fern-700">{room.name}</div>
                        <div className="text-xs text-fern-500">{room.price}</div>
                        {bookingData && bookingData.roomType === room.id && (
                          <div className="text-xs text-fern-500 mt-1">Selected</div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {bookingData && (
                  <p className="text-xs text-dust_grey-500 mt-1">Room type pre-selected from your cabin choice</p>
                )}
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <label htmlFor="guests" className="block text-sm font-medium text-pine_teal-700">Number of Guests</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-fern-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-black"
                  >
                    {[1, 2, 3, 4, 5, '6+'].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="specialRequests" className="block text-sm font-medium text-pine_teal-700">
                  Special Requests
                  <span className="text-dust_grey-500 font-normal ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows="3"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-dust_grey-300 rounded-lg focus:ring-2 focus:ring-fern-200 focus:border-fern-400 text-black placeholder-dust_grey-400 transition-all duration-200"
                    placeholder="Any special requirements or requests?"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-dust_grey-400">
                    {formData.specialRequests.length}/200
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-fern-500 to-hunter_green-500 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fern-300 focus:ring-offset-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Proceed to Payment</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>

            {/* Booking Policy */}
            <p className="text-xs text-center text-dust_grey-500 mt-4">
              By completing this booking, you agree to our{' '}
              <a href="/terms" className="text-fern-600 hover:underline">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-fern-600 hover:underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

BookingForm.propTypes = {
  bookingData: PropTypes.shape({
    roomId: PropTypes.number,
    roomName: PropTypes.string,
    roomType: PropTypes.string,
    roomPrice: PropTypes.number,
    roomCapacity: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    total: PropTypes.number
  })
};

export default BookingForm;
