export function simplifyDebts(expenses, settlements, memberUids) {
  const netBalanceInCents = {};

  memberUids.forEach((uid) => {
    netBalanceInCents[uid] = 0;
  });

  (expenses ?? []).forEach((expense) => {
    const paidByUid = expense?.paidBy;
    const amountInCents = Math.round((expense?.amount ?? 0) * 100);

    netBalanceInCents[paidByUid] = (netBalanceInCents[paidByUid] ?? 0) + amountInCents;

    Object.entries(expense?.splits ?? {}).forEach(([uid, splitAmount]) => {
      const splitInCents = Math.round(splitAmount * 100);
      netBalanceInCents[uid] = (netBalanceInCents[uid] ?? 0) - splitInCents;
    });
  });

  (settlements ?? []).forEach((settlement) => {
    const fromUid = settlement?.from;
    const toUid = settlement?.to;
    const settledAmountInCents = Math.round((settlement?.amount ?? 0) * 100);

    netBalanceInCents[fromUid] = (netBalanceInCents[fromUid] ?? 0) + settledAmountInCents;
    netBalanceInCents[toUid] = (netBalanceInCents[toUid] ?? 0) - settledAmountInCents;
  });

  const creditors = [];
  const debtors = [];

  Object.entries(netBalanceInCents).forEach(([uid, balanceCents]) => {
    if (balanceCents > 0) {
      creditors.push({ uid, amountCents: balanceCents });
    } else if (balanceCents < 0) {
      debtors.push({ uid, amountCents: -balanceCents });
    }
  });

  creditors.sort((a, b) => b.amountCents - a.amountCents);
  debtors.sort((a, b) => b.amountCents - a.amountCents);

  const simplifiedTransactions = [];
  let creditorPointer = 0;
  let debtorPointer = 0;

  while (creditorPointer < creditors.length && debtorPointer < debtors.length) {
    const currentCreditor = creditors[creditorPointer];
    const currentDebtor = debtors[debtorPointer];
    const settleAmountCents = Math.min(currentCreditor.amountCents, currentDebtor.amountCents);

    if (settleAmountCents > 0) {
      simplifiedTransactions.push({
        from: currentDebtor.uid,
        to: currentCreditor.uid,
        amount: settleAmountCents / 100,
      });
    }

    currentCreditor.amountCents -= settleAmountCents;
    currentDebtor.amountCents -= settleAmountCents;

    if (currentCreditor.amountCents === 0) {
      creditorPointer++;
    }

    if (currentDebtor.amountCents === 0) {
      debtorPointer++;
    }
  }

  return simplifiedTransactions;
}

export function calculateNetBalances(expenses, settlements, memberUids) {
  const netBalanceInCents = {};

  memberUids.forEach((uid) => {
    netBalanceInCents[uid] = 0;
  });

  (expenses ?? []).forEach((expense) => {
    const paidByUid = expense?.paidBy;
    const amountInCents = Math.round((expense?.amount ?? 0) * 100);

    netBalanceInCents[paidByUid] = (netBalanceInCents[paidByUid] ?? 0) + amountInCents;

    Object.entries(expense?.splits ?? {}).forEach(([uid, splitAmount]) => {
      const splitInCents = Math.round(splitAmount * 100);
      netBalanceInCents[uid] = (netBalanceInCents[uid] ?? 0) - splitInCents;
    });
  });

  (settlements ?? []).forEach((settlement) => {
    const fromUid = settlement?.from;
    const toUid = settlement?.to;
    const settledAmountInCents = Math.round((settlement?.amount ?? 0) * 100);

    netBalanceInCents[fromUid] = (netBalanceInCents[fromUid] ?? 0) + settledAmountInCents;
    netBalanceInCents[toUid] = (netBalanceInCents[toUid] ?? 0) - settledAmountInCents;
  });

  const netBalances = {};

  Object.entries(netBalanceInCents).forEach(([uid, cents]) => {
    netBalances[uid] = cents / 100;
  });

  return netBalances;
}

export function hasActiveDebts(simplifiedTransactions) {
  return (simplifiedTransactions ?? []).length > 0;
}

export function getTotalGroupSpend(expenses) {
  return (expenses ?? []).reduce(
    (total, expense) => total + (expense?.amount ?? 0),
    0
  );
}
