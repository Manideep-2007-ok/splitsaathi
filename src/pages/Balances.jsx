import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { useBalances } from "../hooks/useBalances.js";
import { fetchUserDocument } from "../services/users.js";
import { formatCurrency } from "../utils/formatters.js";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Badge from "../components/common/Badge.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import SettleModal from "../components/settlement/SettleModal.jsx";
import { ArrowRight, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { useState as useStateAlias, useEffect } from "react";

function GroupBalanceSection({ group, currentUser }) {
  const memberUids = group?.members ?? [];
  const [liveMemberDetails, setLiveMemberDetails] = useStateAlias({});
  const [settleTransaction, setSettleTransaction] = useState(null);
  const { simplifiedTransactions, hasDebts, loading } = useBalances(group?.id, memberUids);

  useEffect(() => {
    if (memberUids.length === 0) return;
    const toFetch = memberUids.filter((uid) => !liveMemberDetails[uid]);
    if (toFetch.length === 0) return;
    Promise.all(toFetch.map((uid) => fetchUserDocument(uid)))
      .then((docs) => {
        const profiles = {};
        docs.forEach((d) => { if (d) profiles[d.uid] = d; });
        setLiveMemberDetails((prev) => ({ ...prev, ...profiles }));
      })
      .catch(() => {});
  }, [JSON.stringify(memberUids)]);

  const memberDetails = { ...(group?.memberDetails ?? {}), ...liveMemberDetails };

  if (loading) return <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" /></div>;

  if (!hasDebts) return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200">
      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /><p className="text-sm text-[var(--success)] font-medium">All settled up!</p>
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
            <div key={`${t.from}-${t.to}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-light)] transition-all duration-300">
              <Avatar src={memberDetails?.[t.from]?.photoURL} name={fromName} size="xs" />
              <div className="flex-1 min-w-0"><p className="text-xs text-[var(--text-secondary)]">
                <span className={`font-medium ${isFrom ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>{isFrom ? "You" : fromName}</span>
                <ArrowRight className="w-3 h-3 inline mx-1 text-[var(--text-muted)]" />
                <span className={`font-medium ${isTo ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>{isTo ? "You" : toName}</span></p></div>
              <p className="text-xs font-bold text-[var(--text-primary)] font-money shrink-0">{formatCurrency(t.amount)}</p>
              {isFrom && <Button size="sm" variant="primary" onClick={() => setSettleTransaction(t)}>Settle</Button>}
              {isTo && <Badge variant="accent" size="sm">Waiting for Payment</Badge>}
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Balances</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Simplified debts across all your groups</p>
      </div>

      {groupsLoading && <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => (<SkeletonCard key={i} rows={3} />))}</div>}

      {!groupsLoading && groupsWithMembers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4"><Wallet className="w-8 h-8 text-[var(--text-muted)]" /></div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">No balances to show</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Create a group and add expenses to see your balances here</p>
        </div>
      )}

      {!groupsLoading && groupsWithMembers.map((group) => (
        <div key={group.id} className="rounded-2xl overflow-hidden glass-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white text-sm font-bold">
                {(group?.name ?? "G").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{group?.name ?? "Group"}</h3>
                <p className="text-[10px] text-[var(--text-muted)]">{group?.members?.length ?? 0} members</p>
              </div>
            </div>
            <Badge variant="default" size="sm"><span className="font-money">{formatCurrency(group?.totalExpenses ?? 0)}</span></Badge>
          </div>
          <div className="p-4"><GroupBalanceSection group={group} currentUser={currentUser} /></div>
        </div>
      ))}
    </div>
  );
}

export default Balances;
