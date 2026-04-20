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
    const batch = writeBatch(db);
    const groupRef = doc(collection(db, "groups"));

    const creatorDetail = {
      displayName: currentUser?.displayName ?? "Unknown",
      email: currentUser?.email ?? "",
      photoURL: currentUser?.photoURL ?? null,
      upiId: currentUser?.upiId ?? "",
    };

    // Only the creator is added initially
    const memberDetailsMap = {
      [currentUser.uid]: creatorDetail,
    };

    const newGroup = {
      name: (groupData.name ?? "").trim(),
      description: (groupData.description ?? "").trim(),
      createdBy: currentUser.uid,
      members: [currentUser.uid],
      memberDetails: memberDetailsMap,
      totalExpenses: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(groupRef, newGroup);

    // Send invitations to invited members
    (groupData.invitedMembers ?? []).forEach((member) => {
      const inviteRef = doc(collection(db, "group_invitations"));
      batch.set(inviteRef, {
        groupId: groupRef.id,
        groupName: newGroup.name,
        invitedUserId: member.uid,
        senderId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    return { id: groupRef.id, ...newGroup };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to create group");
  }
}

export async function inviteUserToGroup(groupId, groupName, invitedUser, senderId) {
  try {
    const inviteRef = doc(collection(db, "group_invitations"));
    await setDoc(inviteRef, {
      groupId,
      groupName,
      invitedUserId: invitedUser.uid,
      senderId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error?.message ?? "Failed to invite user");
  }
}

export async function acceptGroupInvitation(invitationId, groupId, userProfile) {
  try {
    const batch = writeBatch(db);
    
    // Delete invitation
    const inviteRef = doc(db, "group_invitations", invitationId);
    batch.delete(inviteRef);

    // Add user to group
    const groupRef = doc(db, "groups", groupId);
    const memberDetail = {
      displayName: userProfile?.displayName ?? "Unknown",
      email: userProfile?.email ?? "",
      photoURL: userProfile?.photoURL ?? null,
      upiId: userProfile?.upiId ?? "",
    };
    
    batch.update(groupRef, {
      members: arrayUnion(userProfile.uid),
      [`memberDetails.${userProfile.uid}`]: memberDetail,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error?.message ?? "Failed to accept invitation");
  }
}

export async function rejectGroupInvitation(invitationId) {
  try {
    const inviteRef = doc(db, "group_invitations", invitationId);
    await deleteDoc(inviteRef);
  } catch (error) {
    throw new Error(error?.message ?? "Failed to reject invitation");
  }
}

export function subscribeToGroupInvitations(uid, onData, onError) {
  const invitesQuery = query(
    collection(db, "group_invitations"),
    where("invitedUserId", "==", uid),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    invitesQuery,
    (snapshot) => {
      const invites = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(invites);
    },
    (error) => {
      onError?.(error?.message ?? "Failed to load invitations");
    }
  );
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
