import { X, User, Mail, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function ProfileModal({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'admin',
    password: ''
  });
  const [originalRole, setOriginalRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'admin',
        password: ''
      });
      setOriginalRole(user.role || 'admin');
      setShowPassword(false);
    }
  }, [user]);

  const handleRoleChange = (newRole) => {
    setFormData({ ...formData, role: newRole });
    setShowPassword(newRole !== originalRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (!showPassword) {
      delete dataToSend.password;
    }
    try {
      await api.put('/staff/me', dataToSend);
      alert('Profile updated successfully');
      onClose();
      // Optionally refresh user data
      window.location.reload(); // Simple way to refresh
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">{user?.full_name || 'Admin User'}</h3>
            <p className="text-sm text-slate-400">{user?.email || 'admin@cabin-oasis.com'}</p>
            <button className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Change Avatar
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrator</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Password for role change */}
            {showPassword && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password (required for role change)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <Bell className="inline mr-2" size={18} />
                Notification Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Push notifications</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" className="rounded" />
                  <span>SMS notifications</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
