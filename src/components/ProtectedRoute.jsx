import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canAccessScope } from '../data/permissions';

export default function ProtectedRoute({ children, scope, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-loading">Loading workspace…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requiredRole && !requiredRole.includes(user.roleId)) return <Navigate to="/" replace />;
  if (scope && !canAccessScope(user.roleId, scope)) return <Navigate to="/" replace />;

  return children;
}
