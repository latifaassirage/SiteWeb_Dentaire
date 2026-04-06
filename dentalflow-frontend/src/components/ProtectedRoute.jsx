import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, [token]);

  if (!token) {
    return null; // or show loading spinner
  }

  return children;
};

export default ProtectedRoute;
