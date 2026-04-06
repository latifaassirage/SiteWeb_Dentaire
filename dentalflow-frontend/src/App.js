import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import Documents from './pages/patient/Documents';

import AdminDashboard from './pages/admin/Dashboard';
import Agenda from './pages/admin/Agenda';
import Patients from './pages/admin/Patients';
import Finance from './pages/admin/Finance';
import Settings from './pages/admin/Settings';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔐 ProtectedRoute check:', { token: !!token, userRole: user.role, requiredRole: role });

  if (!token) return <Navigate to="/login" />;

  if (role === 'admin' && user.role !== 'admin' && user.role !== 'doctor') {
    console.log('❌ Admin access denied - redirecting to login');
    return <Navigate to="/login" />;
  }

  if (role === 'patient' && user.role !== 'patient') {
    console.log('❌ Patient access denied - redirecting to login');
    return <Navigate to="/login" />;
  }

  console.log('✅ Access granted');
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/book" element={<ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/documents" element={<ProtectedRoute role="patient"><Documents /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><Agenda /></ProtectedRoute>} />
        <Route path="/admin/patients" element={<ProtectedRoute role="admin"><Patients /></ProtectedRoute>} />
        <Route path="/admin/finance" element={<ProtectedRoute role="admin"><Finance /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
