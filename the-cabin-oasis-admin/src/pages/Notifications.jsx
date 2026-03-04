import { useState, useEffect } from 'react';
import { Bell, Check, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNotificationId, setActiveNotificationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(notif =>
        notif.notification_id === notificationId
          ? { ...notif, is_read: true }
          : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark this notification as the currently active/selected one for visual emphasis
    setActiveNotificationId(notification.notification_id);

    // Extract booking ID from message if it's a booking notification
    const bookingIdMatch = notification.message.match(/Booking ID: (\d+)/);
    if (bookingIdMatch) {
      const bookingId = bookingIdMatch[1];
      // Mark notification as read when clicked
      if (!notification.is_read) {
        markAsRead(notification.notification_id);
      }

      // Navigate to bookings page and highlight/open the related booking
      navigate('/admin/bookings', {
        state: { highlightBookingId: Number(bookingId) },
      });
    }
    // For other notifications, maybe do nothing or show details
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
          <p className="text-slate-400">Stay updated with system notifications and alerts</p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check size={16} />
              Mark All Read ({unreadCount})
            </button>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <Bell size={20} />
            <span>{unreadCount} unread</span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.notification_id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-slate-800 rounded-xl p-6 border transition-colors cursor-pointer ${
                notification.notification_id === activeNotificationId
                  ? 'border-blue-400 ring-2 ring-blue-400/60'
                  : notification.is_read
                  ? 'border-slate-700 opacity-75'
                  : 'border-blue-600 bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-slate-300 mb-3">{notification.message}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.notification_id)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      <Eye size={14} />
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
