import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getCategoryByValue } from "../../services/expenses.js";
import { formatCurrency, formatCompactCurrency } from "../../utils/formatters.js";

const CATEGORY_COLORS = [
  "#7C3AED",
  "#6366F1",
  "#8B5CF6",
  "#A78BFA",
  "#10B981",
  "#F59E0B",
  "#F43F5E",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#64748B",
];

function CategoryBreakdown({ expenses, className }) {
  const categoryData = useMemo(() => {
    const spendingByCategory = {};

    (expenses ?? []).forEach((expense) => {
      const categoryValue = expense?.category ?? "general";
      const amount = expense?.amount ?? 0;

      if (!spendingByCategory[categoryValue]) {
        const categoryInfo = getCategoryByValue(categoryValue);
        spendingByCategory[categoryValue] = {
          name: categoryInfo?.label ?? "General",
          emoji: categoryInfo?.emoji ?? "📦",
          value: 0,
          category: categoryValue,
        };
      }

      spendingByCategory[categoryValue].value += amount;
    });

    return Object.values(spendingByCategory)
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalSpend = categoryData.reduce((sum, entry) => sum + entry.value, 0);

  if (categoryData.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
          No category data yet
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const data = payload[0]?.payload;
    const percentage = totalSpend > 0
      ? ((data?.value / totalSpend) * 100).toFixed(1)
      : 0;

    return (
      <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-xl">
        <p className="text-xs text-[var(--text-muted)]">
          {data?.emoji} {data?.name}
        </p>
        <p className="text-sm font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
          {formatCurrency(data?.value ?? 0)}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">{percentage}%</p>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {categoryData.map((entry, index) => {
            const percentage =
              totalSpend > 0
                ? ((entry.value / totalSpend) * 100).toFixed(1)
                : 0;

            return (
              <div key={entry.category} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                  }}
                />
                <span className="text-sm text-[var(--text-primary)] flex-1 truncate">
                  {entry.emoji} {entry.name}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-[JetBrains_Mono]">
                  {percentage}%
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] font-[JetBrains_Mono] w-20 text-right">
                  {formatCompactCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdown;
