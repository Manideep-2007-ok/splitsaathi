import { useState, useContext, useRef, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useGroups } from "../../hooks/useGroups.js";
import { acceptGroupInvitation, rejectGroupInvitation } from "../../services/groups.js";
import { useToast } from "../../hooks/useToast.js";
import Button from "../common/Button.jsx";

function Navbar() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const { invitations } = useGroups(currentUser?.uid);
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pendingInvites = invitations?.filter(inv => inv.status === 'pending') || [];
  const hasInvites = pendingInvites.length > 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (invite) => {
    try {
      await acceptGroupInvitation(invite.id, invite.groupId, userProfile);
      toast.success("Joined group!");
      if (pendingInvites.length === 1) setDropdownOpen(false);
    } catch (err) {
      toast.danger("Failed to join group");
    }
  };

  const handleReject = async (invite) => {
    try {
      await rejectGroupInvitation(invite.id);
      toast.success("Invitation declined");
      if (pendingInvites.length === 1) setDropdownOpen(false);
    } catch (err) {
      toast.danger("Failed to decline invitation");
    }
  };

  return (
    <div className="flex items-center justify-end flex-1" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--bg-elevated)] transition-colors relative"
        >
          <Bell className="w-6 h-6" />
          {hasInvites && (
            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-[#FF6392] rounded-full animate-pulse border-2 border-[var(--bg-base)]"></span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#2A0A2F] rounded-2xl shadow-xl border border-[var(--border-subtle)] z-50 overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center">
              <h3 className="text-xl font-logo text-[#1F2937] dark:text-[#F9F9F9]">Notifications</h3>
              {hasInvites && (
                <span className="bg-[#FF6392] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingInvites.length}
                </span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {!hasInvites ? (
                <div className="p-6 text-center text-sm text-[#1F2937] dark:text-slate-400 font-medium">You&apos;re all caught up!</div>
              ) : (
                pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-3 mb-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9F9F9] mb-3">
                      You've been invited to join <span className="font-bold">{invite.groupName}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAccept(invite)} className="flex-1 bg-[#5AA9E6] text-[#1F2937] font-bold hover:brightness-110 border-none">
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" onClick={() => handleReject(invite)} className="flex-1 bg-[#FF6392] text-white font-bold hover:brightness-110 border-none">
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
