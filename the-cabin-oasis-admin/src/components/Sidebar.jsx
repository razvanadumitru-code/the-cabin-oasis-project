import { 
  LayoutDashboard, 
  Calendar, 
  Home, 
  Settings,
  Menu,
  X,
  LogOut,
  Mail,
  Users,
  CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'bookings', icon: Calendar, label: 'Bookings' },
  { id: 'transactions', icon: CreditCard, label: 'Transactions' },
  { id: 'cabin-units', icon: Home, label: 'Cabin Units' },
  { id: 'customers', icon: Users, label: 'Customers' },
  { id: 'emails', icon: Mail, label: 'Emails' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('bookings')) return 'bookings';
    if (path.includes('transactions')) return 'transactions';
    if (path.includes('cabin-units')) return 'cabin-units';
    if (path.includes('emails')) return 'emails';
    if (path.includes('settings')) return 'settings';
    if (path.includes('customers')) return 'customers';
    return 'dashboard';
  };
  
  const currentPage = getCurrentPage();

  const handleLogout = () => {
    // Clear sessionStorage (not localStorage)
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userEmail');
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">Cabin Oasis</h1>
            <p className="text-sm text-slate-400">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        // Navigate to the correct route
                        const routes = {
                          'dashboard': '/admin/dashboard',
                          'bookings': '/admin/bookings',
                          'transactions': '/admin/transactions',
                          'cabin-units': '/admin/cabin-units',
                          'customers': '/admin/customers',
                          'emails': '/admin/emails',
                          'settings': '/admin/settings/security'  // Default to security tab
                        };
                        
                        navigate(routes[item.id] || '/admin/dashboard');
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${currentPage === item.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              © 2024 Cabin Oasis Admin
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
