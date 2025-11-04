import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeKioskPage from './pages/EmployeeKioskPage';
import EmployeePortal from './pages/EmployeePortal';
import ScheduleTemplatesPage from './pages/ScheduleTemplatesPage';
import WeeklySchedulingPage from './pages/WeeklySchedulingPage';
import AdvancedSchedulingDashboard from './pages/AdvancedSchedulingDashboard';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // Verificar si el usuario tiene el rol requerido
  if (adminOnly) {
    const userRole = user?.publicMetadata?.role || user?.privateMetadata?.role;
    if (userRole !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Componente específico para proteger el dashboard de admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  // Mientras carga Clerk, mostrar spinner
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <LoadingSpinner />
      </div>
    );
  }

  // Si no está logueado, redirigir al login
  if (!isSignedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  // Si está logueado, mostrar el dashboard
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/employee-kiosk" element={<EmployeeKioskPage />} />
      <Route path="/employee-portal" element={<EmployeePortal />} />
      
      {/* Admin Routes - Protected by Clerk */}
      
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      
      <Route 
        path="/schedule-templates" 
        element={
          <ProtectedAdminRoute>
            <ScheduleTemplatesPage />
          </ProtectedAdminRoute>
        } 
      />
      
      <Route 
        path="/weekly-scheduling" 
        element={
          <ProtectedAdminRoute>
            <WeeklySchedulingPage />
          </ProtectedAdminRoute>
        } 
      />
      
      <Route 
        path="/advanced-scheduling" 
        element={
          <ProtectedAdminRoute>
            <AdvancedSchedulingDashboard />
          </ProtectedAdminRoute>
        } 
      />
      
      {/* 404 */}
      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center min-h-screen bg-neutral-light">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-neutral-dark mb-4 font-serif">404</h1>
              <p className="text-brand-medium mb-8">Página no encontrada</p>
              <Navigate to="/" replace />
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
