import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, dbUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && dbUser?.role !== 'admin' && dbUser?.role !== 'sub-admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
