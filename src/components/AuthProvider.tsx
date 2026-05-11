import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAppStore, UserProfile } from '../store/useAppStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile;
          setUser(profile);
        } else {
          // Create new user profile
          const isAdminEmail = firebaseUser.email === 'bryan060807@gmail.com';
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'New Builder',
            role: isAdminEmail ? 'owner' : 'laborer'
          };
          
          await setDoc(userRef, newProfile);
          setUser(newProfile);
        }

        // Listen for profile changes (real-time role updates)
        const unsubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as UserProfile);
          }
        });

        setAuthLoading(false);
        return () => unsubProfile();
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  return <>{children}</>;
}
