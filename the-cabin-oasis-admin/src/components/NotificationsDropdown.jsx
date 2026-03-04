import { Bell, X, Calendar, Mail } from 'lucide-react';

export default function NotificationsDropdown({ isOpen, onClose, notifications, onNotificationClick }) {
  const getNotificationIcon = (title) => {
    if (title.includes('Booking')) return Calendar;
    if (title.includes('Message')) return Mail;
    return Bell;
  };

  const getNotificationColor = (title) => {
    if (title.includes('Booking')) return 'text-blue-400';
    if (title.includes('Message')) return 'text-green-400';
    return 'text-yellow-400';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-4 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-400" />
          <h3 className="text-white font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-80">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.title);
            const color = getNotificationColor(notification.title);
            return (
              <div
                key={notification.notification_id}
                onClick={() => onNotificationClick(notification)}
                className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-slate-700/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-slate-900 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white text-sm font-medium truncate">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-slate-500 text-xs">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Bell size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700 bg-slate-900/50">
        <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors py-2">
          Mark all as read
        </button>
      </div>
    </div>
  );
}
