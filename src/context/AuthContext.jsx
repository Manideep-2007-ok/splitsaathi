import { createContext, useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  onSnapshot,
  doc,
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
    let profileUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        profileUnsubscribe = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const profileData = { uid: firebaseUser.uid, ...docSnap.data() };
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
            setLoading(false);
          },
          (error) => {
            console.error("Profile listener error:", error);
            setUserProfile({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName ?? "",
              email: firebaseUser.email ?? "",
              photoURL: firebaseUser.photoURL ?? null,
              upiId: "",
            });
            setProfileComplete(false);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setProfileComplete(false);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
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
