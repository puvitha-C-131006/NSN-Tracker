import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ allowedRoles, redirectTo = '/leave-permission' }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render the protected routes if authenticated
  return <Outlet />;
}
