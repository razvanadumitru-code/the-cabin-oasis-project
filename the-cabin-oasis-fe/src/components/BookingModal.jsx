import { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function BookingModal({ room, onClose, onBook }) {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleBook = () => {
    onBook({
      roomId: room.id,
      roomName: room.name,
      startDate: dateRange[0].startDate,
      endDate: dateRange[0].endDate,
      price: room.price,
      total: calculateTotal()
    });
  };

  const calculateTotal = () => {
    const diffTime = Math.abs(dateRange[0].endDate - dateRange[0].startDate);
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays * room.price;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-green-900/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl border border-green-700/50" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-green-50">Book {room.name}</h3>
          <button 
            onClick={onClose}
            className="text-green-200 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            minDate={new Date()}
            className="date-range"
          />
        </div>
        
        <div className="bg-green-800/50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-green-200 text-sm">Check-in</p>
              <p className="text-green-50 font-medium">
                {format(dateRange[0].startDate, 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Check-out</p>
              <p className="text-green-50 font-medium">
                {format(dateRange[0].endDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="border-t border-green-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-green-200">Total for {Math.max(1, Math.round((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)))} nights:</span>
              <span className="text-green-50 font-bold text-xl">${calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-green-100 hover:bg-green-800/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBook}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
