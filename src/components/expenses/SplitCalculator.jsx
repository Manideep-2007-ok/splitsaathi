import clsx from "clsx";
import { formatCurrency } from "../../utils/formatters.js";
import { Percent, Hash, Equal } from "lucide-react";

const splitTypeOptions = [
  { value: "equal", label: "Equal", icon: Equal },
  { value: "percentage", label: "Percentage", icon: Percent },
  { value: "exact", label: "Exact", icon: Hash },
];

function SplitCalculator({
  totalAmount,
  members,
  memberDetails,
  currentUserUid,
  splitType,
  onSplitTypeChange,
  customSplits,
  onCustomSplitsChange,
  resolvedSplits,
  validationError,
}) {
  const memberList = members ?? [];

  const handleCustomSplitChange = (uid, rawValue) => {
    const numericValue = parseFloat(rawValue) || 0;
    onCustomSplitsChange({
      ...customSplits,
      [uid]: numericValue,
    });
  };

  const currentTotal = Object.values(customSplits ?? {}).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Split Type
        </label>
        <div className="flex gap-2">
          {splitTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSplitTypeChange(option.value);
                onCustomSplitsChange({});
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                splitType === option.value
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/30 text-[var(--accent-light)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              <option.icon className="w-3.5 h-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {totalAmount > 0 && memberList.length > 0 && (
        <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Split Breakdown
            </p>
            {splitType !== "equal" && (
              <p
                className={clsx(
                  "text-xs font-[JetBrains_Mono]",
                  validationError
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
                )}
              >
                {splitType === "percentage"
                  ? `${currentTotal.toFixed(1)}% / 100%`
                  : `${formatCurrency(currentTotal)} / ${formatCurrency(totalAmount)}`}
              </p>
            )}
          </div>

          {memberList.map((uid) => {
            const memberName =
              uid === currentUserUid
                ? "You"
                : memberDetails?.[uid]?.displayName ?? "Unknown";

            const resolvedShare = resolvedSplits?.[uid] ?? 0;

            return (
              <div
                key={uid}
                className="flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <p className="flex-1 text-sm text-[var(--text-primary)] truncate">
                  {memberName}
                </p>

                {splitType === "equal" && (
                  <p className="text-sm font-medium text-[var(--text-primary)] font-[JetBrains_Mono]">
                    {formatCurrency(resolvedShare)}
                  </p>
                )}

                {splitType === "percentage" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customSplits?.[uid] ?? ""}
                      onChange={(event) =>
                        handleCustomSplitChange(uid, event.target.value)
                      }
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-20 px-3 py-1.5 text-sm text-right rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-[JetBrains_Mono] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
                    />
                    <span className="text-xs text-[var(--text-muted)]">%</span>
                  </div>
                )}

                {splitType === "exact" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">₹</span>
                    <input
                      type="number"
                      value={customSplits?.[uid] ?? ""}
                      onChange={(event) =>
                        handleCustomSplitChange(uid, event.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-24 px-3 py-1.5 text-sm text-right rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-[JetBrains_Mono] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {validationError && (
            <p className="text-xs text-[var(--danger)] mt-2 font-medium">
              {validationError}
            </p>
          )}
        </div>
      )}

      {totalAmount <= 0 && (
        <p className="text-xs text-[var(--text-muted)] px-1">
          Enter an amount above to see the split breakdown
        </p>
      )}
    </div>
  );
}

export default SplitCalculator;
