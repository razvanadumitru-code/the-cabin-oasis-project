import { useEffect, useState } from 'react';
import RoomCard from '../components/roomCard';
import BookingSection from '../components/BookingSection';
import standardCabinImage from '../images/standard_cabin.png';
import deluxeCabinImage from '../images/deluxe_cabin.png';
import suiteCabinImage from '../images/suite_cabin.jfif';
import forestviewCabinImage from '../images/forestview_cabin.png';
import mountainviewCabinImage from '../images/mountainview_cabin.png';
import lakeviewCabinImage from '../images/lakeview_cabin.png';

// Sample room data - in a real app, this would come from an API
const fallbackRoomData = [
  {
    id: 1,
    name: 'Standard Cabin',
    description: 'Cozy cabin perfect for couples',
    price: 150,
    capacity: 2,
    type: 'standard',
    image: standardCabinImage,
  },
  {
    id: 2,
    name: 'Deluxe Cabin',
    description: 'Spacious cabin with premium amenities',
    price: 250,
    capacity: 4,
    type: 'deluxe',
    image: deluxeCabinImage,
  },
  {
    id: 3,
    name: 'Cabin Suite',
    description: 'Luxury suite with full kitchen',
    price: 350,
    capacity: 6,
    type: 'suite',
    image: suiteCabinImage,
  },
  {
    id: 4,
    name: 'Forest View Cabin',
    description: 'Rustic cabin with stunning forest views',
    price: 200,
    capacity: 3,
    type: 'forest-view',
    image: forestviewCabinImage,
  },
  {
    id: 5,
    name: 'Mountain View Cabin',
    description: 'Panoramic mountain views from your private deck',
    price: 300,
    capacity: 4,
    type: 'mountain-view',
    image: mountainviewCabinImage,
  },
  {
    id: 6,
    name: 'Lakeside Cabin',
    description: 'Waterfront cabin with private dock access',
    price: 400,
    capacity: 6,
    type: 'lakeside',
    image: lakeviewCabinImage,
  },
];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    maxPrice: 1000, // Allow higher backend prices by default
    capacity: 0,
  });
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        // Only fetch cabins that are publicly available
        const response = await fetch('http://localhost:3000/api/cabins/?status_filter=available');
        console.log('Cabins API raw response:', response);
        if (!response.ok) {
          console.error('Cabins API returned non-OK status:', response.status);
          setRooms(fallbackRoomData);
          return;
        }
        const data = await response.json();
        console.log('Cabins API data:', data);

        const mappedRooms = (data || []).map((cabin) => {
          const nameLower = (cabin.name || '').toLowerCase();

          let type = 'standard';
          if (nameLower.includes('deluxe')) type = 'deluxe';
          else if (nameLower.includes('suite')) type = 'suite';
          else if (nameLower.includes('forest')) type = 'forest-view';
          else if (nameLower.includes('mountain')) type = 'mountain-view';
          else if (nameLower.includes('lake') || nameLower.includes('lakeside')) type = 'lakeside';

          return {
            id: cabin.id,
            name: cabin.name,
            description: cabin.description,
            // Match backend schema: price_per_night & capacity
            price: cabin.price_per_night,
            capacity: cabin.capacity,
            type,
            image: cabin.image_url || standardCabinImage,
          };
        });

        if (mappedRooms.length === 0) {
          setRooms(fallbackRoomData);
        } else {
          setRooms(mappedRooms);
        }
      } catch (error) {
        console.error('Error fetching cabins:', error);
        setRooms(fallbackRoomData);
      }
    };

    fetchCabins();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: name === 'maxPrice' || name === 'capacity' ? Number(value) : value,
    });
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      (filters.type === 'all' || room.type === filters.type) &&
      room.price <= filters.maxPrice &&
      room.capacity >= filters.capacity
    );
  });

  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mt-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto py-8 sm:py-12">
          <div className="bg-pine_teal-500/20 backdrop-blur-sm rounded-2xl border border-dry_sage-300/30 p-8 sm:p-12 mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fern-400 mb-6 text-center">Our Cabins</h1>
            <p className="text-lg sm:text-xl text-dry_sage-100 text-center mb-0">Find your perfect mountain retreat</p>
          </div>
          
          {/* Filter Bar */}
          <div className="bg-green-900/60 backdrop-blur-sm rounded-xl p-6 mb-12 border border-green-700/50">
            <h2 className="text-xl font-semibold text-green-50 mb-4">Filter Cabins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type" className="block text-green-100 text-sm font-medium mb-1">Cabin Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full bg-green-800/50 border border-green-600 text-green-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="standard">Standard Cabin</option>
                  <option value="deluxe">Deluxe Cabin</option>
                  <option value="suite">Cabin Suite</option>
                  <option value="forest-view">Forest View</option>
                  <option value="mountain-view">Mountain View</option>
                  <option value="lakeside">Lakeside Cabin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maxPrice" className="block text-green-100 text-sm font-medium mb-1">
                  Max Price: ${filters.maxPrice}
                </label>
                <input
                  type="range"
                  id="maxPrice"
                  name="maxPrice"
                  min="150"
                  max="1000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full h-2 bg-green-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-green-300 mt-1">
                  <span>$150</span>
                  <span>$1000+</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="capacity" className="block text-green-100 text-sm font-medium mb-1">
                  Minimum Capacity: {filters.capacity > 0 ? `${filters.capacity}+ guests` : 'Any'}
                </label>
                <select
                  id="capacity"
                  name="capacity"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                  className="w-full bg-green-800/50 border border-green-600 text-green-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="0">Any</option>
                  <option value="1">1+ guests</option>
                  <option value="2">2+ guests</option>
                  <option value="4">4+ guests</option>
                  <option value="6">6+ guests</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onSelectRoom={setSelectedRoom}
                  isSelected={selectedRoom?.id === room.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-green-200 text-lg">No cabins match your filters. Try adjusting your search criteria.</p>
              </div>
            )}
          </div>

          <BookingSection 
            selectedRoom={selectedRoom} 
          />
        </div>
      </main>
    </div>
  );
}
