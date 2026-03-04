export default function RoomCard({ room, onSelectRoom, isSelected }) {
  const handleBookClick = (e) => {
    e.preventDefault();
    // If already selected, unselect it. Otherwise, select it.
    onSelectRoom(isSelected ? null : room);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    // Navigate to cabin details page
    window.location.href = `/cabin/${room.id}`;
  };

  return (
    <div className={`flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${
      isSelected 
        ? 'border-fern-400 ring-2 ring-fern-400 shadow-lg shadow-fern-400/20' 
        : 'border-fern-400/30 hover:border-fern-400/50 hover:shadow-fern-400/10'
    }`}>
      {isSelected && (
        <div className="bg-fern-600 text-white text-center py-2 text-sm font-semibold">
          ✓ Selected for Booking
        </div>
      )}
      <div className="w-full h-48 flex-shrink-0 overflow-hidden">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-bold text-fern-400 mb-2">{room.name}</h3>
        <p className="text-fern-100 mb-4 line-clamp-3">{room.description}</p>
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-fern-300 font-semibold">${room.price}/night</span>
            <span className="text-fern-200">Max {room.capacity} guests</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleBookClick}
              className={`flex-1 py-2 px-4 rounded-lg transition-all hover:shadow-md ${
                isSelected 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-fern-600 hover:bg-fern-500 text-white hover:shadow-fern-400/20'
              }`}
            >
              {isSelected ? 'Selected ✓' : 'Book Now'}
            </button>
            <button
              onClick={handleViewDetails}
              className="flex-1 py-2 px-4 rounded-lg border border-fern-400/50 text-fern-300 hover:border-fern-400 hover:text-fern-200 transition-all duration-200 bg-white/5 hover:bg-white/10 shadow-sm hover:shadow-md"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
