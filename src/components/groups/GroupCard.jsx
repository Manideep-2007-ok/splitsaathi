import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import Avatar from "../common/Avatar.jsx";
import Badge from "../common/Badge.jsx";
import { formatCurrency, formatRelativeTime, formatMemberCount } from "../../utils/formatters.js";
import { Users, ArrowRight } from "lucide-react";

function GroupCard({ group, className }) {
  const navigate = useNavigate();

  const groupName = group?.name ?? "Untitled Group";
  const memberCount = group?.members?.length ?? 0;
  const totalExpenses = group?.totalExpenses ?? 0;
  const updatedAt = group?.updatedAt;
  const memberDetails = group?.memberDetails ?? {};
  const displayedMembers = Object.values(memberDetails).slice(0, 4);
  const remainingMemberCount = Math.max(0, memberCount - 4);

  return (
    <button
      onClick={() => navigate(`/group/${group?.id}`)}
      className={clsx(
        "w-full text-left rounded-2xl p-5 glass-card group",
        "hover:shadow-lg hover:shadow-[var(--accent-glow)] hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[var(--accent)] transition-colors">
            {groupName}
          </h3>
          {group?.description && (
            <p className="mt-1 text-xs text-[var(--text-muted)] truncate">{group.description}</p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {displayedMembers.map((member, index) => (
            <Avatar key={member?.email ?? index} src={member?.photoURL} name={member?.displayName} size="xs" />
          ))}
          {remainingMemberCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] border-2 border-white flex items-center justify-center text-[9px] font-medium text-[var(--text-muted)]">
              +{remainingMemberCount}
            </div>
          )}
        </div>
        <Badge variant="default" size="sm"><Users className="w-3 h-3" />{formatMemberCount(memberCount)}</Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Total Spent</p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-money">{formatCurrency(totalExpenses)}</p>
        </div>
        {updatedAt && <p className="text-[10px] text-[var(--text-muted)]">{formatRelativeTime(updatedAt)}</p>}
      </div>
    </button>
  );
}

export default GroupCard;
