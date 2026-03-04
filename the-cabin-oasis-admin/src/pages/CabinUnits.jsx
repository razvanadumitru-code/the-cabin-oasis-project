import { Search, Filter, Plus, Eye, Edit, Trash2, Bed, Users, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';

export default function CabinUnits() {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCabins, setSelectedCabins] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: 150, guests: 2, description: '', amenities: '', image: '', location: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [editingCabin, setEditingCabin] = useState(null);

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    try {
      const response = await api.get('/cabins/');
      setCabins(response.data);
    } catch (error) {
      console.error('Error fetching cabins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || formData.price <= 0 || formData.guests <= 0) {
      alert('Please enter valid data: name (required), location (required), price (>0), guests (>0)');
      return;
    }
    const data = {
      name: formData.name,
      capacity: formData.guests,
      price_per_night: formData.price,
      amenities: formData.amenities,
      description: formData.description,
      image_url: formData.image || '/images/default_cabin.png',
      status: 'available',
      location: formData.location,
    };
    console.log('Sending cabin data:', data);
    try {
      if (isEditing && editingCabin) {
        await api.put(`/cabins/${editingCabin.id}/`, data);
      } else {
        await api.post('/cabins/', data);
      }
      fetchCabins();
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingCabin(null);
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Failed to save cabin');
    }
  };

  const handleSelectCabin = (cabinId) => {
    setSelectedCabins(prev => 
      prev.includes(cabinId) 
        ? prev.filter(id => id !== cabinId)
        : [...prev, cabinId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCabins.length === cabinUnits.length) {
      setSelectedCabins([]);
    } else {
      setSelectedCabins(cabinUnits.map(cabin => cabin.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCabins.length} cabins?`)) return;
    
    try {
      await Promise.all(selectedCabins.map(id => api.delete(`/cabins/${id}/`)));
      fetchCabins();
      setSelectedCabins([]);
    } catch (error) {
      console.error('Error bulk deleting cabins:', error);
      alert('Failed to delete some cabins');
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      await Promise.all(selectedCabins.map(id => api.put(`/cabins/${id}/`, { status: newStatus })));
      fetchCabins();
      setSelectedCabins([]);
    } catch (error) {
      console.error('Error bulk updating cabins:', error);
      alert('Failed to update some cabins');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading cabins...</div>
      </div>
    );
  }

  // Filter cabins based on search term and status
  const filteredCabins = cabins.filter(cabin => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      cabin.name.toLowerCase().includes(searchLower) ||
      cabin.id.toString().toLowerCase().includes(searchLower);
    const matchesStatus = !selectedStatus || (selectedStatus === 'available' ? cabin.status === 'available' : cabin.status === 'unavailable');
    return matchesSearch && matchesStatus;
  });

  const cabinUnits = filteredCabins;

  return ( 
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Cabin Units</h2>
          <p className="text-slate-400">Manage your cabin inventory and availability</p>
        </div>
        <button onClick={() => { setIsModalOpen(true); setFormData({ name: '', price: 0, guests: 1, amenities: '', image: '', location: '' }); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Add Cabin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Cabins</h3>
            <Bed size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{cabinUnits.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Available</h3>
            <Users size={20} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {cabinUnits.filter(c => c.status === 'available').length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Occupied</h3>
            <Users size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {cabinUnits.filter(c => c.status === 'unavailable').length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Avg Price/Night</h3>
            <DollarSign size={20} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${cabinUnits.length > 0 ? Math.round(cabinUnits.reduce((sum, c) => sum + c.price_per_night, 0) / cabinUnits.length) : 0}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search cabins by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Filter size={20} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCabins.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {selectedCabins.length} {selectedCabins.length === 1 ? 'cabin' : 'cabins'} selected
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
              <option value="available">Set Available</option>
              <option value="maintenance">Set Maintenance</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Cabin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabinUnits.length > 0 ? (
          cabinUnits.map((cabin) => (
            <div key={cabin.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
              {/* Cabin Image */}
              <div className="h-48 bg-slate-700 relative">
                <img 
                  src={cabin.image_url} 
                  alt={cabin.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3e%3crect width="300" height="200" fill="%23475569"/%3e%3ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="Arial" font-size="18"%3eCabin%3c/text%3e%3c/svg%3e';
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(cabin.status === 'available' ? 'available' : 'occupied')}`}>
                    {cabin.status === 'available' ? 'available' : 'occupied'}
                  </span>
                </div>
              </div>

              {/* Cabin Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{cabin.name}</h3>
                    <p className="text-xs text-slate-500">ID: {cabin.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">${cabin.price_per_night}</p>
                    <p className="text-xs text-slate-400">per night</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {cabin.amenities.split(',').slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                        {amenity.trim()}
                      </span>
                    ))}
                    {cabin.amenities.split(',').length > 3 && (
                      <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                        +{cabin.amenities.split(',').length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-slate-300 line-clamp-2">{cabin.description || 'No description available.'}</p>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <Users size={16} />
                  <span>Up to {cabin.capacity} guests</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.location.href = `/admin/cabin/${cabin.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </button>
                  <button onClick={() => { setIsEditing(true); setEditingCabin(cabin); setFormData({ name: cabin.name, price: cabin.price_per_night, guests: cabin.capacity, amenities: cabin.amenities, description: cabin.description || '', image: cabin.image_url, location: cabin.location || '' }); setIsModalOpen(true); }} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs">Edit</button>
                  <button onClick={() => handleDelete(cabin.id)} className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs">Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No cabins found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Cabin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Cabin' : 'Add New Cabin'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Forest Area A or Lakeside Zone"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Price per Night</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Amenities (comma-separated)</label>
                <textarea
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="e.g. WiFi, Kitchen, Parking"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe the cabin features and highlights"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. /src/images/cabin.png"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {isEditing ? 'Update Cabin' : 'Add Cabin'}
                </button>
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); setEditingCabin(null); }} className="flex-1 bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-500 transition-colors">
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
