import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "./firebase.js";

export async function createGroup(groupData, currentUser) {
  try {
    const groupRef = doc(collection(db, "groups"));

    const creatorDetail = {
      displayName: currentUser?.displayName ?? "Unknown",
      email: currentUser?.email ?? "",
      photoURL: currentUser?.photoURL ?? null,
      upiId: currentUser?.upiId ?? "",
    };

    const memberDetailsMap = {
      [currentUser.uid]: creatorDetail,
    };

    (groupData.invitedMembers ?? []).forEach((member) => {
      memberDetailsMap[member.uid] = {
        displayName: member?.displayName ?? "Unknown",
        email: member?.email ?? "",
        photoURL: member?.photoURL ?? null,
        upiId: member?.upiId ?? "",
      };
    });

    const memberUids = Object.keys(memberDetailsMap);

    const newGroup = {
      name: (groupData.name ?? "").trim(),
      description: (groupData.description ?? "").trim(),
      createdBy: currentUser.uid,
      members: memberUids,
      memberDetails: memberDetailsMap,
      totalExpenses: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(groupRef, newGroup);

    return { id: groupRef.id, ...newGroup };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to create group");
  }
}

export async function fetchGroup(groupId) {
  try {
    const groupSnap = await getDoc(doc(db, "groups", groupId));

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    return { id: groupSnap.id, ...groupSnap.data() };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to fetch group");
  }
}

export async function updateGroup(groupId, updates) {
  try {
    const groupRef = doc(db, "groups", groupId);

    await updateDoc(groupRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to update group");
  }
}

export async function deleteGroup(groupId) {
  try {
    const batch = writeBatch(db);
    const groupRef = doc(db, "groups", groupId);

    batch.delete(groupRef);

    await batch.commit();
  } catch (error) {
    throw new Error(error?.message ?? "Failed to delete group");
  }
}

export async function addMemberToGroup(groupId, memberProfile) {
  try {
    const groupRef = doc(db, "groups", groupId);

    const memberDetail = {
      displayName: memberProfile?.displayName ?? "Unknown",
      email: memberProfile?.email ?? "",
      photoURL: memberProfile?.photoURL ?? null,
      upiId: memberProfile?.upiId ?? "",
    };

    await updateDoc(groupRef, {
      members: arrayUnion(memberProfile.uid),
      [`memberDetails.${memberProfile.uid}`]: memberDetail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to add member");
  }
}

export async function removeMemberFromGroup(groupId, memberUid) {
  try {
    const groupRef = doc(db, "groups", groupId);

    await updateDoc(groupRef, {
      members: arrayRemove(memberUid),
      [`memberDetails.${memberUid}`]: {},
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to remove member");
  }
}

export function subscribeToUserGroups(uid, onData, onError) {
  const groupsQuery = query(
    collection(db, "groups"),
    where("members", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const groups = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(groups);
    },
    (error) => {
      onError?.(error?.message ?? "Failed to load groups");
    }
  );
}

export function subscribeToGroup(groupId, onData, onError) {
  const groupRef = doc(db, "groups", groupId);

  return onSnapshot(
    groupRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData({ id: docSnap.id, ...docSnap.data() });
      } else {
        onError?.("Group not found");
      }
    },
    (error) => {
      onError?.(error?.message ?? "Failed to load group");
    }
  );
}

export async function incrementGroupExpenseTotal(groupId, amountDelta) {
  try {
    const groupRef = doc(db, "groups", groupId);

    await updateDoc(groupRef, {
      totalExpenses: increment(amountDelta),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to update expense total");
  }
}

export async function searchUsersByEmail(email) {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", email.trim().toLowerCase())
    );

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        usersQuery,
        (snapshot) => {
          unsubscribe();
          const users = snapshot.docs.map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          }));
          resolve(users);
        },
        (error) => {
          unsubscribe();
          reject(new Error(error?.message ?? "Failed to search users"));
        }
      );
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to search users");
  }
}
