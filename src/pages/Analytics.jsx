import { useState, useContext, useMemo, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { useExpenses } from "../hooks/useExpenses.js";
import { formatCurrency } from "../utils/formatters.js";
import SpendingBarChart from "../components/charts/SpendingBarChart.jsx";
import CategoryBreakdown from "../components/charts/CategoryBreakdown.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import Badge from "../components/common/Badge.jsx";
import { BarChart3, PieChart, ChevronDown, TrendingUp } from "lucide-react";

function GroupExpensesLoader({ groupId, onExpensesLoaded }) {
  const { expenses } = useExpenses(groupId);

  useEffect(() => {
    onExpensesLoaded(groupId, expenses);
  }, [groupId, expenses, onExpensesLoaded]);

  return null;
}

function Analytics() {
  const { currentUser } = useContext(AuthContext);
  const { groups, loading: groupsLoading } = useGroups(currentUser?.uid);
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [expensesByGroup, setExpensesByGroup] = useState({});

  const handleExpensesLoaded = useCallback((groupId, expenses) => {
    setExpensesByGroup((prev) => {
      if (prev[groupId] === expenses) return prev;
      return { ...prev, [groupId]: expenses };
    });
  }, []);

  const allExpenses = useMemo(() => {
    if (selectedGroupId === "all") return Object.values(expensesByGroup).flat();
    return expensesByGroup[selectedGroupId] ?? [];
  }, [expensesByGroup, selectedGroupId]);

  const totalSpent = useMemo(() => allExpenses.reduce((s, e) => s + (e?.amount ?? 0), 0), [allExpenses]);
  const averageExpense = useMemo(() => (allExpenses.length > 0 ? totalSpent / allExpenses.length : 0), [allExpenses, totalSpent]);
  const highestExpense = useMemo(() => allExpenses.reduce((m, e) => Math.max(m, e?.amount ?? 0), 0), [allExpenses]);

  return (
    <div className="space-y-8">
      {(groups ?? []).map((group) => (
        <GroupExpensesLoader key={group.id} groupId={group.id} onExpensesLoaded={handleExpensesLoaded} />
      ))}

      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-[Syne] tracking-tight">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Insights into your spending patterns</p>
        </div>
        <div className="relative">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl bg-[#18181B]/80 backdrop-blur-md border border-white/5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all cursor-pointer"
          >
            <option value="all">All Groups</option>
            {(groups ?? []).map((g) => (<option key={g.id} value={g.id}>{g?.name ?? "Group"}</option>))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {groupsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (<SkeletonCard key={i} rows={1} />))}
        </div>
      )}

      {!groupsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Spent", value: formatCurrency(totalSpent), sub: `${allExpenses.length} expenses`, icon: TrendingUp, color: "from-[var(--accent)] to-[#6366F1]" },
            { label: "Average", value: formatCurrency(averageExpense), sub: "per expense", icon: BarChart3, color: "from-emerald-500 to-teal-500" },
            { label: "Highest", value: formatCurrency(highestExpense), sub: "single expense", icon: PieChart, color: "from-amber-500 to-orange-500" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl p-5 glass-card relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.06] rounded-full -translate-y-6 translate-x-6`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className="w-4 h-4 text-[var(--accent-light)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">{card.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 glass-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-[Syne]">Monthly Spending</h2>
            <Badge variant="accent" size="sm"><BarChart3 className="w-3 h-3" />Trend</Badge>
          </div>
          <SpendingBarChart expenses={allExpenses} />
        </div>
        <div className="rounded-2xl p-6 glass-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-[Syne]">By Category</h2>
            <Badge variant="accent" size="sm"><PieChart className="w-3 h-3" />Breakdown</Badge>
          </div>
          <CategoryBreakdown expenses={allExpenses} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
