import { useState, useEffect } from "react";
import { subscribeToUserGroups } from "../services/groups.js";

export function useGroups(uid) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserGroups(
      uid,
      (fetchedGroups) => {
        setGroups(fetchedGroups);
        setLoading(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { groups, loading, error };
}
