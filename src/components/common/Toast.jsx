import { useState, useEffect } from "react";
import clsx from "clsx";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";

const typeConfig = {
  success: {
    icon: CheckCircle2,
    containerClass: "border-emerald-500/30 bg-emerald-500/5",
    iconClass: "text-[var(--success)]",
    barClass: "bg-[var(--success)]",
  },
  danger: {
    icon: AlertCircle,
    containerClass: "border-rose-500/30 bg-rose-500/5",
    iconClass: "text-[var(--danger)]",
    barClass: "bg-[var(--danger)]",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "border-amber-500/30 bg-amber-500/5",
    iconClass: "text-[var(--warning)]",
    barClass: "bg-[var(--warning)]",
  },
  info: {
    icon: Info,
    containerClass: "border-[var(--accent)]/30 bg-[var(--accent)]/5",
    iconClass: "text-[var(--accent-light)]",
    barClass: "bg-[var(--accent)]",
  },
};

function Toast({ id, type = "info", message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const config = typeConfig[type] ?? typeConfig.info;
  const IconComponent = config.icon;

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(enterTimer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss?.(id), 200);
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto w-80 rounded-xl border backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300",
        config.containerClass,
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-8 opacity-0"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <IconComponent className={clsx("w-5 h-5 shrink-0 mt-0.5", config.iconClass)} />

        <p className="flex-1 text-sm text-[var(--text-primary)] leading-relaxed">
          {message}
        </p>

        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={clsx("h-0.5 w-full", config.barClass, "opacity-40")} />
    </div>
  );
}

export default Toast;
