import clsx from "clsx";
import { getInitials } from "../../utils/formatters.js";

const sizeConfig = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

function Avatar({
  src,
  name,
  size = "md",
  className,
  showOnlineIndicator = false,
}) {
  const initials = getInitials(name);
  const hasImage = src && typeof src === "string" && src.length > 0;

  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      {hasImage ? (
        <img
          src={src}
          alt={name ?? "User avatar"}
          className={clsx(
            "rounded-full object-cover ring-2 ring-[var(--border-subtle)]",
            sizeConfig[size] ?? sizeConfig.md
          )}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.style.display = "flex";
          }}
        />
      ) : null}

      <div
        className={clsx(
          "rounded-full bg-gradient-to-br from-[var(--accent)] to-[#6366F1] flex items-center justify-center font-semibold text-white",
          sizeConfig[size] ?? sizeConfig.md,
          hasImage && "hidden"
        )}
      >
        {initials}
      </div>

      {showOnlineIndicator && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--success)] rounded-full ring-2 ring-[var(--bg-surface)]" />
      )}
    </div>
  );
}

export default Avatar;
