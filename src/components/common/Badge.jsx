import clsx from "clsx";

const variantStyles = {
  default:
    "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
  accent:
    "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/20",
  success:
    "bg-emerald-500/10 text-[var(--success)] border-emerald-500/20",
  danger:
    "bg-rose-500/10 text-[var(--danger)] border-rose-500/20",
  warning:
    "bg-amber-500/10 text-[var(--warning)] border-amber-500/20",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className,
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap",
        variantStyles[variant] ?? variantStyles.default,
        sizeStyles[size] ?? sizeStyles.md,
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full", {
            "bg-[var(--text-secondary)]": variant === "default",
            "bg-[var(--accent)]": variant === "accent",
            "bg-[var(--success)]": variant === "success",
            "bg-[var(--danger)]": variant === "danger",
            "bg-[var(--warning)]": variant === "warning",
          })}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
