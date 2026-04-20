import { createContext, useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "../services/firebase.js";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const profileData = { uid: firebaseUser.uid, ...userDocSnap.data() };
            setUserProfile(profileData);
            setProfileComplete(true);
          } else {
            setUserProfile({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName ?? "",
              email: firebaseUser.email ?? "",
              photoURL: firebaseUser.photoURL ?? null,
              upiId: "",
            });
            setProfileComplete(false);
          }
        } catch (fetchError) {
          console.error("Profile fetch error:", fetchError);
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName ?? "",
            email: firebaseUser.email ?? "",
            photoURL: firebaseUser.photoURL ?? null,
            upiId: "",
          });
          setProfileComplete(false);
        }
      } else {
        setUserProfile(null);
        setProfileComplete(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      throw new Error(error?.message ?? "Failed to sign in with Google");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setProfileComplete(false);
    } catch (error) {
      throw new Error(error?.message ?? "Failed to sign out");
    }
  }, []);

  const updateUserProfile = useCallback(
    async (profileUpdates) => {
      if (!currentUser?.uid) throw new Error("No authenticated user");
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { ...profileUpdates, updatedAt: serverTimestamp() });
        setUserProfile((prev) => ({ ...prev, ...profileUpdates }));
      } catch (error) {
        throw new Error(error?.message ?? "Failed to update profile");
      }
    },
    [currentUser?.uid]
  );

  const markProfileComplete = useCallback((profile) => {
    setUserProfile(profile);
    setProfileComplete(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        profileComplete,
        loading,
        signInWithGoogle,
        logout,
        updateUserProfile,
        markProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
