import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    // Redirect to appropriate dashboard based on role
    if (userProfile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userProfile?.role === 'project_manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (userProfile?.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
