export function calculateEqualSplit(totalAmount, memberUids) {
  const memberCount = memberUids?.length ?? 0;

  if (memberCount === 0) {
    return {};
  }

  const totalInCents = Math.round(totalAmount * 100);
  const baseShareInCents = Math.floor(totalInCents / memberCount);
  const remainderInCents = totalInCents - baseShareInCents * memberCount;

  const splits = {};

  memberUids.forEach((uid, index) => {
    const extraCent = index < remainderInCents ? 1 : 0;
    splits[uid] = (baseShareInCents + extraCent) / 100;
  });

  return splits;
}

export function calculatePercentageSplit(totalAmount, percentagesByUid) {
  const entries = Object.entries(percentagesByUid ?? {});
  const totalPercentage = entries.reduce((sum, [, pct]) => sum + pct, 0);

  if (Math.abs(totalPercentage - 100) > 0.001) {
    return null;
  }

  const totalInCents = Math.round(totalAmount * 100);
  const splits = {};
  let allocatedCents = 0;

  entries.forEach(([uid, percentage], index) => {
    if (index === entries.length - 1) {
      splits[uid] = (totalInCents - allocatedCents) / 100;
    } else {
      const shareCents = Math.round(totalInCents * percentage / 100);
      splits[uid] = shareCents / 100;
      allocatedCents += shareCents;
    }
  });

  return splits;
}

export function calculateExactSplit(totalAmount, exactAmountsByUid) {
  const entries = Object.entries(exactAmountsByUid ?? {});
  const totalInCents = Math.round(totalAmount * 100);
  const sumInCents = entries.reduce(
    (sum, [, amount]) => sum + Math.round(amount * 100),
    0
  );

  if (sumInCents !== totalInCents) {
    return null;
  }

  const splits = {};

  entries.forEach(([uid, amount]) => {
    splits[uid] = Math.round(amount * 100) / 100;
  });

  return splits;
}

export function validateSplitConfig(splitType, totalAmount, splitData, memberUids) {
  if (totalAmount <= 0) {
    return { isValid: false, errorMessage: "Amount must be greater than zero" };
  }

  if (!memberUids?.length || memberUids.length === 0) {
    return { isValid: false, errorMessage: "At least one member is required" };
  }

  if (splitType === "equal") {
    return { isValid: true, errorMessage: null };
  }

  if (splitType === "percentage") {
    const totalPercentage = Object.values(splitData ?? {}).reduce(
      (sum, pct) => sum + (pct ?? 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.001) {
      return {
        isValid: false,
        errorMessage: `Percentages must add up to 100% (currently ${totalPercentage.toFixed(1)}%)`,
      };
    }

    return { isValid: true, errorMessage: null };
  }

  if (splitType === "exact") {
    const totalInCents = Math.round(totalAmount * 100);
    const sumInCents = Object.values(splitData ?? {}).reduce(
      (sum, amount) => sum + Math.round((amount ?? 0) * 100),
      0
    );

    if (sumInCents !== totalInCents) {
      const difference = (totalInCents - sumInCents) / 100;
      const direction = difference > 0 ? "short" : "over";
      return {
        isValid: false,
        errorMessage: `Split amounts are ₹${Math.abs(difference).toFixed(2)} ${direction}`,
      };
    }

    return { isValid: true, errorMessage: null };
  }

  return { isValid: false, errorMessage: "Invalid split type" };
}
