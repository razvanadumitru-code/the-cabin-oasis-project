import { Save, Bell, Shield, Cookie, Users, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Settings() {
  const { tab } = useParams();
  const activeTab = tab || 'security';

  const { user } = useAuth();

  const defaultSettings = {
    // Notifications
    newBookings: true,
    bookingCancellations: true,
    paymentUpdates: false,
    systemMaintenance: true,
    emailNotifications: true,
    adminEmail: 'admin@cabin-oasis.com',
    notificationFrequency: 'realtime',
    // Cookies
    essentialCookies: true,
    analyticsCookies: false,
    functionalCookies: true,
    marketingCookies: false,
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30'
  };

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const data = response.data;
        setSettings({
          newBookings: data.new_bookings,
          bookingCancellations: data.booking_cancellations,
          paymentUpdates: data.payment_updates,
          systemMaintenance: data.system_maintenance,
          emailNotifications: data.email_notifications,
          // Show the logged-in admin account as the Admin Email when available
          adminEmail: user?.email || data.admin_email,
          notificationFrequency: data.notification_frequency,
          essentialCookies: data.essential_cookies,
          analyticsCookies: data.analytics_cookies,
          functionalCookies: data.functional_cookies,
          marketingCookies: data.marketing_cookies,
          twoFactorAuth: data.two_factor_auth,
          sessionTimeout: data.session_timeout
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Fallback to defaults/localStorage if API fails
        const saved = localStorage.getItem('adminSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      }
    };

    fetchSettings();
  }, []);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({ full_name: '', email: '', role: 'admin', password: '' });
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff/');
      setStaff(response.data.map(s => ({ id: s.staff_id, full_name: s.full_name, email: s.email, role: s.role })));
      console.log('Fetched staff:', response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const payload = {
        new_bookings: settings.newBookings,
        booking_cancellations: settings.bookingCancellations,
        payment_updates: settings.paymentUpdates,
        system_maintenance: settings.systemMaintenance,
        email_notifications: settings.emailNotifications,
        // Persist the logged-in admin email as the admin_email setting
        admin_email: user?.email || settings.adminEmail,
        notification_frequency: settings.notificationFrequency,
        essential_cookies: settings.essentialCookies,
        analytics_cookies: settings.analyticsCookies,
        functional_cookies: settings.functionalCookies,
        marketing_cookies: settings.marketingCookies,
        two_factor_auth: settings.twoFactorAuth,
        session_timeout: settings.sessionTimeout,
      };

      const response = await api.put('/settings', payload);
      // Mirror to localStorage as a cache
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!newStaff.full_name || !newStaff.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (isEditingStaff) {
      // Update staff
      const data = {
        full_name: newStaff.full_name,
        email: newStaff.email,
        phone: '',
        role: newStaff.role
      };
      try {
        await api.put(`/staff/${editingStaffId}`, data);
        fetchStaff();
        setShowAddStaff(false);
        setIsEditingStaff(false);
        setEditingStaffId(null);
        setNewStaff({ full_name: '', email: '', role: 'admin', password: '' });
      } catch (error) {
        console.error('Error updating staff:', error);
        alert('Error updating staff');
      }
    } else {
      // Add new staff
      if (!newStaff.password) {
        alert('Password is required for new staff');
        return;
      }
      const data = {
        full_name: newStaff.full_name,
        email: newStaff.email,
        phone: '',
        role: newStaff.role,
        password: newStaff.password
      };
      try {
        await api.post('/staff/register-staff', data);
        fetchStaff();
        setShowAddStaff(false);
        setNewStaff({ full_name: '', email: '', role: 'admin', password: '' });
      } catch (error) {
        console.error('Error adding staff:', error);
        alert('Error adding staff');
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error deleting staff');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Manage your admin panel settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <nav className="space-y-1">
              <Link to="/admin/settings/notifications" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <Bell size={20} />
                <span>Notifications</span>
              </Link>
              <Link to="/admin/settings/security" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <Shield size={20} />
                <span>Security</span>
              </Link>
              <Link to="/admin/settings/staff" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'staff' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <Users size={20} />
                <span>Staff Members</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'notifications' && (
            <>
              {/* Notification Settings */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Bell size={20} />
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">New Bookings</p>
                      <p className="text-sm text-slate-400">Get notified when new bookings are made</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.newBookings} onChange={(e) => setSettings({...settings, newBookings: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Booking Cancellations</p>
                      <p className="text-sm text-slate-400">Notify when bookings are cancelled</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.bookingCancellations} onChange={(e) => setSettings({...settings, bookingCancellations: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Payment Updates</p>
                      <p className="text-sm text-slate-400">Get updates on payment status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.paymentUpdates} onChange={(e) => setSettings({...settings, paymentUpdates: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">System Maintenance</p>
                      <p className="text-sm text-slate-400">Important system updates and maintenance notices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.systemMaintenance} onChange={(e) => setSettings({...settings, systemMaintenance: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-400">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.emailNotifications} onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Email Configuration</h3>
                {user && (
                  <p className="text-sm text-slate-400 mb-4">
                    You are currently logged in as <span className="font-medium text-slate-100">{user.email}</span>.
                  </p>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || settings.adminEmail}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notification Frequency
                    </label>
                    <select value={settings.notificationFrequency} onChange={(e) => setSettings({...settings, notificationFrequency: e.target.value})} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly Digest</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              {/* Security & Cookies Settings */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Cookie size={20} />
                  Cookie Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Essential Cookies</p>
                      <p className="text-sm text-slate-400">Required for basic website functionality</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.essentialCookies} disabled />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Analytics Cookies</p>
                      <p className="text-sm text-slate-400">Help us understand how you use our site</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.analyticsCookies} onChange={(e) => setSettings({...settings, analyticsCookies: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Functional Cookies</p>
                      <p className="text-sm text-slate-400">Remember your preferences and settings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.functionalCookies} onChange={(e) => setSettings({...settings, functionalCookies: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white font-medium">Marketing Cookies</p>
                      <p className="text-sm text-slate-400">Used for personalized advertising</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.marketingCookies} onChange={(e) => setSettings({...settings, marketingCookies: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Shield size={20} />
                  Security Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.twoFactorAuth} onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white font-medium">Session Timeout</p>
                      <p className="text-sm text-slate-400">Automatically log out after period of inactivity</p>
                    </div>
                    <select value={settings.sessionTimeout} onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})} className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'staff' && (
            <>
              {/* Staff Members */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Staff Members</h3>
                  <button onClick={() => setShowAddStaff(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={20} />
                    Add New Staff
                  </button>
                </div>
                {loading ? (
                  <div className="text-white">Loading staff...</div>
                ) : (
                  <div className="space-y-4">
                    {staff.map(member => (
                      <div key={member.id} className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                          <p className="text-white font-medium">{member.full_name}</p>
                          <p className="text-sm text-slate-400">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${member.role === 'admin' ? 'bg-red-100 text-red-800' : member.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {member.role}
                          </span>
                          <button onClick={() => { setIsEditingStaff(true); setEditingStaffId(member.id); setNewStaff({ ...member, password: '' }); setShowAddStaff(true); }} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs">Edit</button>
                          <button onClick={() => handleDeleteStaff(member.id)} className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{isEditingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
            <form onSubmit={handleStaffSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {!isEditingStaff && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {isEditingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
                <button type="button" onClick={() => { setShowAddStaff(false); setIsEditingStaff(false); setEditingStaffId(null); setNewStaff({ full_name: '', email: '', role: 'admin', password: '' }); }} className="flex-1 bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-500 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
