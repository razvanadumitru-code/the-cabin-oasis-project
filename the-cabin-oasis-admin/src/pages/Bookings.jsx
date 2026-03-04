import { Search, Filter, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Modal states
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', special_requests: '' });
  const [newBookingForm, setNewBookingForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    cabin_id: '',
    check_in_date: '',
    check_out_date: '',
    guests: 1,
    special_requests: ''
  });
  const [highlightBookingId, setHighlightBookingId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchBookings();
    fetchCabins();
  }, []);

  // When navigated from notifications, highlight and open the target booking
  useEffect(() => {
    if (location.state && location.state.highlightBookingId) {
      setHighlightBookingId(location.state.highlightBookingId);
    }
  }, [location.state]);

  useEffect(() => {
    if (highlightBookingId && bookings.length > 0) {
      const bookingToShow = bookings.find(
        (b) => b.booking_id === highlightBookingId
      );
      if (bookingToShow) {
        setSelectedBooking(bookingToShow);
        setShowView(true);
      }
    }
  }, [highlightBookingId, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/admin/all');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCabins = async () => {
    try {
      const response = await api.get('/cabins/');
      setCabins(response.data);
    } catch (error) {
      console.error('Error fetching cabins:', error);
    }
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.booking_id));
    }
  };

  const handleBulkCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel ${selectedBookings.length} bookings?`)) return;
    
    try {
      await Promise.all(selectedBookings.map(id => api.put(`/bookings/${id}/cancel`)));
      fetchBookings();
      setSelectedBookings([]);
    } catch (error) {
      console.error('Error bulk cancelling bookings:', error);
      alert('Failed to cancel some bookings');
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      await Promise.all(selectedBookings.map(id => api.put(`/bookings/${id}`, { status: newStatus })));
      fetchBookings();
      setSelectedBookings([]);
    } catch (error) {
      console.error('Error bulk updating bookings:', error);
      alert('Failed to update some bookings');
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowView(true);
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      special_requests: booking.special_requests || ''
    });
    setShowEdit(true);
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedBooking) {
        throw new Error('No booking selected for update');
      }

      // Update booking status / special requests via backend API
      await api.put(`/bookings/${selectedBooking.booking_id}`, editForm);
      fetchBookings();
      setShowEdit(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const handleNewBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        cabin_id: parseInt(newBookingForm.cabin_id),
        check_in_date: newBookingForm.check_in_date,
        check_out_date: newBookingForm.check_out_date,
        guests: parseInt(newBookingForm.guests),
        special_requests: newBookingForm.special_requests,
        customer_name: newBookingForm.customer_name,
        customer_email: newBookingForm.customer_email,
        customer_phone: newBookingForm.customer_phone
      };
      await api.post('/bookings/', bookingData);
      fetchBookings();
      setShowNew(false);
      setNewBookingForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        cabin_id: '',
        check_in_date: '',
        check_out_date: '',
        guests: 1,
        special_requests: ''
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  // Filter bookings based on search term, status, and payment status
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      booking.customer?.name?.toLowerCase().includes(searchLower) ||
      booking.customer?.email?.toLowerCase().includes(searchLower) ||
      booking.booking_id?.toString().toLowerCase().includes(searchLower) ||
      booking.cabin?.name?.toLowerCase().includes(searchLower);
    const matchesStatus = !selectedStatus || booking.status === selectedStatus;
    // Derive a simple payment status from booking status:
    // - confirmed  -> paid
    // - cancelled  -> unpaid (expired or cancelled before payment)
    // - otherwise  -> pending
    const paymentStatus =
      booking.status === 'confirmed'
        ? 'paid'
        : booking.status === 'cancelled'
        ? 'unpaid'
        : 'pending';
    const matchesPaymentStatus = !selectedPaymentStatus || paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status) => {
    const paymentStatus =
      status === 'confirmed'
        ? 'paid'
        : status === 'cancelled'
        ? 'unpaid'
        : 'pending';
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800'
    };
    return styles[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Bookings</h2>
            <p className="text-slate-400">Manage all cabin reservations and bookings</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            New Booking
          </button>
        </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {selectedBookings.length} {selectedBookings.length === 1 ? 'booking' : 'bookings'} selected
          </span>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 bg-slate-700 text-white rounded text-sm"
              defaultValue=""
            >
              <option value="">Bulk Status Update</option>
              <option value="confirmed">Confirm</option>
              <option value="pending">Set Pending</option>
              <option value="cancelled">Cancel</option>
            </select>
            <button
              onClick={handleBulkCancel}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Trash2 size={14} />
              Cancel Selected
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Cabin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredBookings.map((booking) => {
                  const paymentStatus =
                    booking.status === 'confirmed'
                      ? 'paid'
                      : booking.status === 'cancelled'
                      ? 'unpaid'
                      : 'pending';
                  return (
                    <tr
                      key={booking.booking_id}
                      className={`hover:bg-slate-700 ${
                        booking.booking_id === highlightBookingId
                          ? 'ring-2 ring-blue-400/60 border-blue-400'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.booking_id)}
                          onChange={() => handleSelectBooking(booking.booking_id)}
                          className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {booking.booking_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{booking.customer?.name}</div>
                          <div className="text-sm text-slate-400">{booking.customer?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {booking.cabin?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div>
                          <div>{booking.check_in_date}</div>
                          <div className="text-slate-500">to {booking.check_out_date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${booking.total_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPaymentBadge(booking.status)}`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-slate-600 rounded" title="View" onClick={() => handleView(booking)}>
                            <Eye size={16} />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded" title="Edit" onClick={() => handleEdit(booking)}>
                            <Edit size={16} />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded text-red-400" title="Cancel" onClick={() => handleCancel(booking.booking_id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* View Booking Modal */}
    {showView && selectedBooking && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Booking Details</h3>
            <button onClick={() => setShowView(false)} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <div><strong>Booking ID:</strong> {selectedBooking.booking_id}</div>
            <div><strong>Customer:</strong> {selectedBooking.customer?.name} ({selectedBooking.customer?.email})</div>
            <div><strong>Cabin:</strong> {selectedBooking.cabin?.name}</div>
            <div><strong>Dates:</strong> {selectedBooking.check_in_date} to {selectedBooking.check_out_date}</div>
            <div><strong>Guests:</strong> {selectedBooking.num_guests}</div>
            <div><strong>Total Price:</strong> ${selectedBooking.total_price}</div>
            <div><strong>Status:</strong> {selectedBooking.status}</div>
            <div><strong>Special Requests:</strong> {selectedBooking.special_requests || 'None'}</div>
          </div>
        </div>
      </div>
    )}

    {/* Edit Booking Modal */}
    {showEdit && selectedBooking && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Edit Booking</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Special Requests</label>
              <textarea
                value={editForm.special_requests}
                onChange={(e) => setEditForm({...editForm, special_requests: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Update</button>
              <button type="button" onClick={() => setShowEdit(false)} className="flex-1 bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* New Booking Modal */}
    {showNew && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Create New Booking</h3>
          <form onSubmit={handleNewBookingSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Customer Name</label>
              <input
                type="text"
                value={newBookingForm.customer_name}
                onChange={(e) => setNewBookingForm({...newBookingForm, customer_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Customer Email</label>
              <input
                type="email"
                value={newBookingForm.customer_email}
                onChange={(e) => setNewBookingForm({...newBookingForm, customer_email: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Customer Phone</label>
              <input
                type="tel"
                value={newBookingForm.customer_phone}
                onChange={(e) => setNewBookingForm({...newBookingForm, customer_phone: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Cabin</label>
              <select
                value={newBookingForm.cabin_id}
                onChange={(e) => setNewBookingForm({...newBookingForm, cabin_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                required
              >
                <option value="">Select Cabin</option>
                {cabins.map(cabin => (
                  <option key={cabin.id} value={cabin.id}>{cabin.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={newBookingForm.check_in_date}
                  onChange={(e) => setNewBookingForm({...newBookingForm, check_in_date: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={newBookingForm.check_out_date}
                  onChange={(e) => setNewBookingForm({...newBookingForm, check_out_date: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Number of Guests</label>
              <input
                type="number"
                min="1"
                value={newBookingForm.guests}
                onChange={(e) => setNewBookingForm({...newBookingForm, guests: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Special Requests</label>
              <textarea
                value={newBookingForm.special_requests}
                onChange={(e) => setNewBookingForm({...newBookingForm, special_requests: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Create Booking</button>
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
}
