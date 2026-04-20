import { useState, useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useFriends } from "../../hooks/useFriends.js";
import { fetchUserDocument } from "../../services/users.js";
import { useToast } from "../../hooks/useToast.js";
import Avatar from "../common/Avatar.jsx";
import { Search, X, UserPlus, Loader2, ShieldAlert } from "lucide-react";

function MemberSelector({ selectedMembers, onMembersChange, currentUserUid }) {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();
  const { acceptedFriends, loading: friendsLoading } = useFriends(currentUser?.uid);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [profilesLoaded, setProfilesLoaded] = useState(false);

  useMemo(() => {
    if (acceptedFriends.length === 0 || profilesLoaded) return;

    const uidsToFetch = acceptedFriends
      .map((f) => f.friendUid)
      .filter((uid) => !friendProfiles[uid]);

    if (uidsToFetch.length === 0) return;

    Promise.all(uidsToFetch.map((uid) => fetchUserDocument(uid)))
      .then((docs) => {
        const profiles = {};
        docs.forEach((d) => {
          if (d) profiles[d.uid] = d;
        });
        setFriendProfiles((prev) => ({ ...prev, ...profiles }));
        setProfilesLoaded(true);
      })
      .catch(() => {});
  }, [acceptedFriends]);

  const availableFriends = useMemo(() => {
    const selectedUids = new Set(selectedMembers.map((m) => m.uid));
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return acceptedFriends
      .map((f) => friendProfiles[f.friendUid])
      .filter(Boolean)
      .filter((profile) => !selectedUids.has(profile.uid))
      .filter((profile) => {
        if (!trimmedQuery) return true;
        const name = (profile.displayName ?? "").toLowerCase();
        const email = (profile.email ?? "").toLowerCase();
        return name.includes(trimmedQuery) || email.includes(trimmedQuery);
      });
  }, [acceptedFriends, friendProfiles, selectedMembers, searchQuery]);

  const handleAddMember = (profile) => {
    onMembersChange([...selectedMembers, profile]);
    setSearchQuery("");
  };

  const handleRemoveMember = (uid) => {
    onMembersChange(selectedMembers.filter((m) => m.uid !== uid));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search your friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
        />
      </div>

      {friendsLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
        </div>
      )}

      {!friendsLoading && acceptedFriends.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <ShieldAlert className="w-4 h-4 text-[var(--warning)] shrink-0" />
          <p className="text-xs text-[var(--text-muted)]">
            Add friends first on the Friends page before creating a group
          </p>
        </div>
      )}

      {availableFriends.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto p-1 rounded-xl border border-[var(--border-subtle)]">
          {availableFriends.map((profile) => (
            <button
              key={profile.uid}
              type="button"
              onClick={() => handleAddMember(profile)}
              className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-left"
            >
              <Avatar src={profile.photoURL} name={profile.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {profile.displayName ?? "Unknown"}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {profile.email ?? ""}
                </p>
              </div>
              <UserPlus className="w-4 h-4 text-[var(--accent)] shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Selected ({selectedMembers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <div
                key={member.uid}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-glow)] border border-[var(--accent)]/20"
              >
                <Avatar src={member.photoURL} name={member.displayName} size="xs" />
                <span className="text-xs font-medium text-[var(--accent)]">
                  {member.displayName ?? member.email ?? "Unknown"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.uid)}
                  className="p-0.5 rounded-full hover:bg-[var(--accent)]/10 transition-colors"
                >
                  <X className="w-3 h-3 text-[var(--accent)]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberSelector;
