import { User, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import NotificationsDropdown from './NotificationsDropdown';
import api from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Update current page when URL changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('bookings')) setCurrentPage('bookings');
    else if (path.includes('cabin-units')) setCurrentPage('cabin-units');
    else if (path.includes('emails')) setCurrentPage('emails');
    else if (path.includes('settings')) setCurrentPage('settings');
    else if (path.includes('customers')) setCurrentPage('customers');
    else setCurrentPage('dashboard');
  }, [location]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    try {
      await api.put(`/notifications/${notification.notification_id}/read`);
      // Update local state
      setNotifications(notifications.map(n => 
        n.notification_id === notification.notification_id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Navigate based on title
    if (notification.title.includes('Booking')) {
      navigate('/admin/bookings');
    } else if (notification.title.includes('Message')) {
      navigate('/admin/emails');
    }

    setIsNotificationsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Get page title based on current page
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'bookings':
        return 'Bookings';
      case 'cabin-units':
        return 'Cabin Units';
      case 'emails':
        return 'Emails';
      case 'settings':
        return 'Settings';
      case 'customers':
        return 'Customers';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white">{getPageTitle()}</h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              <NotificationsDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
              />
            </div>

            {/* Admin Profile */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 hover:bg-slate-700 rounded-lg p-2 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.full_name || 'Admin User'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'admin@cabin-oasis.com'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
    </>
  );
}
