import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import { useExpenses } from "../hooks/useExpenses.js";
import { useBalances } from "../hooks/useBalances.js";
import { subscribeToGroup, deleteGroup } from "../services/groups.js";
import { deleteExpense } from "../services/expenses.js";
import { fetchUserDocument } from "../services/users.js";
import { formatCurrency } from "../utils/formatters.js";
import ExpenseCard from "../components/expenses/ExpenseCard.jsx";
import ExpenseForm from "../components/expenses/ExpenseForm.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import SettleModal from "../components/settlement/SettleModal.jsx";
import { Plus, ArrowLeft, Users, Receipt, ArrowRightLeft, Loader2, Trash2, AlertTriangle } from "lucide-react";

function GroupDetail() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [liveMemberDetails, setLiveMemberDetails] = useState({});
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("expenses");
  const [settleTransaction, setSettleTransaction] = useState(null);
  const { expenses, loading: expensesLoading } = useExpenses(groupId);
  const memberUids = group?.members ?? [];
  const { simplifiedTransactions, netBalances, totalGroupSpend, hasDebts, loading: balancesLoading } = useBalances(groupId, memberUids);

  useEffect(() => {
    if (!groupId) return;
    setGroupLoading(true);
    const unsubscribe = subscribeToGroup(groupId, (data) => { setGroup(data); setGroupLoading(false); }, (err) => { toast.danger(err ?? "Failed to load group"); setGroupLoading(false); });
    return unsubscribe;
  }, [groupId]);

  useEffect(() => {
    if (memberUids.length === 0) return;

    const newUids = memberUids.filter((uid) => !liveMemberDetails[uid]);
    if (newUids.length === 0) return;

    Promise.all(newUids.map((uid) => fetchUserDocument(uid)))
      .then((docs) => {
        const updated = {};
        docs.forEach((d) => {
          if (d) updated[d.uid] = d;
        });
        setLiveMemberDetails((prev) => ({ ...prev, ...updated }));
      })
      .catch((err) => console.error("Failed to fetch member profiles:", err));
  }, [JSON.stringify(memberUids)]);

  const memberDetails = { ...(group?.memberDetails ?? {}), ...liveMemberDetails };

  const handleDeleteExpense = async (expense) => {
    try { await deleteExpense(groupId, expense.id, expense.amount, currentUser?.uid); toast.success("Expense deleted"); }
    catch (error) { toast.danger(error?.message ?? "Failed to delete expense"); }
  };

  const handleDeleteGroup = async () => {
    setIsDeletingGroup(true);
    try {
      await deleteGroup(groupId);
      toast.success("Group deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.danger(error?.message ?? "Failed to delete group");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  if (groupLoading) return <div className="space-y-6"><SkeletonCard rows={2} /><SkeletonCard rows={4} /></div>;
  if (!group) return <div className="text-center py-20"><p className="text-[var(--text-muted)]">Group not found</p><Button variant="ghost" onClick={() => navigate("/dashboard")} className="mt-4">Back to Dashboard</Button></div>;

  const tabs = [
    { key: "expenses", label: "Expenses", icon: Receipt, count: expenses?.length ?? 0 },
    { key: "balances", label: "Balances", icon: ArrowRightLeft, count: simplifiedTransactions?.length ?? 0 },
    { key: "members", label: "Members", icon: Users, count: memberUids.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] dark:text-slate-100 truncate">{group?.name ?? "Group"}</h1>
          {group?.description && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{group.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {group?.createdBy === currentUser?.uid && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-[var(--danger)] transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <Button onClick={() => setIsExpenseModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="md">
            <span className="hidden sm:inline">Add Expense</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Spent", value: formatCurrency(totalGroupSpend), mono: true },
          { label: "Expenses", value: expenses?.length ?? 0 },
          { label: "Members", value: memberUids.length },
          { label: "Debts", value: hasDebts ? simplifiedTransactions.length : "Settled ✓", color: hasDebts ? "text-[var(--warning)]" : "text-[var(--success)]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 glass-card">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color ?? "text-[#1F2937] dark:text-slate-100"} ${s.mono ? "font-money" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-xl glass-card">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.key ? "bg-[var(--accent-glow)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "expenses" && (
        <div className="space-y-3">
          {expensesLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>}
          {!expensesLoading && (expenses?.length ?? 0) === 0 && (
            <div className="text-center py-12"><Receipt className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--text-muted)] mb-4">No expenses yet</p>
              <Button onClick={() => setIsExpenseModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="sm">Add First Expense</Button></div>
          )}
          {!expensesLoading && expenses?.map((e) => (<ExpenseCard key={e.id} expense={e} memberDetails={memberDetails} currentUserUid={currentUser?.uid} isGroupAdmin={group?.createdBy === currentUser?.uid} onDelete={handleDeleteExpense} />))}
        </div>
      )}

      {activeTab === "balances" && (
        <div className="space-y-3">
          {balancesLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>}
          {!balancesLoading && !hasDebts && (
            <div className="text-center py-12"><div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3"><ArrowRightLeft className="w-7 h-7 text-[var(--success)]" /></div>
              <p className="text-sm font-medium text-[var(--success)]">All settled up! 🎉</p></div>
          )}
          {!balancesLoading && simplifiedTransactions?.map((t, i) => {
            const fromName = memberDetails?.[t.from]?.displayName ?? "Someone";
            const toName = memberDetails?.[t.to]?.displayName ?? "Someone";
            const isFrom = t.from === currentUser?.uid;
            const isTo = t.to === currentUser?.uid;
            return (
              <div key={`${t.from}-${t.to}-${i}`} className="flex items-center gap-3 p-4 rounded-2xl glass-card">
                <Avatar src={memberDetails?.[t.from]?.photoURL} name={fromName} size="sm" />
                <div className="flex-1 min-w-0"><p className="text-sm !text-[#1F2937] dark:!text-slate-100">
                  <span className={`font-medium ${isFrom ? "text-[var(--danger)]" : ""}`}>{isFrom ? "You" : fromName}</span>{isFrom ? " owe " : " owes "}
                  <span className={`font-medium ${isTo ? "text-[var(--success)]" : ""}`}>{isTo ? "you" : toName}</span></p></div>
                <p className="font-money font-bold !text-[#1F2937] dark:!text-slate-200 shrink-0">{formatCurrency(t.amount)}</p>
                {isFrom && <Button size="sm" onClick={() => setSettleTransaction(t)} className="bg-sky-500 !text-white font-bold border-none hover:brightness-110">Pay Now</Button>}
                {isTo && <Badge variant="accent" size="sm">Waiting for Payment</Badge>}
              </div>
            );
          })}
          {!balancesLoading && hasDebts && (
            <div className="mt-4 p-4 rounded-xl glass-card">
              <p className="text-xs font-medium !text-slate-500 dark:!text-slate-400 uppercase tracking-wider mb-3">Net Balances</p>
              <div className="space-y-2">
                {Object.entries(netBalances ?? {}).map(([uid, bal]) => (
                  <div key={uid} className="flex items-center justify-between">
                    <span className="text-sm !text-[#1F2937] dark:!text-slate-300">{uid === currentUser?.uid ? "You" : memberDetails?.[uid]?.displayName ?? "Unknown"}</span>
                    <span className={`text-sm font-medium font-money ${bal > 0 ? "text-[var(--success)]" : bal < 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>{bal > 0 ? "+" : ""}{formatCurrency(bal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-2">
          {memberUids.map((uid) => {
            const m = memberDetails?.[uid] ?? {};
            return (
              <div key={uid} className="flex items-center gap-3 p-4 rounded-2xl glass-card">
                <Avatar src={m?.photoURL} name={m?.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1F2937] dark:text-slate-100 truncate">{m?.displayName ?? "Unknown"}{uid === currentUser?.uid && <span className="text-[var(--text-muted)]"> (you)</span>}</p>
                    {uid === group?.createdBy && <Badge variant="accent" size="sm">Admin</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{m?.email ?? ""}</p>
                </div>
                {m?.upiId && <Badge variant="success" size="sm" dot>UPI</Badge>}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Expense" size="lg">
        <ExpenseForm groupId={groupId} members={memberUids} memberDetails={memberDetails} onSuccess={() => setIsExpenseModalOpen(false)} onCancel={() => setIsExpenseModalOpen(false)} />
      </Modal>
      <SettleModal isOpen={!!settleTransaction} onClose={() => setSettleTransaction(null)} groupId={groupId} groupName={group?.name} transaction={settleTransaction} memberDetails={memberDetails} />

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Group" size="md">
        <div className="p-4 sm:p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-slate-100">Are you sure?</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              This will permanently delete <span className="font-semibold text-[#1F2937] dark:text-slate-100">{group?.name}</span>, all its expenses, and settlement data. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)} 
              fullWidth
              className="px-4 py-2 text-[#1F2937] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteGroup} isLoading={isDeletingGroup} className="bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white" fullWidth>
              Yes, Delete Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GroupDetail;
