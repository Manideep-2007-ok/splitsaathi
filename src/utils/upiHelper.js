const UPI_BASE_URL = "upi://pay";

export function buildUpiDeepLink({ upiId, payeeName, amount, transactionNote }) {
  if (!upiId || !amount) {
    return null;
  }

  const sanitizedPayeeName = encodeURIComponent(
    (payeeName ?? "SplitSaathi User").trim()
  );

  const sanitizedNote = encodeURIComponent(
    (transactionNote ?? "SplitSaathi Settlement").trim()
  );

  const formattedAmount = parseFloat(amount).toFixed(2);

  const trimmedUpiId = upiId.trim();

  return `${UPI_BASE_URL}?pa=${trimmedUpiId}&pn=${sanitizedPayeeName}&am=${formattedAmount}&cu=INR&tn=${sanitizedNote}`;
}

export function buildUpiQrString({ upiId, payeeName, amount, transactionNote }) {
  return buildUpiDeepLink({ upiId, payeeName, amount, transactionNote });
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

  return `${payer} paid ${payee} - ${group} (via SplitSaathi)`;
}
