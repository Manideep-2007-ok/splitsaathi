import clsx from "clsx";

function SkeletonCard({ rows = 3, className }) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 animate-pulse",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-lg bg-[var(--bg-elevated)]" />
          <div className="h-3 w-1/3 rounded-lg bg-[var(--bg-elevated)]" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded-lg bg-[var(--bg-elevated)]"
            style={{ width: `${85 - index * 15}%` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-subtle)]">
        <div className="h-3 w-20 rounded-lg bg-[var(--bg-elevated)]" />
        <div className="h-8 w-24 rounded-lg bg-[var(--bg-elevated)]" />
      </div>
    </div>
  );
}

function SkeletonLine({ width = "100%", height = "h-4", className }) {
  return (
    <div
      className={clsx(
        "rounded-lg bg-[var(--bg-elevated)] animate-pulse",
        height,
        className
      )}
      style={{ width }}
    />
  );
}

function SkeletonAvatar({ size = "md", className }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={clsx(
        "rounded-full bg-[var(--bg-elevated)] animate-pulse",
        sizeMap[size] ?? sizeMap.md,
        className
      )}
    />
  );
}

export default SkeletonCard;
export { SkeletonLine, SkeletonAvatar };
