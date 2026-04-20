import {
  db,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "./firebase.js";

export async function addSettlement(groupId, settlementData) {
  try {
    const settlementsCollection = collection(
      db,
      "groups",
      groupId,
      "settlements"
    );

    const newSettlement = {
      from: settlementData.from,
      to: settlementData.to,
      amount: parseFloat(settlementData.amount) || 0,
      method: settlementData.method ?? "upi",
      transactionRef: settlementData.transactionRef ?? "",
      settledAt: serverTimestamp(),
    };

    const docRef = await addDoc(settlementsCollection, newSettlement);

    return { id: docRef.id, ...newSettlement };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to record settlement");
  }
}

export function subscribeToSettlements(groupId, onData, onError) {
  const settlementsQuery = query(
    collection(db, "groups", groupId, "settlements"),
    orderBy("settledAt", "desc")
  );

  return onSnapshot(
    settlementsQuery,
    (snapshot) => {
      const settlements = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(settlements);
    },
    (error) => {
      onError?.(error?.message ?? "Failed to load settlements");
    }
  );
}

export function getSettlementMethods() {
  return [
    { value: "upi", label: "UPI", icon: "smartphone" },
    { value: "cash", label: "Cash", icon: "banknote" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "building" },
    { value: "other", label: "Other", icon: "circle-dot" },
  ];
}

export function getSettlementMethodLabel(methodValue) {
  const methods = getSettlementMethods();
  const found = methods.find((m) => m.value === methodValue);
  return found?.label ?? "UPI";
}
