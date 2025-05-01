
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  redirectTo = "/auth" 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Show a loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
