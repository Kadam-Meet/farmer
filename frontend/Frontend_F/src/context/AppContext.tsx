import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, User } from '../types';
// import { useUser } from '@clerk/clerk-react';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  userType: 'farmer' | 'worker';
  setUserType: (type: 'farmer' | 'worker') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  // const { user: clerkUser, isLoaded } = useUser();
  const [userType, setUserTypeState] = useState<'farmer' | 'worker'>('farmer');
  const [user, setUser] = useState<User | null>({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    contactNumber: '1234567890',
    userType: 'farmer',
    verified: true,
  });

  // Keep localStorage and React state in sync
  const setUserType = (type: 'farmer' | 'worker') => {
    setUserTypeState(type);
    setUser(prev => prev ? { ...prev, userType: type } : null);
  };

  /*
  useEffect(() => {
    if (isLoaded && clerkUser) {
      // const role = (clerkUser.unsafeMetadata.role as 'farmer' | 'worker') || userType;
      // setUserType(role);

      const appUser: User = {
        id: clerkUser.id,
        name: clerkUser.fullName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        contactNumber: clerkUser.primaryPhoneNumber?.phoneNumber || '',
        userType: (clerkUser?.unsafeMetadata?.role as 'farmer' | 'worker') || 'worker',
        verified: !!clerkUser.unsafeMetadata.registrationComplete,
      };
      setUser(appUser);
    }
  }, [clerkUser, isLoaded]);
  */

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage,
        userType,
        setUserType,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
