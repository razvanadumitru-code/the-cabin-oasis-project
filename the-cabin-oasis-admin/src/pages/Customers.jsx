import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Star, Calendar, Users } from 'lucide-react';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      const customersData = response.data.map(customer => ({
        ...customer,
        id: customer.customer_id,
        avatar: customer.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase(),
        totalStays: 0, // Will be updated when bookings are fetched
        lastStay: null,
        hasReview: false,
        reviewRating: null,
        totalSpent: 0,
        status: 'active'
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async (customerId) => {
    try {
      const response = await api.get(`/bookings/customer/${customerId}`);
      setCustomerBookings(response.data);
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      setCustomerBookings([]);
    }
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerBookings(customer.customer_id);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading customers...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading customers...</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Customers</h2>
          <p className="text-slate-400">Manage your customer relationships</p>
        </div>
        <div className="text-sm text-slate-400">
          {filteredCustomers.length} customers
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Cards */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleCustomerClick(customer)}
              className={`bg-slate-800 rounded-xl p-4 border cursor-pointer transition-colors ${
                selectedCustomer?.id === customer.id
                  ? 'border-blue-500 bg-slate-700'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {customer.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{customer.name}</h3>
                  <p className="text-sm text-slate-400">{customer.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-slate-500">
                      {customer.totalStays} stays
                    </span>
                    {customer.hasReview && (
                      <div className="flex items-center space-x-1">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span className="text-xs text-slate-400">{customer.reviewRating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar size={16} className="text-slate-400" />
                      <p className="text-sm text-slate-400">Total Stays</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{customerBookings.length}</p>
                  </div>

                  <div className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users size={16} className="text-slate-400" />
                      <p className="text-sm text-slate-400">Total Spent</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">${customerBookings.reduce((sum, b) => sum + b.total_price, 0)}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star size={16} className="text-slate-400" />
                    <p className="text-sm text-slate-400">Review Status</p>
                  </div>
                  {selectedCustomer.hasReview ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= selectedCustomer.reviewRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-300">
                        {selectedCustomer.reviewRating}/5 stars
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500">No review left</p>
                  )}
                </div>

                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Last Stay</p>
                  <p className="text-white">{(() => {
                    const past = customerBookings.filter(b => new Date(b.check_out_date) < new Date()).sort((a, b) => new Date(b.check_out_date) - new Date(a.check_out_date));
                    return past.length > 0 ? new Date(past[0].check_out_date).toLocaleDateString() : 'N/A';
                  })()}</p>
                </div>

                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Reservations</p>
                  {customerBookings.length > 0 ? (
                    <div className="space-y-4">
                      {/* Upcoming Reservations */}
                      {(() => {
                        const now = new Date();
                        const upcoming = customerBookings.filter(b => new Date(b.check_in_date) >= now).sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));
                        const past = customerBookings.filter(b => new Date(b.check_out_date) < now).sort((a, b) => new Date(b.check_out_date) - new Date(a.check_out_date));
                        
                        return (
                          <>
                            {upcoming.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Upcoming Reservations</h4>
                                <div className="space-y-2">
                                  {upcoming.map(booking => (
                                    <div key={booking.booking_id} className="text-sm text-white bg-blue-600/20 p-2 rounded">
                                      <div className="font-medium">{booking.cabin?.name || 'Unknown Cabin'}</div>
                                      <div>{booking.check_in_date} to {booking.check_out_date}</div>
                                      <div className="text-slate-300">Status: {booking.status} | Total: ${booking.total_price}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {past.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Past Reservations</h4>
                                <div className="space-y-2">
                                  {past.map(booking => (
                                    <div key={booking.booking_id} className="text-sm text-white bg-gray-600/20 p-2 rounded">
                                      <div className="font-medium">{booking.cabin?.name || 'Unknown Cabin'}</div>
                                      <div>{booking.check_in_date} to {booking.check_out_date}</div>
                                      <div className="text-slate-300">Status: {booking.status} | Total: ${booking.total_price}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-slate-500">No reservations</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
              <Users size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
