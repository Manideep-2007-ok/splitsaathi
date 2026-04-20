import { forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-[var(--accent)] hover:brightness-110 text-white shadow-lg shadow-[var(--accent-glow)]",
  secondary:
    "bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]",
  danger:
    "bg-[var(--danger)] hover:brightness-110 text-white",
  ghost:
    "bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
  outline:
    "bg-transparent border border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    ...restProps
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]",
        variantStyles[variant] ?? variantStyles.primary,
        sizeStyles[size] ?? sizeStyles.md,
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...restProps}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

export default Button;
