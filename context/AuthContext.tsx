import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, Vendor, Role } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | Vendor | null;
  role: Role | null;
  appType: Role | null;
  loading: boolean;
  logout: () => void;
  selectAppType: (role: Role) => void;
  resetAppSelection: () => void;
  loginWithPassword: (email: string, password: string, role: Role) => Promise<void>;
  signup: (details: Omit<User, 'id'> | Omit<Vendor, 'id'>, role: Role) => Promise<void>;
  updateVendorProfile: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Vendor | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [appType, setAppType] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log("onAuthStateChanged: Triggered. Firebase user:", firebaseUser);
      if (firebaseUser) {
        console.log("onAuthStateChanged: User is logged in, fetching data for UID:", firebaseUser.uid);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const vendorDocRef = doc(db, 'vendors', firebaseUser.uid);

        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log("onAuthStateChanged: Found user data:", userData);
          setUser(userData);
          setRole(userData.role || 'user');
          setAppType(userData.role || 'user');
        } else {
          const vendorDoc = await getDoc(vendorDocRef);
          if (vendorDoc.exists()) {
            const vendorData = vendorDoc.data() as Vendor;
            console.log("onAuthStateChanged: Found vendor data:", vendorData);
            setUser(vendorData);
            setRole('vendor');
            setAppType('vendor');
          } else {
            console.warn("onAuthStateChanged: User is authenticated, but no data found in 'users' or 'vendors' collections for UID:", firebaseUser.uid);
          }
        }
      } else {
        console.log("onAuthStateChanged: User is logged out.");
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, []);

  const selectAppType = (selectedAppType: Role) => {
    setAppType(selectedAppType);
  };

  const resetAppSelection = () => {
    setAppType(null);
  };

  const loginWithPassword = async (email: string, password: string, selectedRole: Role): Promise<void> => {
    setLoading(true);
    console.log(`loginWithPassword: Attempting to log in as ${email} with role ${selectedRole}`);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("loginWithPassword: Firebase sign-in successful.", userCredential);
      // The onAuthStateChanged listener will handle setting the user state.
    } catch (error: any) {
      console.error("loginWithPassword: Error during sign-in:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (details: Omit<User, 'id'> | Omit<Vendor, 'id'>, selectedRole: Role): Promise<void> => {
    setLoading(true);
    console.log(`signup: Attempting to sign up new ${selectedRole} with email ${details.email}`);
    try {
      // Note: Firebase requires a password for email/password signup.
      const password = (details as User).password;
      if (!password) {
        throw new Error("Password is required for signup.");
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, details.email, password);
      const firebaseUser = userCredential.user;
      console.log("signup: Firebase user created successfully:", firebaseUser);

      const userData = {
        id: firebaseUser.uid,
        ...details,
        role: selectedRole,
      };

      // Remove password before saving to Firestore
      delete (userData as any).password;

      const userDocRef = selectedRole === 'vendor' ? doc(db, 'vendors', firebaseUser.uid) : doc(db, 'users', firebaseUser.uid);
      console.log(`signup: Saving user data to Firestore at path: ${userDocRef.path}`);
      await setDoc(userDocRef, userData);
      console.log("signup: User data saved to Firestore successfully.");

      // The onAuthStateChanged listener will handle setting the user state.
    } catch (error: any) {
      console.error("signup: Error during sign-up:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVendorProfile = async (vendorId: string, updates: Partial<Vendor>) => {
    console.log(`updateVendorProfile: Updating vendor ${vendorId} with`, updates);
    const vendorDocRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorDocRef, updates);
    if (user?.id === vendorId) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    console.log("logout: Signing out user.");
    await signOut(auth);
    // The onAuthStateChanged listener will handle clearing user state.
    resetAppSelection();
  };
  
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, appType, loading, logout, selectAppType, resetAppSelection, loginWithPassword, signup, updateVendorProfile }}>
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
