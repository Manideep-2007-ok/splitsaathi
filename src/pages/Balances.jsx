import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { useBalances } from "../hooks/useBalances.js";
import { formatCurrency } from "../utils/formatters.js";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Badge from "../components/common/Badge.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import SettleModal from "../components/settlement/SettleModal.jsx";
import { ArrowRight, Wallet, CheckCircle2, Loader2 } from "lucide-react";

function GroupBalanceSection({ group, currentUser }) {
  const memberUids = group?.members ?? [];
  const memberDetails = group?.memberDetails ?? {};
  const [settleTransaction, setSettleTransaction] = useState(null);
  const { simplifiedTransactions, hasDebts, loading } = useBalances(group?.id, memberUids);

  if (loading) return <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" /></div>;

  if (!hasDebts) return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /><p className="text-sm text-[var(--success)]">All settled up!</p>
    </div>
  );

  return (
    <>
      <div className="space-y-2">
        {simplifiedTransactions.map((t, i) => {
          const fromName = memberDetails?.[t.from]?.displayName ?? "Someone";
          const toName = memberDetails?.[t.to]?.displayName ?? "Someone";
          const isFrom = t.from === currentUser?.uid;
          const isTo = t.to === currentUser?.uid;
          return (
            <div key={`${t.from}-${t.to}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all duration-300">
              <Avatar src={memberDetails?.[t.from]?.photoURL} name={fromName} size="xs" />
              <div className="flex-1 min-w-0"><p className="text-xs text-[var(--text-secondary)]">
                <span className={`font-medium ${isFrom ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>{isFrom ? "You" : fromName}</span>
                <ArrowRight className="w-3 h-3 inline mx-1 text-[var(--text-muted)]" />
                <span className={`font-medium ${isTo ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>{isTo ? "You" : toName}</span></p></div>
              <p className="text-xs font-bold text-[var(--text-primary)] font-[JetBrains_Mono] shrink-0">{formatCurrency(t.amount)}</p>
              {(isFrom || isTo) && <Button size="sm" variant={isFrom ? "primary" : "outline"} onClick={() => setSettleTransaction(t)}>Settle</Button>}
            </div>
          );
        })}
      </div>
      <SettleModal isOpen={!!settleTransaction} onClose={() => setSettleTransaction(null)} groupId={group?.id} groupName={group?.name} transaction={settleTransaction} memberDetails={memberDetails} />
    </>
  );
}

function Balances() {
  const { currentUser } = useContext(AuthContext);
  const { groups, loading: groupsLoading } = useGroups(currentUser?.uid);
  const groupsWithMembers = (groups ?? []).filter((g) => (g?.members?.length ?? 0) > 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-[Syne] tracking-tight">Balances</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Simplified debts across all your groups</p>
      </div>

      {groupsLoading && <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => (<SkeletonCard key={i} rows={3} />))}</div>}

      {!groupsLoading && groupsWithMembers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4"><Wallet className="w-8 h-8 text-[var(--text-muted)]" /></div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] font-[Syne] mb-2">No balances to show</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Create a group and add expenses to see your balances here</p>
        </div>
      )}

      {!groupsLoading && groupsWithMembers.map((group) => (
        <div key={group.id} className="rounded-2xl overflow-hidden glass-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#6366F1] flex items-center justify-center text-white text-sm font-bold font-[Syne]">
                {(group?.name ?? "G").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-[Syne]">{group?.name ?? "Group"}</h3>
                <p className="text-[10px] text-[var(--text-muted)]">{group?.members?.length ?? 0} members</p>
              </div>
            </div>
            <Badge variant="default" size="sm">{formatCurrency(group?.totalExpenses ?? 0)}</Badge>
          </div>
          <div className="p-4"><GroupBalanceSection group={group} currentUser={currentUser} /></div>
        </div>
      ))}
    </div>
  );
}

export default Balances;
