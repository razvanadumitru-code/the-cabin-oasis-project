import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CabinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cabin, setCabin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    const fetchCabin = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`http://localhost:3000/api/cabins/${id}`);
        console.log('Cabin details API response:', response);
        if (!response.ok) {
          setError('Unable to load cabin details.');
          setCabin(null);
          return;
        }
        const data = await response.json();
        console.log('Cabin details API data:', data);

        const gallery = Array.isArray(data.gallery) && data.gallery.length
          ? data.gallery
          : (data.image_url ? [data.image_url] : []);

        // Backend stores amenities as a single text field; convert to list for frontend
        let amenities = [];
        if (Array.isArray(data.amenities)) {
          amenities = data.amenities.map((name) => ({ name, icon: '•' }));
        } else if (typeof data.amenities === 'string' && data.amenities.trim()) {
          const items = data.amenities
            .split(/[,\n\r\u2022]/)
            .map((s) => s.trim())
            .filter(Boolean);
          amenities = items.map((name) => ({ name, icon: '•' }));
        }

        const mappedCabin = {
          id: data.id,
          name: data.name,
          description: data.description,
          detailedDescription: data.detailed_description || data.description,
          price: data.price_per_night,
          capacity: data.capacity,
          type: data.type || data.status,
          image: data.image_url,
          gallery,
          amenities,
          location: data.location,
        };

        setCabin(mappedCabin);
      } catch (e) {
        console.error('Error loading cabin details:', e);
        setError('Unable to load cabin details.');
        setCabin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCabin();
  }, [id]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!cabin || !selectedDates.checkIn || !selectedDates.checkOut) {
        setIsAvailable(null);
        setAvailabilityMessage('');
        return;
      }

      const checkIn = selectedDates.checkIn;
      const checkOut = selectedDates.checkOut;

      try {
        setIsCheckingAvailability(true);
        setAvailabilityMessage('Checking availability...');

        const response = await fetch(
          `http://localhost:3000/api/cabins/available/${checkIn}/${checkOut}`
        );
        console.log('Cabin availability API response:', response);

        if (!response.ok) {
          setIsAvailable(null);
          setAvailabilityMessage('Could not verify availability. Please try again.');
          return;
        }

        const data = await response.json();
        console.log('Cabin availability API data:', data);

        const cabins = Array.isArray(data.cabins) ? data.cabins : [];
        const found = cabins.some((c) => c.id === cabin.id);

        if (found) {
          setIsAvailable(true);
          setAvailabilityMessage('This cabin is available for your selected dates.');
        } else {
          setIsAvailable(false);
          setAvailabilityMessage('This cabin is not available for your selected dates. Please change dates or choose another cabin.');
        }
      } catch (e) {
        console.error('Error checking cabin availability:', e);
        setIsAvailable(null);
        setAvailabilityMessage('Could not verify availability due to a network error.');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [cabin, selectedDates]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto py-8 sm:py-12 text-center">
            <h1 className="text-3xl font-bold text-fern-400 mb-4">Loading cabin details...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (!cabin || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto py-8 sm:py-12 text-center">
            <h1 className="text-3xl font-bold text-fern-400 mb-4">Cabin Not Found</h1>
            <p className="text-fern-200 mb-8">The cabin you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/rooms')}
              className="px-6 py-2 bg-fern-600 text-white rounded-lg hover:bg-fern-500 transition-colors"
            >
              Back to Rooms
            </button>
          </div>
        </main>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!cabin || !selectedDates.checkIn || !selectedDates.checkOut) return cabin ? cabin.price : 0;
    
    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * cabin.price : cabin.price;
  };

  const calculateNights = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 1;
    
    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights : 1;
  };

  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cabin.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + cabin.gallery.length) % cabin.gallery.length);
  };

  const handleBooking = () => {
    if (isAvailable === false) {
      return;
    }
    // Store booking data and navigate to booking
    const bookingData = {
      roomId: cabin.id,
      roomName: cabin.name,
      roomType: cabin.type,
      roomPrice: cabin.price,
      roomCapacity: cabin.capacity,
      startDate: selectedDates.checkIn ? new Date(selectedDates.checkIn) : new Date(),
      endDate: selectedDates.checkOut ? new Date(selectedDates.checkOut) : new Date(),
      total: calculateTotal()
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/booking');
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/rooms')}
              className="text-fern-300 hover:text-fern-200 transition-colors mb-4 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Rooms</span>
            </button>
            <h1 className="text-4xl sm:text-5xl font-bold text-fern-400 mb-2">{cabin.name}</h1>
            {cabin.location && (
              <p className="text-base sm:text-lg font-semibold text-fern-300 mb-1">{cabin.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-fern-400/30">
                <div className="relative">
                  <div className="w-full h-96 cursor-pointer" onClick={() => openGallery(0)}>
                    <img 
                      src={cabin.gallery[0]} 
                      alt={cabin.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">View Gallery ({cabin.gallery.length} photos)</p>
                      </div>
                    </div>
                  </div>
                  {/* Thumbnail Gallery */}
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {cabin.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-20 h-20 cursor-pointer rounded overflow-hidden border-2 border-transparent hover:border-fern-400 transition-colors"
                        onClick={() => openGallery(index)}
                      >
                        <img src={image} alt={`${cabin.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-fern-400/30">
                <h2 className="text-2xl font-bold text-fern-400 mb-4">About This Cabin</h2>
                <p className="text-fern-100 leading-relaxed">{cabin.detailedDescription}</p>
              </div>

              {/* Amenities */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-fern-400/30">
                <h2 className="text-2xl font-bold text-fern-400 mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cabin.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-fern-100">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : 'sticky top-24'} bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-fern-400/30 shadow-lg`}>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-fern-400">Booking Details</h3>
                    <span className="text-2xl font-bold text-fern-300">${cabin.price}</span>
                  </div>
                  <p className="text-fern-200 text-sm mb-4">per night • Max {cabin.capacity} guests</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-fern-200 text-sm font-medium mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={selectedDates.checkIn}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/20 border border-fern-400/30 rounded-lg text-fern-100 placeholder-fern-300/50 focus:outline-none focus:ring-2 focus:ring-fern-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-fern-200 text-sm font-medium mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={selectedDates.checkOut}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/20 border border-fern-400/30 rounded-lg text-fern-100 placeholder-fern-300/50 focus:outline-none focus:ring-2 focus:ring-fern-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-fern-200 text-sm font-medium mb-2">Number of Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-white/20 border border-fern-400/30 rounded-lg text-fern-100 focus:outline-none focus:ring-2 focus:ring-fern-400 focus:border-transparent"
                    >
                      {[...Array(Math.min(cabin.capacity, 6))].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-pine_teal-800">
                          {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Pricing Display */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 border border-fern-400/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-fern-200">${cabin.price} x {calculateNights()} nights</span>
                    <span className="text-fern-100 font-medium">${cabin.price * calculateNights()}</span>
                  </div>
                  <div className="border-t border-fern-400/30 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-fern-300">Total</span>
                      <span className="text-2xl font-bold text-fern-100">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {availabilityMessage && (
                  <div className="mb-4 text-sm">
                    <p
                      className={
                        isAvailable === false
                          ? 'text-red-300'
                          : 'text-fern-200'
                      }
                    >
                      {availabilityMessage}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={isCheckingAvailability || isAvailable === false}
                  className={`w-full py-3 px-6 rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isCheckingAvailability || isAvailable === false
                      ? 'bg-green-800/50 text-green-400 cursor-not-allowed'
                      : 'bg-fern-600 text-white hover:bg-fern-500'
                  }`}
                >
                  Book This Cabin
                </button>

                <div className="mt-6 pt-6 border-t border-fern-400/30">
                  <div className="text-center">
                    <p className="text-fern-200 text-sm mb-2">Need help?</p>
                    <button 
                      onClick={() => {
                        // Trigger chatbot to open
                        const chatbotEvent = new CustomEvent('openChatbot');
                        window.dispatchEvent(chatbotEvent);
                      }}
                      className="text-fern-400 hover:text-fern-300 text-sm font-medium"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Gallery */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeGallery}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={cabin.gallery[currentImageIndex]}
                alt={`${cabin.name} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Close Button */}
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {cabin.gallery.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
