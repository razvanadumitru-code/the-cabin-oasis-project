import { Home, Users, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, cabinsRes] = await Promise.all([
          api.get('/bookings/admin/all'),
          api.get('/cabins/')
        ]);
        setBookings(bookingsRes.data);
        setCabins(cabinsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate real stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  const totalCabins = cabins.length;
  const availableCabins = cabins.filter(c => c.status === 'available').length;
  const occupiedCabins = cabins.filter(c => c.status === 'unavailable').length;
  const maintenanceCabins = cabins.filter(c => c.status !== 'available' && c.status !== 'unavailable').length;
  
  const occupancyRate = totalCabins > 0 ? Math.round((occupiedCabins / totalCabins) * 100) : 0;
  
  const paidBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.total_price, 0);

  const stats = [
    {
      title: 'Total Bookings',
      value: confirmedBookings.toString(),
      change: `${paidBookings.length} paid bookings`,
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-600'
    },
    {
      title: 'Available Cabins',
      value: `${availableCabins}/${totalCabins}`,
      change: `${occupancyRate}% occupied`,
      trend: occupancyRate > 50 ? 'up' : 'down',
      icon: Home,
      color: 'bg-green-600'
    },
    {
      title: 'Active Guests',
      value: occupiedCabins.toString(),
      change: `${pendingBookings} pending`,
      trend: 'up',
      icon: Users,
      color: 'bg-purple-600'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${paidBookings.length} paid`,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-orange-600'
    }
  ];

  const recentBookings = bookings.slice(0, 3).map(booking => ({
    id: booking.booking_id,
    guest: booking.customer.name,
    email: booking.customer.email,
    cabin: booking.cabin.name,
    checkIn: booking.check_in_date,
    checkOut: booking.check_out_date,
    guests: booking.num_guests,
    totalAmount: `$${booking.total_price}`,
    status: booking.status,
    paymentStatus: booking.status === 'confirmed' ? 'paid' : booking.status === 'pending' ? 'pending' : 'refunded',
    statusBadge: booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                 booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                 'bg-red-100 text-red-800'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-slate-400">Welcome back! Here's what's happening at Cabin Oasis today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendIcon size={16} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
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
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {booking.guest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {booking.cabin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${booking.statusBadge}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cabin Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Cabin Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Available</span>
              <span className="text-green-400 font-semibold">{availableCabins} cabins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Occupied</span>
              <span className="text-blue-400 font-semibold">{occupiedCabins} cabins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Maintenance</span>
              <span className="text-yellow-400 font-semibold">{maintenanceCabins} cabins</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Confirmed</span>
              <span className="text-green-400 font-semibold">{confirmedBookings} bookings</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Pending</span>
              <span className="text-yellow-400 font-semibold">{pendingBookings} bookings</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Cancelled</span>
              <span className="text-red-400 font-semibold">{cancelledBookings} bookings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
