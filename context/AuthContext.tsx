import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Vendor, Role } from '../types';
import { mockUsers, mockVendors, mockAdmin } from '../services/mockData';

// Simplified JWT decoding
const decodeJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | Vendor | null;
  role: Role | null;
  appType: Role | null;
  loading: boolean;
  login: (credentialResponse: any, role: Role) => void;
  logout: () => void;
  skipLogin: (role: Role) => void;
  selectAppType: (role: Role) => void;
  resetAppSelection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Vendor | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [appType, setAppType] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('marketplace_user');
      const storedRole = localStorage.getItem('marketplace_role') as Role | null;
      const storedAppType = localStorage.getItem('marketplace_appType') as Role | null;

      if (storedUser && storedRole && storedAppType) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setAppType(storedAppType);
      } else if (storedAppType) {
        setAppType(storedAppType);
      }
    } catch (error) {
      console.error("Failed to load session from localStorage", error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAppType = (selectedAppType: Role) => {
    setAppType(selectedAppType);
    localStorage.setItem('marketplace_appType', selectedAppType);
  };

  const resetAppSelection = () => {
    setAppType(null);
    localStorage.removeItem('marketplace_appType');
  };

  const login = (credentialResponse: any, selectedRole: Role) => {
    setLoading(true);
    selectAppType(selectedRole);
    const idToken = credentialResponse.credential;
    const decodedToken = decodeJwt(idToken);
    
    if (decodedToken) {
      const { email, name, sub } = decodedToken;

      let foundUser: User | Vendor | null = null;
      
      if (selectedRole === 'user') {
        foundUser = mockUsers.find(u => u.email === email) || {
          id: `google-${sub}`,
          name: name,
          email: email,
        };
      } else { // vendor
        foundUser = mockVendors.find(v => v.email === email) || {
          id: `google-${sub}`,
          businessName: `${name}'s Store`,
          specialties: ['General'],
          email: email,
        };
      }
      
      setUser(foundUser);
      setRole(selectedRole);
      localStorage.setItem('marketplace_user', JSON.stringify(foundUser));
      localStorage.setItem('marketplace_role', selectedRole);
    }
    setLoading(false);
  };

  const skipLogin = (selectedRole: Role) => {
    setLoading(true);
    selectAppType(selectedRole);
    let guestUser: User | Vendor;

    if (selectedRole === 'user') {
        guestUser = {
            id: 'guest-user',
            name: 'Guest User',
            email: 'guest@example.com',
        };
    } else if (selectedRole === 'vendor') {
        guestUser = {
            id: 'guest-vendor',
            businessName: 'Guest Vendor Store',
            specialties: ['General', 'Hardware', 'Auto Parts', 'Plumbing'], // Give specialties to see leads
            email: 'guest.vendor@example.com'
        };
    } else { // admin
        guestUser = mockAdmin;
    }


    setUser(guestUser);
    setRole(selectedRole);
    setLoading(false);
  };


  const logout = () => {
    setUser(null);
    setRole(null);
    setAppType(null);
    localStorage.removeItem('marketplace_user');
    localStorage.removeItem('marketplace_role');
    localStorage.removeItem('marketplace_appType');
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, appType, loading, login, logout, skipLogin, selectAppType, resetAppSelection }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add google to window interface
declare global {
    interface Window {
        google: any;
    }
}
