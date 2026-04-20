import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCompactCurrency } from "../../utils/formatters.js";

function SpendingBarChart({ expenses, className }) {
  const chartData = useMemo(() => {
    const spendingByMonth = {};

    (expenses ?? []).forEach((expense) => {
      const expenseDate = expense?.date
        ? new Date(expense.date)
        : expense?.createdAt?.toDate?.()
        ? expense.createdAt.toDate()
        : new Date();

      const monthKey = `${expenseDate.getFullYear()}-${String(
        expenseDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const monthLabel = expenseDate.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      if (!spendingByMonth[monthKey]) {
        spendingByMonth[monthKey] = { month: monthLabel, total: 0, key: monthKey };
      }

      spendingByMonth[monthKey].total += expense?.amount ?? 0;
    });

    return Object.values(spendingByMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
          No spending data yet
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-xl">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
          {formatCompactCurrency(payload[0]?.value ?? 0)}
        </p>
      </div>
    );
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border-subtle)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCompactCurrency(value)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-glow)" }} />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell
                key={entry.key}
                fill={
                  index === chartData.length - 1
                    ? "var(--accent)"
                    : "var(--accent-light)"
                }
                fillOpacity={index === chartData.length - 1 ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingBarChart;
