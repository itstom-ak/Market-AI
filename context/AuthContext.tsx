import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Vendor, Role, Category } from '../types';
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
  users: User[];
  vendors: Vendor[];
  login: (credentialResponse: any, role: Role) => void;
  logout: () => void;
  skipLogin: (role: Role) => void;
  selectAppType: (role: Role) => void;
  resetAppSelection: () => void;
  loginWithPassword: (email: string, password: string, role: Role) => Promise<void>;
  signup: (details: Omit<User, 'id'> | Omit<Vendor, 'id'>, role: Role) => Promise<void>;
  updateVendorProfile: (vendorId: string, updates: Partial<Vendor>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Vendor | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [appType, setAppType] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);

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

      let foundUser: User | Vendor;
      
      if (selectedRole === 'user' || selectedRole === 'admin') {
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          foundUser = existingUser;
        } else {
          const newUser: User = { id: `google-${sub}`, name, email };
          setUsers(prev => [...prev, newUser]);
          foundUser = newUser;
        }
      } else { // vendor
        const existingVendor = vendors.find(v => v.email === email);
        if (existingVendor) {
          foundUser = existingVendor;
        } else {
          const newVendor: Vendor = {
            id: `google-${sub}`,
            businessName: `${name}'s Store`,
            specialties: ['General'],
            email: email,
          };
          setVendors(prev => [...prev, newVendor]);
          foundUser = newVendor;
        }
      }
      
      setUser(foundUser);
      setRole(selectedRole);
      localStorage.setItem('marketplace_user', JSON.stringify(foundUser));
      localStorage.setItem('marketplace_role', selectedRole);
    }
    setLoading(false);
  };
  
  const loginWithPassword = async (email: string, password: string, selectedRole: Role): Promise<void> => {
    setLoading(true);
    selectAppType(selectedRole);

    let foundUser: User | Vendor | undefined;

    if (selectedRole === 'user' || selectedRole === 'admin') {
        foundUser = users.find(u => u.email === email && u.password === password);
    } else if (selectedRole === 'vendor') {
        foundUser = vendors.find(v => v.email === email && v.password === password);
    }

    if (foundUser) {
        setUser(foundUser);
        setRole(selectedRole);
        localStorage.setItem('marketplace_user', JSON.stringify(foundUser));
        localStorage.setItem('marketplace_role', selectedRole);
        setLoading(false);
    } else {
        setLoading(false);
        throw new Error("Invalid credentials. Please try again.");
    }
  };
  
  const signup = async (details: Omit<User, 'id'> | Omit<Vendor, 'id'>, selectedRole: Role): Promise<void> => {
    setLoading(true);
    selectAppType(selectedRole);

    let newUser: User | Vendor;
    const commonDetails = { id: `new-${Date.now()}`, ...details };

    if (selectedRole === 'user' || selectedRole === 'admin') {
        const userDetails = details as Omit<User, 'id'>;
        const existing = users.find(u => u.email === userDetails.email);
        if (existing) {
            setLoading(false);
            throw new Error("A user with this email already exists.");
        }
        newUser = commonDetails as User;
        setUsers(prev => [...prev, newUser as User]);
    } else { // vendor
        const vendorDetails = details as Omit<Vendor, 'id'>;
        const existing = vendors.find(v => v.email === vendorDetails.email);
        if (existing) {
            setLoading(false);
            throw new Error("A vendor with this email already exists.");
        }
        // Ensure new vendors have specialties
        if (!('specialties' in vendorDetails) || vendorDetails.specialties.length === 0) {
            (commonDetails as Vendor).specialties = ['General'];
        }
        newUser = commonDetails as Vendor;
        setVendors(prev => [...prev, newUser as Vendor]);
    }

    setUser(newUser);
    setRole(selectedRole);
    localStorage.setItem('marketplace_user', JSON.stringify(newUser));
    localStorage.setItem('marketplace_role', selectedRole);
    setLoading(false);
  };

  const updateVendorProfile = (vendorId: string, updates: Partial<Vendor>) => {
    setVendors(prevVendors => 
        prevVendors.map(v => v.id === vendorId ? { ...v, ...updates } : v)
    );
    if (user?.id === vendorId && role === 'vendor') {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('marketplace_user', JSON.stringify(updatedUser));
    }
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
    localStorage.setItem('marketplace_user', JSON.stringify(guestUser));
    localStorage.setItem('marketplace_role', selectedRole);
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
    <AuthContext.Provider value={{ isAuthenticated, user, role, appType, loading, users, vendors, login, logout, skipLogin, selectAppType, resetAppSelection, loginWithPassword, signup, updateVendorProfile }}>
      {children}
    {/* FIX: Corrected typo in closing tag from Auth-context to AuthContext */}
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
