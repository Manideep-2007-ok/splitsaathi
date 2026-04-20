import { useState, useEffect } from "react";
import { subscribeToUserGroups, subscribeToGroupInvitations } from "../services/groups.js";

export function useGroups(uid) {
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setGroups([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeGroups = subscribeToUserGroups(
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

    const unsubscribeInvites = subscribeToGroupInvitations(
      uid,
      (fetchedInvites) => {
        setInvitations(fetchedInvites);
      },
      (errorMessage) => {
        console.error("Failed to fetch invites:", errorMessage);
      }
    );

    return () => {
      unsubscribeGroups();
      unsubscribeInvites();
    };
  }, [uid]);

  return { groups, invitations, loading, error };
}
