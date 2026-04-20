import clsx from "clsx";
import Avatar from "../common/Avatar.jsx";
import Badge from "../common/Badge.jsx";
import { formatCurrency, formatRelativeTime } from "../../utils/formatters.js";
import { getCategoryByValue } from "../../services/expenses.js";
import { Trash2 } from "lucide-react";

function ExpenseCard({ expense, memberDetails, currentUserUid, isGroupAdmin, onDelete, className }) {
  const title = expense?.title ?? "Untitled";
  const amount = expense?.amount ?? 0;
  const paidByUid = expense?.paidBy ?? "";
  const category = getCategoryByValue(expense?.category);
  const createdAt = expense?.createdAt;
  const splits = expense?.splits ?? {};
  const paidByMember = memberDetails?.[paidByUid];
  const paidByName = paidByMember?.displayName ?? "Someone";
  const isPaidByCurrentUser = paidByUid === currentUserUid;
  const currentUserSplit = splits?.[currentUserUid] ?? 0;

  const canDelete = expense?.paidBy === currentUserUid;

  return (
    <div className={clsx("rounded-2xl p-4 glass-card group", className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-lg shrink-0">
          {category?.emoji ?? "📦"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isPaidByCurrentUser ? "You" : paidByName} paid
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-money">{formatCurrency(amount)}</p>
              {currentUserSplit > 0 && !isPaidByCurrentUser && (
                <p className="text-[10px] text-[var(--danger)] font-money mt-0.5">you owe {formatCurrency(currentUserSplit)}</p>
              )}
              {isPaidByCurrentUser && (
                <p className="text-[10px] text-[var(--success)] font-money mt-0.5">you lent {formatCurrency(amount - currentUserSplit)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="default" size="sm">{category?.label ?? "General"}</Badge>
            <Badge variant="accent" size="sm">{expense?.splitType ?? "equal"}</Badge>
            {createdAt && <span className="text-[10px] text-[var(--text-muted)] ml-auto">{formatRelativeTime(createdAt)}</span>}
            {onDelete && canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense); }}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[#FF6392]/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;
