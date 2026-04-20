const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  return CURRENCY_FORMATTER.format(amount);
}

export function formatCompactCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0";
  }

  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return COMPACT_CURRENCY_FORMATTER.format(amount);
}

export function formatAmountRaw(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }

  return parseFloat(amount).toFixed(2);
}

function toJsDate(firestoreTimestampOrDate) {
  if (!firestoreTimestampOrDate) {
    return null;
  }

  if (typeof firestoreTimestampOrDate?.toDate === "function") {
    return firestoreTimestampOrDate.toDate();
  }

  if (firestoreTimestampOrDate instanceof Date) {
    return firestoreTimestampOrDate;
  }

  if (typeof firestoreTimestampOrDate === "string" || typeof firestoreTimestampOrDate === "number") {
    const parsed = new Date(firestoreTimestampOrDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function formatDate(firestoreTimestampOrDate) {
  const jsDate = toJsDate(firestoreTimestampOrDate);

  if (!jsDate) {
    return "Unknown date";
  }

  return DATE_FORMATTER.format(jsDate);
}

export function formatDateTime(firestoreTimestampOrDate) {
  const jsDate = toJsDate(firestoreTimestampOrDate);

  if (!jsDate) {
    return "Unknown date";
  }

  return DATE_TIME_FORMATTER.format(jsDate);
}

export function formatShortDate(firestoreTimestampOrDate) {
  const jsDate = toJsDate(firestoreTimestampOrDate);

  if (!jsDate) {
    return "";
  }

  return SHORT_DATE_FORMATTER.format(jsDate);
}

export function formatRelativeTime(firestoreTimestampOrDate) {
  const jsDate = toJsDate(firestoreTimestampOrDate);

  if (!jsDate) {
    return "some time ago";
  }

  const nowMs = Date.now();
  const thenMs = jsDate.getTime();
  const diffSeconds = Math.floor((nowMs - thenMs) / 1000);

  if (diffSeconds < 5) {
    return "just now";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  }

  return DATE_FORMATTER.format(jsDate);
}

export function getInitials(displayName) {
  if (!displayName || typeof displayName !== "string") {
    return "?";
  }

  const nameParts = displayName.trim().split(/\s+/);

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

export function truncateName(displayName, maxLength = 12) {
  if (!displayName || typeof displayName !== "string") {
    return "Unknown";
  }

  const trimmed = displayName.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function getFirstName(displayName) {
  if (!displayName || typeof displayName !== "string") {
    return "User";
  }

  return displayName.trim().split(/\s+/)[0] ?? "User";
}

export function pluralize(count, singular, plural) {
  const resolvedPlural = plural ?? `${singular}s`;
  return count === 1 ? singular : resolvedPlural;
}

export function formatMemberCount(count) {
  return `${count ?? 0} ${pluralize(count ?? 0, "member")}`;
}

export function formatExpenseCount(count) {
  return `${count ?? 0} ${pluralize(count ?? 0, "expense")}`;
}
