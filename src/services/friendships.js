import {
  db,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "./firebase.js";

export function subscribeFriendships(uid, onData, onError) {
  const sentQuery = query(
    collection(db, "friendships"),
    where("senderId", "==", uid)
  );

  const receivedQuery = query(
    collection(db, "friendships"),
    where("receiverId", "==", uid)
  );

  let sentDocs = [];
  let receivedDocs = [];
  let sentLoaded = false;
  let receivedLoaded = false;

  const merge = () => {
    if (sentLoaded && receivedLoaded) {
      onData([...sentDocs, ...receivedDocs]);
    }
  };

  const unsubSent = onSnapshot(
    sentQuery,
    (snap) => {
      sentDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      sentLoaded = true;
      merge();
    },
    (err) => {
      console.error("friendships sent error:", err?.code, err?.message);
      onError?.(err?.message);
    }
  );

  const unsubReceived = onSnapshot(
    receivedQuery,
    (snap) => {
      receivedDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      receivedLoaded = true;
      merge();
    },
    (err) => {
      console.error("friendships received error:", err?.code, err?.message);
      onError?.(err?.message);
    }
  );

  return () => {
    unsubSent();
    unsubReceived();
  };
}

export async function sendFriendRequest(senderUid, receiverUid) {
  if (senderUid === receiverUid) {
    throw new Error("You cannot send a friend request to yourself");
  }

  const existingQuery = query(
    collection(db, "friendships"),
    where("senderId", "==", senderUid),
    where("receiverId", "==", receiverUid)
  );
  const reverseQuery = query(
    collection(db, "friendships"),
    where("senderId", "==", receiverUid),
    where("receiverId", "==", senderUid)
  );

  const [existingSnap, reverseSnap] = await Promise.all([
    getDocs(existingQuery),
    getDocs(reverseQuery),
  ]);

  if (!existingSnap.empty || !reverseSnap.empty) {
    throw new Error("A friend request already exists between you two");
  }

  try {
    await addDoc(collection(db, "friendships"), {
      senderId: senderUid,
      receiverId: receiverUid,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("sendFriendRequest failed:", error?.code, error?.message);
    throw new Error(error?.message ?? "Failed to send friend request");
  }
}

export async function acceptFriendRequest(friendshipId) {
  try {
    await updateDoc(doc(db, "friendships", friendshipId), {
      status: "accepted",
      acceptedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("acceptFriendRequest failed:", error?.code, error?.message);
    throw new Error(error?.message ?? "Failed to accept request");
  }
}

export async function declineFriendRequest(friendshipId) {
  try {
    await deleteDoc(doc(db, "friendships", friendshipId));
  } catch (error) {
    console.error("declineFriendRequest failed:", error?.code, error?.message);
    throw new Error(error?.message ?? "Failed to decline request");
  }
}

export async function removeFriend(friendshipId) {
  try {
    await deleteDoc(doc(db, "friendships", friendshipId));
  } catch (error) {
    console.error("removeFriend failed:", error?.code, error?.message);
    throw new Error(error?.message ?? "Failed to remove friend");
  }
}
