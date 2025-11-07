import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser, getUser } from '../services/database';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      if (userData.fullName) {
        await updateProfile(userCredential.user, {
          displayName: userData.fullName
        });
      }

      // Create user profile in Firestore
      await createUser(userCredential.user.uid, {
        email,
        fullName: userData.fullName,
        role: userData.role,
        department: userData.department || '',
        designation: userData.designation || '',
        joiningDate: userData.joiningDate || new Date().toISOString(),
        compensation: userData.compensation || 0,
        skills: userData.skills || [],
        certifications: userData.certifications || [],
        status: 'active'
      });

      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (userId) => {
    try {
      const profile = await getUser(userId);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check if user has specific role
  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  // Check if user is project manager
  const isProjectManager = () => {
    return userProfile?.role === 'project_manager';
  };

  // Check if user is employee
  const isEmployee = () => {
    return userProfile?.role === 'employee';
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loadUserProfile,
    hasRole,
    isAdmin,
    isProjectManager,
    isEmployee,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
