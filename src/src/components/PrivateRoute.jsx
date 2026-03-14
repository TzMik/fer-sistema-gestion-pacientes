import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, isAuthorized, isSetupComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // User must be logged in, authorized, and have setup complete.
  if (!user || !isAuthorized || !isSetupComplete) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
