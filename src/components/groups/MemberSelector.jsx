import { useState } from "react";
import clsx from "clsx";
import { useToast } from "../../hooks/useToast.js";
import { searchUsers } from "../../services/users.js";
import Avatar from "../common/Avatar.jsx";
import { Search, X, UserPlus, Loader2 } from "lucide-react";

function MemberSelector({ selectedMembers, onMembersChange, currentUserUid }) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (value) => {
    setSearchQuery(value);
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const users = await searchUsers(trimmed);
      const filtered = users.filter(
        (user) =>
          user.uid !== currentUserUid &&
          !selectedMembers.some((m) => m.uid === user.uid)
      );
      setSearchResults(filtered);
      setHasSearched(true);
    } catch (error) {
      toast.danger(error?.message ?? "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = (user) => {
    onMembersChange([...selectedMembers, user]);
    setSearchResults((prev) => prev.filter((r) => r.uid !== user.uid));
    setSearchQuery("");
    setHasSearched(false);
  };

  const handleRemoveMember = (uid) => {
    onMembersChange(selectedMembers.filter((m) => m.uid !== uid));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent)] animate-spin" />
        )}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
        />
      </div>

      {hasSearched && searchResults.length === 0 && !isSearching && (
        <p className="text-xs text-[var(--text-muted)] px-1">
          No users found. They need to sign up on SplitSaathi first.
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-1 p-2 rounded-xl glass-card max-h-48 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user.uid}
              type="button"
              onClick={() => handleAddMember(user)}
              className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.displayName ?? "Unknown"}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <UserPlus className="w-4 h-4 text-[var(--accent-light)] shrink-0" />
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
                <Avatar src={member?.photoURL} name={member?.displayName} size="xs" />
                <span className="text-xs font-medium text-[var(--accent-light)]">
                  {member?.displayName ?? member?.email ?? "Unknown"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.uid)}
                  className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-[var(--accent-light)]" />
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
