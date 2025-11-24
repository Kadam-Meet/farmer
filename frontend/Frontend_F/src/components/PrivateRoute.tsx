import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  role: 'farmer' | 'worker';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  const userRole = user?.unsafeMetadata.role as string;
  // console.log("userRole:", userRole)
  // console.log("role:", role)

  if (userRole !== role) {
    // Redirect to their own dashboard if they try to access the wrong one
    if (userRole === 'farmer') {
      return <Navigate to="/farmer-dashboard" />;
    } else if (userRole === 'worker') {
      return <Navigate to="/worker-dashboard" />;
    }
    // If role is not defined, redirect to landing page
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
