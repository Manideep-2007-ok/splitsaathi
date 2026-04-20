import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
} from "./firebase.js";

export async function createUserDocument(userData) {
  try {
    const userRef = doc(db, "users", userData.uid);
    const userDoc = {
      uid: userData.uid,
      displayName: (userData.displayName ?? "").trim(),
      email: (userData.email ?? "").trim().toLowerCase(),
      photoURL: userData.photoURL ?? null,
      upiId: (userData.upiId ?? "").trim(),
      searchableName: (userData.displayName ?? "").trim().toLowerCase(),
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, userDoc);
    return userDoc;
  } catch (error) {
    throw new Error(error?.message ?? "Failed to create user profile");
  }
}

export async function updateUserDocument(uid, updates) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to update user profile");
  }
}

export async function fetchUserDocument(uid) {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return null;
    return { uid: userSnap.id, ...userSnap.data() };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to fetch user");
  }
}

export async function checkUserExists(uid) {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    return userSnap.exists();
  } catch (error) {
    return false;
  }
}

export async function searchUsers(searchTerm) {
  try {
    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const isEmailSearch = trimmed.includes("@");
    const results = [];

    if (isEmailSearch) {
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", trimmed),
        limit(10)
      );
      const snapshot = await getDocs(emailQuery);
      snapshot.forEach((docSnap) => {
        results.push({ uid: docSnap.id, ...docSnap.data() });
      });
    } else {
      const nameStart = trimmed;
      const nameEnd = trimmed + "\uf8ff";
      const nameQuery = query(
        collection(db, "users"),
        where("searchableName", ">=", nameStart),
        where("searchableName", "<=", nameEnd),
        limit(10)
      );
      const snapshot = await getDocs(nameQuery);
      snapshot.forEach((docSnap) => {
        results.push({ uid: docSnap.id, ...docSnap.data() });
      });
    }

    return results;
  } catch (error) {
    console.error("User search failed:", error);
    throw new Error(error?.message ?? "Failed to search users");
  }
}
