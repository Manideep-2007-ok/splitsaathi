import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useFriends } from "../hooks/useFriends.js";
import { useToast } from "../hooks/useToast.js";
import { searchUsers, fetchUserDocument } from "../services/users.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../services/friendships.js";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Badge from "../components/common/Badge.jsx";
import Input from "../components/common/Input.jsx";
import {
  Search,
  UserPlus,
  Check,
  X,
  UserMinus,
  Clock,
  Users,
  Loader2,
  Mail,
} from "lucide-react";

function Friends() {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();
  const {
    acceptedFriends,
    acceptedFriendUids,
    pendingReceived,
    pendingSent,
    loading,
  } = useFriends(currentUser?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendProfiles, setFriendProfiles] = useState({});

  useEffect(() => {
    const uids = [
      ...acceptedFriends.map((f) => f.friendUid),
      ...pendingReceived.map((f) => f.senderId),
      ...pendingSent.map((f) => f.receiverId),
    ];

    const unique = [...new Set(uids)].filter((uid) => !friendProfiles[uid]);
    if (unique.length === 0) return;

    Promise.all(unique.map((uid) => fetchUserDocument(uid))).then((docs) => {
      const newProfiles = {};
      docs.forEach((d) => {
        if (d) newProfiles[d.uid] = d;
      });
      setFriendProfiles((prev) => ({ ...prev, ...newProfiles }));
    });
  }, [acceptedFriends, pendingReceived, pendingSent]);

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await searchUsers(value.trim());
      setSearchResults(
        users.filter((u) => u.uid !== currentUser?.uid)
      );
    } catch (err) {
      toast.danger(err?.message ?? "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (receiverUid) => {
    try {
      await sendFriendRequest(currentUser.uid, receiverUid);
      toast.success("Friend request sent!");
      setSearchResults((prev) => prev.filter((u) => u.uid !== receiverUid));
    } catch (err) {
      toast.danger(err?.message ?? "Failed to send request");
    }
  };

  const handleAccept = async (friendshipId) => {
    try {
      await acceptFriendRequest(friendshipId);
      toast.success("Friend request accepted!");
    } catch (err) {
      toast.danger(err?.message ?? "Failed to accept");
    }
  };

  const handleDecline = async (friendshipId) => {
    try {
      await declineFriendRequest(friendshipId);
      toast.success("Request declined");
    } catch (err) {
      toast.danger(err?.message ?? "Failed to decline");
    }
  };

  const handleRemove = async (friendshipId) => {
    try {
      await removeFriend(friendshipId);
      toast.success("Friend removed");
    } catch (err) {
      toast.danger(err?.message ?? "Failed to remove");
    }
  };

  const getRequestStatus = (uid) => {
    if (acceptedFriendUids.has(uid)) return "accepted";
    if (pendingSent.some((f) => f.receiverId === uid)) return "pending-sent";
    if (pendingReceived.some((f) => f.senderId === uid)) return "pending-received";
    return "none";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Friends
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Find people and manage your connections
        </p>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Search by name or email
          </h3>
        </div>
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

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((user) => {
              const status = getRequestStatus(user.uid);
              return (
                <div
                  key={user.uid}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user.displayName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  {status === "accepted" && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Friends</span>
                    </div>
                  )}
                  {(status === "pending-sent" || status === "pending-received") && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{status === "pending-sent" ? "Requested" : "Pending"}</span>
                    </div>
                  )}
                  {status === "none" && (
                    <Button size="sm" onClick={() => handleSendRequest(user.uid)} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                      Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingReceived.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[var(--warning)]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pending Requests ({pendingReceived.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pendingReceived.map((req) => {
              const sender = friendProfiles[req.senderId] ?? {};
              return (
                <div key={req.id} className="flex items-center gap-3 p-4 glass-card">
                  <Avatar src={sender.photoURL} name={sender.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {sender.displayName ?? "Someone"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{sender.email ?? ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(req.id)} leftIcon={<Check className="w-3.5 h-3.5" />}>
                      Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDecline(req.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Your Friends ({acceptedFriends.length})
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
          </div>
        )}

        {!loading && acceptedFriends.length === 0 && (
          <div className="text-center py-12 glass-card">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)] mb-1">No friends yet</p>
            <p className="text-xs text-[var(--text-muted)]">Search for people above to start connecting</p>
          </div>
        )}

        {!loading && acceptedFriends.length > 0 && (
          <div className="space-y-2">
            {acceptedFriends.map((friend) => {
              const profile = friendProfiles[friend.friendUid] ?? {};
              return (
                <div key={friend.friendshipId} className="flex items-center gap-3 p-4 glass-card">
                  <Avatar src={profile.photoURL} name={profile.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {profile.displayName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{profile.email ?? ""}</p>
                  </div>
                  {profile.upiId && <Badge variant="success" size="sm" dot>UPI</Badge>}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(friend.friendshipId)}
                    className="text-[var(--danger)] hover:bg-[#FF6392]/10"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
