const UPI_BASE = "upi://pay";
const MIN_AMOUNT = 1.0;

function sanitizeAmount(amount) {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed < MIN_AMOUNT) {
    return MIN_AMOUNT.toFixed(2);
  }
  return parsed.toFixed(2);
}

function sanitizeVpa(upiId) {
  return (upiId ?? "").trim();
}

export function buildUpiCleanLink({ upiId, amount }) {
  const vpa = sanitizeVpa(upiId);
  if (!vpa) return null;

  const safeAmount = sanitizeAmount(amount);

  return `${UPI_BASE}?pa=${vpa}&am=${safeAmount}&cu=INR`;
}

export function buildUpiDeepLink({ upiId, payeeName, amount, transactionNote }) {
  const vpa = sanitizeVpa(upiId);
  if (!vpa) return null;

  const safeAmount = sanitizeAmount(amount);

  const params = [`pa=${vpa}`, `am=${safeAmount}`, `cu=INR`];

  if (payeeName && payeeName.trim().length > 0) {
    params.push(`pn=${encodeURIComponent(payeeName.trim())}`);
  }

  if (transactionNote && transactionNote.trim().length > 0) {
    params.push(`tn=${encodeURIComponent(transactionNote.trim())}`);
  }

  return `${UPI_BASE}?${params.join("&")}`;
}

export function buildUpiQrString({ upiId, amount }) {
  return buildUpiCleanLink({ upiId, amount });
}

export function isValidUpiId(upiId) {
  if (!upiId || typeof upiId !== "string") {
    return false;
  }

  const upiIdPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiIdPattern.test(upiId.trim());
}

export function formatUpiIdForDisplay(upiId) {
  if (!upiId) {
    return "Not set";
  }

  return upiId.trim();
}

export function generateTransactionNote(payerName, payeeName, groupName) {
  const payer = (payerName ?? "Someone").split(" ")[0];
  const payee = (payeeName ?? "Someone").split(" ")[0];
  const group = groupName ?? "group";

  return `${payer} paid ${payee} - ${group}`;
}
