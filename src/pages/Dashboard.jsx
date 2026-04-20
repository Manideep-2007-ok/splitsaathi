import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { acceptGroupInvitation, rejectGroupInvitation } from "../services/groups.js";
import { useToast } from "../hooks/useToast.js";
import { getFirstName, formatCurrency } from "../utils/formatters.js";
import GroupCard from "../components/groups/GroupCard.jsx";
import GroupForm from "../components/groups/GroupForm.jsx";
import Modal from "../components/common/Modal.jsx";
import Button from "../components/common/Button.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import { Plus, Users, Wallet, TrendingUp, Check, X, Clock } from "lucide-react";

function Dashboard() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const toast = useToast();
  const { groups, invitations, loading, error } = useGroups(currentUser?.uid);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const firstName = getFirstName(userProfile?.displayName);
  const totalGroups = groups?.length ?? 0;
  const totalSpent = (groups ?? []).reduce((s, g) => s + (g?.totalExpenses ?? 0), 0);
  const totalMembers = new Set((groups ?? []).flatMap((g) => g?.members ?? [])).size;

  const handleAcceptInvite = async (invite) => {
    try {
      await acceptGroupInvitation(invite.id, invite.groupId, userProfile);
      toast.success("Joined group!");
    } catch (err) {
      toast.danger("Failed to join group");
    }
  };

  const handleRejectInvite = async (invite) => {
    try {
      await rejectGroupInvitation(invite.id);
      toast.success("Invitation rejected");
    } catch (err) {
      toast.danger("Failed to reject invitation");
    }
  };

  const summaryCards = [
    { label: "Total Groups", value: totalGroups, icon: Users, color: "from-[var(--accent)] to-[var(--accent-light)]" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: Wallet, color: "from-emerald-400 to-teal-400", isMoney: true },
    { label: "People", value: totalMembers, icon: TrendingUp, color: "from-amber-400 to-orange-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-logo text-[var(--accent)] tracking-tight">
            Hey, {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Here&apos;s what&apos;s happening with your groups</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="md">
          <span className="hidden sm:inline">New Group</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {invitations?.length > 0 && (
        <div className="bg-[var(--bg-elevated)] p-6 rounded-2xl border border-[var(--border-subtle)]">
          <h2 className="text-2xl font-logo text-slate-900 dark:text-slate-100 mb-4 tracking-wide">Invitations</h2>
          <div className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{invite.groupName}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-[#FFE45E]" />
                    <span className="text-xs font-semibold text-[#FFE45E]">Pending</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptInvite(invite)} className="bg-[#5AA9E6] text-slate-900 font-bold hover:brightness-110">
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" onClick={() => handleRejectInvite(invite)} className="bg-[#FF6392] text-white font-bold hover:brightness-110">
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl p-5 glass-card">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.08] rounded-full -translate-y-6 translate-x-6`} />
            <div className="relative">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-xl font-bold text-slate-900 dark:text-slate-100 ${card.isMoney ? "font-money" : ""}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Groups</h2>
          {totalGroups > 0 && <span className="text-xs text-[var(--text-muted)]">{totalGroups} {totalGroups === 1 ? "group" : "groups"}</span>}
        </div>

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => (<SkeletonCard key={i} />))}</div>}
        {!loading && error && <div className="text-center py-12"><p className="text-sm text-[var(--danger)]">{error}</p></div>}
        {!loading && !error && totalGroups === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-[var(--text-muted)]" /></div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">No groups yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs mx-auto">Create your first group to start splitting expenses with friends</p>
            <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>Create Your First Group</Button>
          </div>
        )}
        {!loading && !error && totalGroups > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{groups.map((group) => (<GroupCard key={group.id} group={group} />))}</div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Group" size="lg">
        <GroupForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default Dashboard;
