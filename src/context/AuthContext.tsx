import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCommittee: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  simulateRole: (role: UserRole, displayName?: string, email?: string) => void;
  resetSimulatedRole: () => void;
  isSimulated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = 'eganeboe@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
          const trustedRole: UserRole = adminSnap.exists() && ['superAdmin','churchAdmin'].includes(adminSnap.data().role)
            ? adminSnap.data().role as UserRole : 'applicant';
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile({ ...data, role: trustedRole });
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid, email: currentUser.email || '',
              displayName: currentUser.displayName || 'Everlove User',role: 'applicant',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef,newProfile);
            setProfile({ ...newProfile,role:trustedRole });
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
          // Fallback to basic in-memory profile
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Authenticated User',
            role: 'applicant',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => { await fbSignOut(auth); };
  // No role impersonation is permitted in a public/client-facing build.
  const simulateRole = (_role: UserRole, _name?: string, _email?: string) => {};
  const resetSimulatedRole = () => {};
  const activeProfile = profile;
  const isAdmin = !!user && (profile?.role === 'superAdmin' || profile?.role === 'churchAdmin');
  const isCommittee = false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: activeProfile,
        loading,
        isAdmin,
        isCommittee,
        signInWithGoogle,
        signOut,
        simulateRole,
        resetSimulatedRole,
        isSimulated: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
