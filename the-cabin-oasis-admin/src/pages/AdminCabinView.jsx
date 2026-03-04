import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Bed,
  Wifi,
  Car,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Settings
} from 'lucide-react';

export default function AdminCabinView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for public visibility toggle (synced with backend cabin.status)
  const [isPublicVisible, setIsPublicVisible] = useState(true);

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    pricePerNight: 150,
    capacity: 2,
    description: 'Comfortable standard cabin perfect for couples',
    amenities: ['WiFi', 'Kitchen', 'Parking'],
    location: ''
  });

  // State for calendar
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [highlightedBookings, setHighlightedBookings] = useState([]);

  // State for maintenance scheduling
  const [isSchedulingMaintenance, setIsSchedulingMaintenance] = useState(false);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);

  // State for editing maintenance
  const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);
  const [editingDates, setEditingDates] = useState([]);

  // State for quick actions visibility
  const [showQuickActions, setShowQuickActions] = useState(false);

  // State for maintenance logs from backend
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  // State for bookings from backend
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // State for cabin data from backend
  const [cabin, setCabin] = useState(null);
  const [loadingCabin, setLoadingCabin] = useState(false);

  // State for modals and forms
  const [showBookingManager, setShowBookingManager] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [newMaintenanceEntry, setNewMaintenanceEntry] = useState({
    category: 'Cleaning',
    date: '',
    notes: ''
  });

  // State for editing maintenance logs
  const [showEditMaintenanceForm, setShowEditMaintenanceForm] = useState(false);
  const [editingMaintenanceLog, setEditingMaintenanceLog] = useState(null);

  // Edit functions
  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize edit form with current cabin data
      setEditForm({
        pricePerNight: cabin.price_per_night,
        capacity: cabin.capacity,
        description: cabin.description,
        amenities: cabin.amenities.split(',').map(a => a.trim()),
        location: cabin.location || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleTogglePublicVisibility = async () => {
    if (!cabin) return;

    const newVisible = !isPublicVisible;
    setIsPublicVisible(newVisible);

    // When hidden, mark cabin as under maintenance (not shown on public site).
    // When visible, set back to available.
    const newStatus = newVisible ? 'available' : 'maintenance';

    try {
      const response = await api.put(`/cabins/${cabin.id}/`, { status: newStatus });
      setCabin(response.data);
    } catch (error) {
      console.error('Error updating cabin public visibility:', error);
      alert('Failed to update cabin visibility');
      // Revert toggle on error
      setIsPublicVisible(!newVisible);
    }
  };

  const handleSaveEdit = async () => {
    const data = {
      name: cabin.name, // Keep existing name
      capacity: editForm.capacity,
      price_per_night: editForm.pricePerNight,
      amenities: editForm.amenities.join(','), // Convert array to comma-separated string
      description: editForm.description,
      image_url: cabin.image_url, // Keep existing image
      status: cabin.status, // Keep existing status
      location: editForm.location,
    };

    try {
      const response = await api.put(`/cabins/${cabin.id}/`, data);
      setCabin(response.data); // Update with response from backend
      setIsEditing(false);
      console.log('Cabin updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating cabin:', error);
      alert('Failed to update cabin');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Amenity management functions
  const addAmenity = (amenity) => {
    if (amenity.trim() && !editForm.amenities.includes(amenity.trim())) {
      setEditForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity.trim()]
      }));
    }
  };

  const removeAmenity = (amenityToRemove) => {
    setEditForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  // Mock cabin data - in real app, this would come from API
  const cabinData = {
    id: id,
    name: 'Standard Cabin',
    type: 'Standard',
    status: 'available',
    pricePerNight: 150,
    capacity: 2,
    description: 'Comfortable standard cabin perfect for couples',
    amenities: ['WiFi', 'Kitchen', 'Parking'],
    image: '/src/images/standard_cabin.png',
    location: 'Forest Area A',
    totalBookings: 24,
    totalRevenue: 3600,
    occupancyRate: 78,
    averageRating: 4.6,
    createdAt: '2024-01-15',
    lastUpdated: '2024-02-10',
    bookings: [
      {
        id: 'BK001',
        guestName: 'John Smith',
        checkIn: '2024-02-15',
        checkOut: '2024-02-17',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed',
        paymentStatus: 'paid',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567'
      },
      {
        id: 'BK002',
        guestName: 'Sarah Johnson',
        checkIn: '2024-02-20',
        checkOut: '2024-02-22',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed',
        paymentStatus: 'paid',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 234-5678'
      },
      {
        id: 'BK003',
        guestName: 'Mike Wilson',
        checkIn: '2024-02-25',
        checkOut: '2024-02-27',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed',
        paymentStatus: 'pending',
        email: 'mike.wilson@email.com',
        phone: '+1 (555) 345-6789'
      },
      {
        id: 'BK004',
        guestName: 'Emma Davis',
        checkIn: '2024-01-15',
        checkOut: '2024-01-17',
        guests: 2,
        totalAmount: 300,
        status: 'completed',
        paymentStatus: 'paid',
        email: 'emma.davis@email.com',
        phone: '+1 (555) 456-7890'
      },
      {
        id: 'BK005',
        guestName: 'David Brown',
        checkIn: '2024-01-10',
        checkOut: '2024-01-12',
        guests: 2,
        totalAmount: 300,
        status: 'completed',
        paymentStatus: 'paid',
        email: 'david.brown@email.com',
        phone: '+1 (555) 567-8901'
      },
      {
        id: 'BK006',
        guestName: 'Lisa Garcia',
        checkIn: '2024-01-05',
        checkOut: '2024-01-07',
        guests: 2,
        totalAmount: 300,
        status: 'completed',
        paymentStatus: 'refunded',
        email: 'lisa.garcia@email.com',
        phone: '+1 (555) 678-9012'
      },
      {
        id: 'BK007',
        guestName: 'Robert Taylor',
        checkIn: '2024-03-01',
        checkOut: '2024-03-03',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed',
        paymentStatus: 'deposit',
        email: 'robert.taylor@email.com',
        phone: '+1 (555) 789-0123'
      }
    ],
    maintenanceHistory: [
      { date: '2024-01-20', type: 'Cleaning', status: 'completed' },
      { date: '2024-01-15', type: 'Inspection', status: 'completed' },
      { date: '2024-01-10', type: 'Repair', status: 'completed' }
    ],
    upcomingBookings: [
      {
        id: 'BK001',
        guestName: 'John Smith',
        checkIn: '2024-02-15',
        checkOut: '2024-02-17',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed'
      },
      {
        id: 'BK002',
        guestName: 'Sarah Johnson',
        checkIn: '2024-02-20',
        checkOut: '2024-02-22',
        guests: 2,
        totalAmount: 300,
        status: 'confirmed'
      }
    ],
    recentBookings: [
      {
        id: 'BK003',
        guestName: 'Mike Wilson',
        checkIn: '2024-02-01',
        checkOut: '2024-02-03',
        guests: 2,
        totalAmount: 300,
        status: 'completed',
        rating: 5
      },
      {
        id: 'BK004',
        guestName: 'Emma Davis',
        checkIn: '2024-01-28',
        checkOut: '2024-01-30',
        guests: 2,
        totalAmount: 300,
        status: 'completed',
        rating: 4
      }
    ]
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <Users className="w-4 h-4" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];

    return bookings?.filter(booking => {
      const checkIn = new Date(booking.check_in_date);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(booking.check_out_date);
      checkOut.setHours(0, 0, 0, 0);
      const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return booking.status === 'confirmed' && dateMidnight >= checkIn && dateMidnight <= checkOut;
    }) || [];
  };

  const getMaintenanceForDate = (date) => {
    if (!date) return [];

    return maintenanceLogs?.filter(log => {
      const logDate = new Date(log.log_date);
      return logDate.toDateString() === date.toDateString();
    }) || [];
  };

  const handleDateClick = (date) => {
    if (date) {
      const bookings = getBookingsForDate(date);
      if (bookings.length > 0) {
        setSelectedBooking(bookings[0]); // For now, show first booking if multiple
      }
    }
  };

  const handleGuestClick = (booking) => {
    // If this booking is already highlighted, deselect
    const isAlreadyHighlighted =
      highlightedBookings.length === 1 &&
      highlightedBookings[0].booking_id === booking.booking_id;

    if (isAlreadyHighlighted) {
      setHighlightedBookings([]);
      return;
    }

    // Highlight only this specific booking's date range on the calendar
    setHighlightedBookings([booking]);

    // Navigate calendar to this booking's check-in month
    const checkInDate = new Date(booking.check_in_date);
    setSelectedDate(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1));

    // Scroll to calendar section
    const calendarElement = document.querySelector('.calendar-container');
    if (calendarElement) {
      calendarElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // Maintenance scheduling functions
  const handleScheduleMaintenance = () => {
    setIsSchedulingMaintenance(true);
    // Scroll to calendar
    const calendarElement = document.querySelector('.calendar-container');
    if (calendarElement) {
      calendarElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const handleMaintenanceDateSelect = (date) => {
    if (!date) return;

    // Create date string using local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Handle editing mode
    if (editingMaintenanceId) {
      setEditingDates(prev => {
        const isSelected = prev.includes(dateString);
        if (isSelected) {
          // Remove date if already selected
          return prev.filter(d => d !== dateString);
        } else {
          // Add date if not selected
          return [...prev, dateString];
        }
      });
    } else {
      // Handle new maintenance scheduling
      setMaintenanceDates(prev => {
        const isSelected = prev.includes(dateString);
        if (isSelected) {
          // Remove date if already selected
          return prev.filter(d => d !== dateString);
        } else {
          // Add date if not selected
          return [...prev, dateString];
        }
      });
    }
  };

  const saveMaintenanceSchedule = () => {
    // Add the scheduled maintenance dates
    const newMaintenance = {
      id: `MAINT-${Date.now()}`,
      dates: [...maintenanceDates],
      scheduledAt: new Date().toISOString(),
      status: 'scheduled'
    };

    setScheduledMaintenance(prev => [...prev, newMaintenance]);
    setIsSchedulingMaintenance(false);
    setMaintenanceDates([]);
  };

  const cancelMaintenanceSchedule = () => {
    setIsSchedulingMaintenance(false);
    setMaintenanceDates([]);
  };

  // Check if date is scheduled for maintenance
  const isMaintenanceDate = (date) => {
    if (!date) return false;

    // Create date string using local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Check currently selected dates (during scheduling)
    if (maintenanceDates.includes(dateString)) {
      return true;
    }

    // Check scheduled maintenance dates
    if (scheduledMaintenance.some(maintenance =>
      maintenance.dates.includes(dateString)
    )) {
      return true;
    }

    // Check pending maintenance history entries
    return scheduledMaintenance.some(maintenance =>
      maintenance.dates.includes(dateString)
    );
  };

  // Quick actions functions
  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  const handleMarkAvailable = () => {
    console.log('Marking cabin as available');
    // In real app, this would update cabin status
    setShowQuickActions(false);
  };

  const handleExportData = () => {
    console.log('Exporting cabin data');
    // In real app, this would trigger data export
    setShowQuickActions(false);
  };

  // Maintenance editing functions
  const startEditingMaintenance = (maintenance) => {
    setEditingMaintenanceId(maintenance.id);
    setEditingDates([...maintenance.dates]);
    setIsSchedulingMaintenance(true);
    // Scroll to calendar
    const calendarElement = document.querySelector('.calendar-container');
    if (calendarElement) {
      calendarElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const saveMaintenanceEdits = () => {
    if (editingMaintenanceId) {
      setScheduledMaintenance(prev => 
        prev.map(m => 
          m.id === editingMaintenanceId 
            ? { ...m, dates: [...editingDates] }
            : m
        )
      );
      setEditingMaintenanceId(null);
      setEditingDates([]);
      setIsSchedulingMaintenance(false);
    }
  };

  const cancelMaintenanceEdit = () => {
    setEditingMaintenanceId(null);
    setEditingDates([]);
    setIsSchedulingMaintenance(false);
  };

  const markMaintenanceCompleted = (maintenanceId) => {
    const maintenance = scheduledMaintenance.find(m => m.id === maintenanceId);
    if (maintenance) {
      // Create completed maintenance entry
      const completedEntry = {
        type: 'Scheduled Maintenance',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        details: `Completed scheduled maintenance with ${maintenance.dates.length} date(s)`,
        dates: maintenance.dates
      };

      // Update cabin maintenance history
      setCabin(prevCabin => ({
        ...prevCabin,
        maintenanceHistory: [...prevCabin.maintenanceHistory, completedEntry]
      }));

      // Remove from scheduled maintenance
      setScheduledMaintenance(prev => prev.filter(m => m.id !== maintenanceId));
    }
  };

  const deleteScheduledMaintenance = (maintenanceId) => {
    setScheduledMaintenance(prev => prev.filter(m => m.id !== maintenanceId));
  };

  // Fetch maintenance logs on component mount
  useEffect(() => {
    const fetchMaintenanceLogs = async () => {
      try {
        setLoadingMaintenance(true);
        const response = await api.get(`/maintenance/${id}`);
        setMaintenanceLogs(response.data);
      } catch (error) {
        console.error('Error fetching maintenance logs:', error);
        // Fallback to empty array if API fails
        setMaintenanceLogs([]);
      } finally {
        setLoadingMaintenance(false);
      }
    };

    if (id) {
      fetchMaintenanceLogs();
    }
  }, [id]);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const response = await api.get(`/bookings/cabin/${id}`);
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to empty array if API fails
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (id) {
      fetchBookings();
    }
  }, [id]);

  // Fetch cabin data on component mount
  useEffect(() => {
    const fetchCabin = async () => {
      try {
        setLoadingCabin(true);
        const response = await api.get(`/cabins/${id}`);
        setCabin(response.data);
      } catch (error) {
        console.error('Error fetching cabin:', error);
        // Fallback to mock data if API fails
        setCabin({
          id: parseInt(id),
          name: 'Deluxe Cabin',
          description: 'A luxurious cabin with modern amenities and stunning mountain views.',
          price: 299,
          capacity: 4,
          amenities: 'WiFi, Kitchen, Fireplace, Hot Tub, Mountain View',
          image: '/images/deluxe-cabin.jpg',
          status: 'available'
        });
      } finally {
        setLoadingCabin(false);
      }
    };

    if (id) {
      fetchCabin();
    }
  }, [id]);

  // Sync public visibility toggle with loaded cabin status
  useEffect(() => {
    if (cabin) {
      setIsPublicVisible(cabin.status === 'available');
    }
  }, [cabin]);

  // Computed upcoming bookings from fetched bookings
  const upcomingBookings = bookings.filter(booking => {
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return booking.status === 'confirmed' && checkInDate >= today;
  }).sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));

  // Booking management functions
  const openBookingManager = () => {
    setShowBookingManager(true);
  };

  const closeBookingManager = () => {
    setShowBookingManager(false);
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    // In a real app, this would update the booking status via API
    console.log(`Updating booking ${bookingId} status to ${newStatus}`);
  };

  const updatePaymentStatus = (bookingId, newStatus) => {
    // In a real app, this would update the payment status via API
    console.log(`Updating booking ${bookingId} payment status to ${newStatus}`);
  };

  const cancelBooking = (bookingId) => {
    // In a real app, this would cancel the booking via API
    console.log(`Cancelling booking ${bookingId}`);
  };

  // Maintenance entry functions
  const openAddMaintenanceForm = () => {
    setShowAddMaintenanceForm(true);
  };

  const closeAddMaintenanceForm = () => {
    setShowAddMaintenanceForm(false);
    setNewMaintenanceEntry({
      category: 'Cleaning',
      date: '',
      notes: ''
    });
  };

  const handleMaintenanceEntrySubmit = async (e) => {
    e.preventDefault();
    
    if (!newMaintenanceEntry.date) {
      alert('Please select a date for the maintenance');
      return;
    }

    try {
      const maintenanceData = {
        cabin_id: parseInt(id),
        log_type: newMaintenanceEntry.category.toLowerCase(),
        description: newMaintenanceEntry.notes || 'Scheduled maintenance task',
        log_date: new Date(newMaintenanceEntry.date).toISOString()
      };

      const response = await api.post('/maintenance/', maintenanceData);
      
      // Add to local state
      setMaintenanceLogs(prev => [response.data, ...prev]);
      
      closeAddMaintenanceForm();
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      alert('Failed to create maintenance entry');
    }
  };

  const handleMaintenanceEntryChange = (field, value) => {
    setNewMaintenanceEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Maintenance edit functions
  const openEditMaintenanceForm = (log) => {
    setEditingMaintenanceLog({
      log_id: log.log_id,
      log_type: log.log_type,
      description: log.description,
      log_date: new Date(log.log_date).toISOString().split('T')[0] // Format for date input
    });
    setShowEditMaintenanceForm(true);
  };

  const closeEditMaintenanceForm = () => {
    setShowEditMaintenanceForm(false);
    setEditingMaintenanceLog(null);
  };

  const handleEditMaintenanceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/maintenance/${editingMaintenanceLog.log_id}`, {
        log_type: editingMaintenanceLog.log_type,
        description: editingMaintenanceLog.description,
        log_date: new Date(editingMaintenanceLog.log_date).toISOString()
      });
      
      // Update local state
      setMaintenanceLogs(prev => prev.map(log => 
        log.log_id === editingMaintenanceLog.log_id ? response.data : log
      ));
      
      closeEditMaintenanceForm();
    } catch (error) {
      console.error('Error updating maintenance log:', error);
      alert('Failed to update maintenance entry');
    }
  };

  const handleEditMaintenanceChange = (field, value) => {
    setEditingMaintenanceLog(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Maintenance status management functions
  const toggleMaintenanceStatus = (index) => {
    setCabin(prevCabin => ({
      ...prevCabin,
      maintenanceHistory: prevCabin.maintenanceHistory.map((item, i) => 
        i === index 
          ? { ...item, status: item.status === 'pending' ? 'completed' : 'pending' }
          : item
      )
    }));
  };

  const deleteMaintenanceEntry = async (logId) => {
    try {
      await api.delete(`/maintenance/${logId}`);
      setMaintenanceLogs(prev => prev.filter(log => log.log_id !== logId));
    } catch (error) {
      console.error('Error deleting maintenance log:', error);
      alert('Failed to delete maintenance entry');
    }
  };

  if (loadingCabin || !cabin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading cabin details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Live Status Header */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-slate-400">Cabin ID:</div>
                <div className="bg-slate-700 px-3 py-1 rounded-lg text-sm font-mono font-semibold">
                  {cabin.id}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-slate-400">Status:</div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cabin.status)}`}>
                  {getStatusIcon(cabin.status)}
                  <span className="capitalize">{cabin.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-slate-400">Public Visibility:</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-300">
                    {isPublicVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <button
                    onClick={handleTogglePublicVisibility}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPublicVisible ? 'bg-green-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublicVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/cabin-units')}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cabins</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cabin Image */}
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <div className="relative">
                <img
                  src={cabin.image_url}
                  alt={cabin.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cabin.status)}`}>
                    {getStatusIcon(cabin.status)}
                    <span className="capitalize">{cabin.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cabin Details */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">{cabin.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Price/Night</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.pricePerNight}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white w-20"
                        min="0"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{formatCurrency(cabin.price_per_night)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">Capacity</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.capacity}
                        onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white w-16"
                        min="1"
                        max="20"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{cabin.capacity} guests</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white w-40"
                        placeholder="Enter location"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{cabin.location || 'Not set'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-slate-400">Rating</p>
                    <p className="text-lg font-semibold">{cabin.averageRating}/5.0</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white resize-none"
                      rows={3}
                      placeholder="Enter cabin description..."
                    />
                  ) : (
                    <p className="text-slate-300">{cabin.description}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      {/* Current Amenities with Remove Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {editForm.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-full">
                            <span className="text-white text-sm">{amenity}</span>
                            <button
                              onClick={() => removeAmenity(amenity)}
                              className="text-red-400 hover:text-red-300 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Amenity */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add new amenity..."
                          className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white placeholder-slate-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addAmenity(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            addAmenity(input.value);
                            input.value = '';
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cabin.amenities.split(',').map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-700 rounded-full text-sm">
                          {amenity.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Actions - Show when in edit mode */}
            {isEditing && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400">⚠️ Edit Mode Active</h3>
                    <p className="text-sm text-slate-400">Make your changes and save when done</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Operational Calendar */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Operational Calendar</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-400">
                    Click dates to view booking details
                  </div>
                </div>
              </div>

              <div className="calendar-container">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(selectedDate).map((date, index) => {
                    const bookingsForDate = getBookingsForDate(date);
                    const maintenanceForDate = getMaintenanceForDate(date);
                    const hasBookings = bookingsForDate.length > 0;
                    const hasMaintenance = maintenanceForDate.length > 0;
                    const isMaintenance = isMaintenanceDate(date);

                    // Determine booking coloring for this date relative to today
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const hasCurrentBooking = bookingsForDate.some(b => {
                      const checkIn = new Date(b.check_in_date);
                      checkIn.setHours(0, 0, 0, 0);
                      const checkOut = new Date(b.check_out_date);
                      checkOut.setHours(0, 0, 0, 0);
                      return checkIn <= today && today <= checkOut;
                    });
                    const hasPastBookingOnly =
                      hasBookings &&
                      !hasCurrentBooking &&
                      bookingsForDate.every(b => {
                        const checkOut = new Date(b.check_out_date);
                        checkOut.setHours(0, 0, 0, 0);
                        return checkOut < today;
                      });
                    const hasFutureBooking = hasBookings && !hasCurrentBooking && !hasPastBookingOnly;

                    // Base background/border by booking type
                    let baseBgClass = 'bg-slate-800 border-slate-700';
                    if (hasBookings) {
                      if (hasCurrentBooking) {
                        baseBgClass = 'bg-blue-900/50 border-blue-600'; // current booking
                      } else if (hasPastBookingOnly) {
                        baseBgClass = 'bg-green-900/40 border-green-600'; // past bookings
                      } else if (hasFutureBooking) {
                        baseBgClass = 'bg-purple-900/40 border-purple-600'; // future bookings
                      }
                    }

                    // Check if this date is part of any highlighted booking
                    const isHighlighted = highlightedBookings.length > 0 && date && highlightedBookings.some(booking => {
                      const checkIn = new Date(booking.check_in_date);
                      checkIn.setHours(0, 0, 0, 0);
                      const checkOut = new Date(booking.check_out_date);
                      checkOut.setHours(0, 0, 0, 0);
                      const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      
                      return dateMidnight >= checkIn && dateMidnight <= checkOut;
                    });

                    // Maintenance overrides booking color for availability
                    if (isMaintenance) {
                      baseBgClass = 'bg-red-900/50 border-red-600';
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (isSchedulingMaintenance) {
                            handleMaintenanceDateSelect(date);
                          } else {
                            handleDateClick(date);
                          }
                        }}
                        className={`min-h-[80px] rounded p-2 cursor-pointer transition-colors ${
                          date ? 'hover:bg-slate-700' : ''
                        } ${baseBgClass} ${
                          isHighlighted ? 'bg-purple-900/70 border-purple-500 ring-2 ring-purple-400' : ''
                        } ${isMaintenance ? 'cursor-not-allowed opacity-60' : ''} ${
                          isSchedulingMaintenance ? 'hover:bg-orange-600/30' : ''
                        }`}
                      >
                        {date && (
                          <>
                            <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                            {hasBookings && (
                              <div className="space-y-1">
                                {bookingsForDate.slice(0, 2).map((booking, bookingIndex) => (
                                  <div key={bookingIndex} className="text-xs bg-blue-600 text-white rounded px-1 py-0.5 truncate">
                                    {booking.customer?.name || 'Unknown Guest'}
                                  </div>
                                ))}
                                {bookingsForDate.length > 2 && (
                                  <div className="text-xs text-slate-400">
                                    +{bookingsForDate.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                            {hasMaintenance && (
                              <div className="space-y-1 mt-1">
                                {maintenanceForDate.slice(0, 2).map((log, logIndex) => (
                                  <div key={logIndex} className="text-xs bg-green-600 text-white rounded px-1 py-0.5 truncate">
                                    {log.log_type.charAt(0).toUpperCase() + log.log_type.slice(1)}
                                  </div>
                                ))}
                                {maintenanceForDate.length > 2 && (
                                  <div className="text-xs text-slate-400">
                                    +{maintenanceForDate.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                            {isHighlighted && (
                              <div className="mt-1 text-xs bg-purple-600 text-white rounded px-1 py-0.5 text-center">
                                Selected
                              </div>
                            )}
                            {isMaintenance && (
                              <div className="mt-1 text-xs bg-red-600 text-white rounded px-1 py-0.5 text-center">
                                Unavailable
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maintenance Scheduling Interface */}
              {isSchedulingMaintenance && (
                <div className="mt-6 p-4 bg-orange-900/20 border border-orange-600 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <div>
                        <h4 className="font-semibold text-orange-400">
                          {editingMaintenanceId ? 'Edit Maintenance Schedule' : 'Schedule Maintenance'}
                        </h4>
                        <p className="text-sm text-slate-300">
                          {editingMaintenanceId ? 'Click dates to modify the maintenance schedule' : 'Click dates on the calendar to select maintenance periods'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">
                        {(editingMaintenanceId ? editingDates.length : maintenanceDates.length)} date{(editingMaintenanceId ? editingDates.length : maintenanceDates.length) !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>

                  {(editingMaintenanceId ? editingDates.length : maintenanceDates.length) > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-slate-300 mb-2">
                        {editingMaintenanceId ? 'Updated Maintenance Dates:' : 'Selected Maintenance Dates:'}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {(editingMaintenanceId ? editingDates : maintenanceDates).sort().map((dateString, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-orange-600 text-white px-3 py-1 rounded text-sm">
                            <span>{new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <button
                              onClick={() => handleMaintenanceDateSelect(new Date(dateString))}
                              className="text-orange-200 hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={editingMaintenanceId ? cancelMaintenanceEdit : cancelMaintenanceSchedule}
                      className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingMaintenanceId ? saveMaintenanceEdits : saveMaintenanceSchedule}
                      disabled={(editingMaintenanceId ? editingDates.length : maintenanceDates.length) === 0}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {editingMaintenanceId ? 'Save Changes' : 'Schedule Maintenance'}
                    </button>
                  </div>
                </div>
              )}
              {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                      <h3 className="text-lg font-bold">Booking Details</h3>
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedBooking.guestName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{selectedBooking.guestName}</h4>
                          <p className="text-sm text-slate-400">Booking #{selectedBooking.id}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Check-in:</span>
                          <span>{formatDate(selectedBooking.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Check-out:</span>
                          <span>{formatDate(selectedBooking.checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Guests:</span>
                          <span>{selectedBooking.guests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total:</span>
                          <span className="text-green-400 font-semibold">{formatCurrency(selectedBooking.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            selectedBooking.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {selectedBooking.status}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Email:</span>
                            <span>{selectedBooking.email}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Phone:</span>
                            <span>{selectedBooking.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button 
                          onClick={() => navigate(`/admin/bookings/${selectedBooking.id}/edit`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Edit Booking
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/guests/${selectedBooking.email}`)}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          View Guest
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking History Table */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Booking History</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-400">
                    {bookings.length} total bookings
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Guest Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Date Range</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Total Paid</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Payment Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Booking Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date)).map((booking, index) => {
                      const checkInDate = new Date(booking.check_in_date);
                      const checkOutDate = new Date(booking.check_out_date);
                      const isPast = checkOutDate < new Date();
                      const isCurrent = checkInDate <= new Date() && checkOutDate >= new Date();

                      const getPaymentStatusColor = (status) => {
                        switch (status) {
                          case 'paid':
                            return 'bg-green-100 text-green-800 border-green-200';
                          case 'pending':
                            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                          case 'refunded':
                            return 'bg-red-100 text-red-800 border-red-200';
                          case 'deposit':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          default:
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                        }
                      };

                      const getBookingStatusColor = (status) => {
                        switch (status) {
                          case 'confirmed':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          case 'completed':
                            return 'bg-green-100 text-green-800 border-green-200';
                          case 'cancelled':
                            return 'bg-red-100 text-red-800 border-red-200';
                          default:
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                        }
                      };

                      return (
                        <tr key={booking.booking_id} className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                          isCurrent ? 'bg-blue-900/20 border-blue-600' : ''
                        } ${isPast ? 'opacity-75' : ''}`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-110 transition-transform ${
                                isCurrent ? 'bg-blue-600' : isPast ? 'bg-green-600' : 'bg-slate-600'
                              }`} onClick={() => handleGuestClick(booking)}>
                                {(booking.customer?.name || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <p 
                                  className="font-medium text-white cursor-pointer hover:text-blue-400 transition-colors" 
                                  onClick={() => handleGuestClick(booking)}
                                >
                                  {booking.customer?.name || 'Unknown Guest'}
                                </p>
                                <p className="text-sm text-slate-400">{booking.booking_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-white">
                                {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-slate-400">
                                {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} nights
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-white font-semibold">{formatCurrency(booking.total_price)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.status === 'confirmed' ? 'paid' : 'pending')}`}>
                              {booking.status === 'confirmed' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBookingStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    }) || (
                      <tr>
                        <td colSpan="5" className="py-8 px-4 text-center text-slate-400">
                          No bookings found for this cabin
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-900/20 border border-blue-600 rounded"></div>
                  <span className="text-slate-400">Current booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-slate-400">Past booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-slate-400">Future booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  <span className="text-slate-400">Unavailable (Maintenance)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">Total Revenue</h4>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(bookings.filter(b => b.status === 'confirmed').reduce((sum, booking) => sum + (booking.total_price || 0), 0))}
                </p>
                <p className="text-sm text-slate-400">Lifetime earnings from this cabin</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">Total Bookings</h4>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-blue-400">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-sm text-slate-400">Confirmed reservations</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">Occupancy Rate</h4>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100) : 0}%
                </p>
                <p className="text-sm text-slate-400">Booking confirmation rate</p>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
                <button 
                  onClick={openBookingManager}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-3">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.booking_id} className="p-3 bg-slate-700 rounded-lg">
                    <p className="font-medium">{booking.customer?.name || 'Unknown Guest'}</p>
                    <p className="text-sm text-slate-400">
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </p>
                    <p className="text-sm font-medium text-green-400">{formatCurrency(booking.total_price)}</p>
                  </div>
                ))}
                {upcomingBookings.length === 0 && !loadingBookings && (
                  <p className="text-slate-400 text-sm">No upcoming bookings</p>
                )}
                {loadingBookings && (
                  <p className="text-slate-400 text-sm">Loading bookings...</p>
                )}
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Maintenance & Scheduling</h3>
                <button 
                  onClick={openAddMaintenanceForm}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Add Entry
                </button>
              </div>

              {/* Quick Actions - Show when Add Entry is clicked */}
              {showQuickActions && (
                <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <h4 className="text-md font-medium text-slate-300 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={handleMarkAvailable}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Available</span>
                    </button>
                    <button 
                      onClick={handleScheduleMaintenance}
                      className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Schedule Maintenance</span>
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scheduled Maintenance */}
              {scheduledMaintenance.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-orange-400 mb-3">Scheduled Maintenance</h4>
                  <div className="space-y-3">
                    {scheduledMaintenance.map((maintenance) => (
                      <div key={maintenance.id} className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-orange-400">Maintenance Scheduled</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                              {maintenance.status}
                            </span>
                            <div className="flex flex-col sm:flex-row gap-1">
                              <button
                                onClick={() => markMaintenanceCompleted(maintenance.id)}
                                className="text-green-400 hover:text-green-300 text-xs px-1.5 py-0.5 rounded hover:bg-green-600/10 whitespace-nowrap"
                                title="Mark as completed"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => deleteScheduledMaintenance(maintenance.id)}
                                className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 rounded hover:bg-red-600/10 whitespace-nowrap"
                                title="Delete maintenance"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-slate-300 mb-2">
                          <div className="mb-1">
                            <strong>Scheduled for:</strong> {maintenance.dates.sort().map((date, index) => (
                              <span key={index}>
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {index < maintenance.dates.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                          <div>
                            <strong>Entry date:</strong> {new Date(maintenance.scheduledAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Maintenance History */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3">
                  Maintenance History {loadingMaintenance && '(Loading...)'}
                </h4>
                <div className="space-y-2">
                  {maintenanceLogs.map((log) => (
                    <div key={log.log_id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-800/50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{log.log_type.charAt(0).toUpperCase() + log.log_type.slice(1)} - {log.description}</p>
                        </div>
                        <p className="text-slate-400">{new Date(log.log_date).toLocaleDateString('en-US')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                        <button
                          onClick={() => openEditMaintenanceForm(log)}
                          className="text-blue-400 hover:text-blue-300 text-xs px-1.5 py-0.5 rounded hover:bg-blue-600/10"
                          title="Edit maintenance entry"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteMaintenanceEntry(log.log_id)}
                          className="text-red-400 hover:text-red-300 text-xs px-1 py-1 rounded hover:bg-red-600/10"
                          title="Delete maintenance entry"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {maintenanceLogs.length === 0 && !loadingMaintenance && (
                    <p className="text-slate-400 text-sm">No maintenance history available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Manager Modal */}
      {showBookingManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold">Manage Upcoming Bookings</h3>
              <button
                onClick={closeBookingManager}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.booking_id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {(booking.customer?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{booking.customer?.name || 'Unknown Guest'}</h4>
                          <p className="text-sm text-slate-400">Booking #{booking.booking_id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.booking_id, e.target.value)}
                          className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                          value={booking.status === 'confirmed' ? 'paid' : 'pending'}
                          onChange={(e) => updatePaymentStatus(booking.booking_id, e.target.value)}
                          className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="deposit">Deposit</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <button
                          onClick={() => cancelBooking(booking.booking_id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Check-in:</span>
                        <span className="ml-2">{formatDate(booking.check_in_date)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Check-out:</span>
                        <span className="ml-2">{formatDate(booking.check_out_date)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Total:</span>
                        <span className="ml-2 text-green-400 font-semibold">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingBookings.length === 0 && !loadingBookings && (
                  <div className="text-center py-8 text-slate-400">
                    No upcoming bookings to manage
                  </div>
                )}
                {loadingBookings && (
                  <div className="text-center py-8 text-slate-400">
                    Loading bookings...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Entry Form Modal */}
      {showAddMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold">Add Maintenance Entry</h3>
              <button
                onClick={closeAddMaintenanceForm}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleMaintenanceEntrySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={newMaintenanceEntry.category}
                  onChange={(e) => handleMaintenanceEntryChange('category', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newMaintenanceEntry.date}
                  onChange={(e) => handleMaintenanceEntryChange('date', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newMaintenanceEntry.notes}
                  onChange={(e) => handleMaintenanceEntryChange('notes', e.target.value)}
                  placeholder="Describe the maintenance task..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddMaintenanceForm}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Maintenance Entry Form Modal */}
      {showEditMaintenanceForm && editingMaintenanceLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold">Edit Maintenance Entry</h3>
              <button
                onClick={closeEditMaintenanceForm}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditMaintenanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={editingMaintenanceLog.log_type}
                  onChange={(e) => handleEditMaintenanceChange('log_type', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="cleaning">Cleaning</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editingMaintenanceLog.log_date}
                  onChange={(e) => handleEditMaintenanceChange('log_date', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingMaintenanceLog.description}
                  onChange={(e) => handleEditMaintenanceChange('description', e.target.value)}
                  placeholder="Describe the maintenance task..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditMaintenanceForm}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
