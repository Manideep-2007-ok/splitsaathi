import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    variant = "input",
    className,
    containerClassName,
    id,
    ...restProps
  },
  ref
) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;

  const sharedClasses = clsx(
    "w-full rounded-xl bg-[var(--bg-elevated)] border !text-[#1F2937] dark:!text-slate-100 placeholder:text-[var(--text-muted)] transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
    error
      ? "border-[var(--danger)] focus:ring-[var(--danger)]"
      : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]",
    leftIcon ? "pl-10" : "pl-4",
    rightIcon ? "pr-10" : "pr-4",
    "py-2.5 text-sm",
    className
  );

  return (
    <div className={clsx(fullWidth && "w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium !text-slate-500 dark:!text-slate-400 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {leftIcon}
          </div>
        )}

        {variant === "textarea" ? (
          <textarea
            ref={ref}
            id={inputId}
            className={clsx(sharedClasses, "resize-none min-h-[100px]")}
            {...restProps}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            className={sharedClasses}
            {...restProps}
          />
        )}

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
