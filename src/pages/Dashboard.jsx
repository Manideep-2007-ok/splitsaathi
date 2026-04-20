import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { getFirstName, formatCurrency } from "../utils/formatters.js";
import GroupCard from "../components/groups/GroupCard.jsx";
import GroupForm from "../components/groups/GroupForm.jsx";
import Modal from "../components/common/Modal.jsx";
import Button from "../components/common/Button.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import { Plus, Users, Wallet, TrendingUp } from "lucide-react";

function Dashboard() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const { groups, loading, error } = useGroups(currentUser?.uid);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const firstName = getFirstName(userProfile?.displayName);
  const totalGroups = groups?.length ?? 0;
  const totalSpent = (groups ?? []).reduce((s, g) => s + (g?.totalExpenses ?? 0), 0);
  const totalMembers = new Set((groups ?? []).flatMap((g) => g?.members ?? [])).size;

  const summaryCards = [
    { label: "Total Groups", value: totalGroups, icon: Users, color: "from-[var(--accent)] to-[#6366F1]" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: Wallet, color: "from-emerald-500 to-teal-500", isMoney: true },
    { label: "People", value: totalMembers, icon: TrendingUp, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-[Syne] tracking-tight">
            Hey, {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Here&apos;s what&apos;s happening with your groups</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="md">
          <span className="hidden sm:inline">New Group</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl p-5 glass-card">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.06] rounded-full -translate-y-6 translate-x-6`} />
            <div className="relative">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-xl font-bold text-[var(--text-primary)] ${card.isMoney ? "font-[JetBrains_Mono]" : "font-[Syne]"}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-[Syne]">Your Groups</h2>
          {totalGroups > 0 && <span className="text-xs text-[var(--text-muted)]">{totalGroups} {totalGroups === 1 ? "group" : "groups"}</span>}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        )}

        {!loading && error && <div className="text-center py-12"><p className="text-sm text-[var(--danger)]">{error}</p></div>}

        {!loading && !error && totalGroups === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] font-[Syne] mb-2">No groups yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs mx-auto">Create your first group to start splitting expenses with friends</p>
            <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>Create Your First Group</Button>
          </div>
        )}

        {!loading && !error && totalGroups > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (<GroupCard key={group.id} group={group} />))}
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Group" size="lg">
        <GroupForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default Dashboard;
