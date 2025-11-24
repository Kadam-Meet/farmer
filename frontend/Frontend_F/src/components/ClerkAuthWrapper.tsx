import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { User } from "../types";

const ClerkAuthWrapper: React.FC = () => {
  const { user } = useUser();
  const { userType, setUser, setUserType } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const setUserRoleAndRedirect = async () => {
     
        const registrationComplete = user.unsafeMetadata.registrationComplete as boolean;

        if (registrationComplete) {
          const role = user.unsafeMetadata.role as 'farmer' | 'worker';
          setUserType(role);
          const appUser: User = {
            id: user.id,
            name: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            contactNumber: user.primaryPhoneNumber?.phoneNumber || '',
            userType: role,
            verified: true, // Assuming verified if registration is complete
          };
          setUser(appUser);

          if (role === 'farmer') {
            navigate('/farmer-dashboard');
          } else if (role === 'worker') {
            navigate('/worker-dashboard');
          } else {
            // Handle cases where role is not set or is unexpected
            navigate('/'); 
          }
        } else {
          try {
            await user.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                role: userType,
                registrationComplete: false,
              },
            });
            console.log('✅ Role saved in Clerk metadata:', userType);
            navigate('/auth'); // Proceed to registration form
          } catch (error) {
            console.error('Error updating user metadata:', error);
          }
        }
      
    };

    setUserRoleAndRedirect();
  },[user,userType]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
      <p className="text-lg font-medium">
        Completing your {userType} authentication...
      </p>
    </div>
  );
};

export default ClerkAuthWrapper;

