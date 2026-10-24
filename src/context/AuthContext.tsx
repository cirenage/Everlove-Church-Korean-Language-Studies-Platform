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
  const [simulatedProfile, setSimulatedProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('everlove_sim_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          const isBootstrapAdmin = currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (isBootstrapAdmin && data.role !== 'superAdmin') {
              data.role = 'superAdmin';
              await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
            }
            setProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Everlove User',
              role: isBootstrapAdmin ? 'superAdmin' : 'applicant',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);

            // Also register in admins collection if bootstrap admin
            if (isBootstrapAdmin) {
              await setDoc(doc(db, 'admins', currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                role: 'superAdmin',
                addedAt: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
          // Fallback to basic in-memory profile
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Authenticated User',
            role: currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'superAdmin' : 'applicant',
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

  const signOut = async () => {
    try {
      setSimulatedProfile(null);
      localStorage.removeItem('everlove_sim_user');
      await fbSignOut(auth);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const simulateRole = (role: UserRole, displayName = 'Joy Jieun Choi', email = 'joy.choi@everlove.kr') => {
    const sim: UserProfile = {
      uid: `sim_${role}_${Date.now()}`,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    };
    setSimulatedProfile(sim);
    localStorage.setItem('everlove_sim_user', JSON.stringify(sim));
  };

  const resetSimulatedRole = () => {
    setSimulatedProfile(null);
    localStorage.removeItem('everlove_sim_user');
  };

  const activeProfile = simulatedProfile || profile;
  const isAdmin =
    activeProfile?.role === 'superAdmin' ||
    activeProfile?.role === 'churchAdmin' ||
    user?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  const isCommittee = activeProfile?.role === 'committeeReviewer' || isAdmin;

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
        isSimulated: !!simulatedProfile,
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
