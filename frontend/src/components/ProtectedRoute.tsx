import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks';
import { LoadingSpinner } from './index';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to home if authenticated but not authorized
    return <Navigate to="/" replace />;
  }

  // Render child routes if user is authenticated and authorized
  return <Outlet />;
}

export default ProtectedRoute;
