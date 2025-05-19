import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import UserDashboard from '../pages/dashboard/UserDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import TenderList from '../pages/tenders/TenderList';
import TenderUpload from '../pages/tenders/TenderUpload';
import TenderDetails from '../pages/tenders/TenderDetails';
import ManageUsers from '../pages/admin/ManageUsers';
import Settings from '../pages/settings/Settings';
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';
import { useAuth } from '../context/AuthContext';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  console.log('User from context:', user);
  // Check if the user is an admin
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes with DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Dashboard route - redirects based on role */}
          <Route
            path="/dashboard"
            element={isAdmin ? <AdminDashboard /> : <UserDashboard />}
          />
          
          {/* Common routes for both users and admins */}
          <Route path="/tenders" element={<TenderList />} />
          <Route path="/tenders/upload" element={<TenderUpload />} />
          <Route path="/tenders/:id" element={<TenderDetails />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin-only routes */}
          {isAdmin && (
            <Route path="/admin/users" element={<ManageUsers />} />
          )}
        </Route>
      </Route>

      {/* Error routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/not-found" element={<NotFound />} />
      
      {/* Redirect to login by default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;