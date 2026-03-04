import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import CabinUnits from './pages/CabinUnits';
import AdminCabinView from './pages/AdminCabinView';
import Emails from './pages/Emails';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Toast from './components/Toast.jsx';
import './api';

const ToastContainer = () => {
  const { toast, clearToast } = useAuth();
  return toast ? <Toast message={toast.message} type={toast.type} onClose={clearToast} /> : null;
};

function App() {
  // Get the current path and extract the page name
  const path = window.location.pathname;
  const getCurrentPage = () => {
    if (path.includes('bookings')) return 'bookings';
    if (path.includes('cabin-units')) return 'cabin-units';
    if (path.includes('emails')) return 'emails';
    if (path.includes('settings')) return 'settings';
    if (path.includes('customers')) return 'customers';
    return 'dashboard';
  };
  
  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Admin Panel */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/bookings" element={
            <ProtectedRoute>
              <Layout>
                <Bookings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/cabin-units" element={
            <ProtectedRoute>
              <Layout>
                <CabinUnits />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/emails" element={
            <ProtectedRoute>
              <Layout>
                <Emails />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings/:tab?" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/customers" element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/transactions" element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/cabin/:id" element={
            <ProtectedRoute>
              <AdminCabinView />
            </ProtectedRoute>
          } />
          
          {/* Booking-related routes */}
          <Route path="/admin/bookings/:id/edit" element={
            <ProtectedRoute>
              <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
                {/* TODO: Create EditBooking component */}
                <div className="p-6"><h1 className="text-2xl font-bold">Edit Booking (Coming Soon)</h1></div>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Guest-related routes */}
          <Route path="/admin/guests/:email" element={
            <ProtectedRoute>
              <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
                {/* TODO: Create GuestDetails component */}
                <div className="p-6"><h1 className="text-2xl font-bold">Guest Details (Coming Soon)</h1></div>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Catch all - redirect to admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
