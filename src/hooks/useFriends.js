import { useState, useEffect, useMemo } from "react";
import { subscribeFriendships } from "../services/friendships.js";

export function useFriends(currentUserUid) {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserUid) {
      setFriendships([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeFriendships(
      currentUserUid,
      (data) => {
        setFriendships(data ?? []);
        setLoading(false);
      },
      (errMsg) => {
        setError(errMsg);
        setLoading(false);
      }
    );

    const safetyTimeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [currentUserUid]);

  const acceptedFriends = useMemo(
    () =>
      friendships
        .filter((f) => f.status === "accepted")
        .map((f) => ({
          friendshipId: f.id,
          friendUid:
            f.senderId === currentUserUid ? f.receiverId : f.senderId,
        })),
    [friendships, currentUserUid]
  );

  const pendingReceived = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.receiverId === currentUserUid
      ),
    [friendships, currentUserUid]
  );

  const pendingSent = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.senderId === currentUserUid
      ),
    [friendships, currentUserUid]
  );

  const acceptedFriendUids = useMemo(
    () => new Set(acceptedFriends.map((f) => f.friendUid)),
    [acceptedFriends]
  );

  return {
    friendships,
    acceptedFriends,
    acceptedFriendUids,
    pendingReceived,
    pendingSent,
    loading,
    error,
  };
}
