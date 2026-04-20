import {
  db,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from "./firebase.js";

function sanitizeExpenseData(expenseData, currentUserUid) {
  const title = (expenseData.title ?? "").trim();
  if (!title) {
    throw new Error("Expense title is required");
  }

  const amount = parseFloat(expenseData.amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Expense amount must be greater than zero");
  }

  const paidBy = expenseData.paidBy ?? currentUserUid;
  if (!paidBy) {
    throw new Error("Paid-by user is required");
  }

  const splits = expenseData.splits;
  if (!splits || typeof splits !== "object" || Object.keys(splits).length === 0) {
    throw new Error("At least one split entry is required");
  }

  const cleanSplits = {};
  for (const [uid, value] of Object.entries(splits)) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      cleanSplits[uid] = numValue;
    }
  }

  if (Object.keys(cleanSplits).length === 0) {
    throw new Error("At least one member must have a non-zero split");
  }

  return {
    title,
    amount: parseFloat(amount.toFixed(2)),
    paidBy,
    category: expenseData.category || "general",
    splitType: expenseData.splitType || "equal",
    splits: cleanSplits,
    date: expenseData.date || new Date().toISOString().split("T")[0],
    createdAt: serverTimestamp(),
    createdBy: currentUserUid,
  };
}

export async function addExpense(groupId, expenseData, currentUserUid) {
  if (!groupId) {
    throw new Error("Group ID is required");
  }

  if (!currentUserUid) {
    throw new Error("User must be authenticated to add an expense");
  }

  const sanitized = sanitizeExpenseData(expenseData, currentUserUid);

  try {
    const batch = writeBatch(db);

    const expenseRef = doc(collection(db, "groups", groupId, "expenses"));
    batch.set(expenseRef, sanitized);

    const groupRef = doc(db, "groups", groupId);
    batch.update(groupRef, {
      totalExpenses: increment(sanitized.amount),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return { id: expenseRef.id, ...sanitized };
  } catch (error) {
    console.error("addExpense failed:", {
      code: error?.code ?? "UNKNOWN",
      message: error?.message,
      groupId,
      amount: sanitized.amount,
    });
    throw new Error(
      error?.code === "permission-denied"
        ? "Permission denied. Check your Firestore security rules."
        : error?.message ?? "Failed to add expense"
    );
  }
}

export async function fetchExpense(groupId, expenseId) {
  try {
    const expenseSnap = await getDoc(
      doc(db, "groups", groupId, "expenses", expenseId)
    );

    if (!expenseSnap.exists()) {
      throw new Error("Expense not found");
    }

    return { id: expenseSnap.id, ...expenseSnap.data() };
  } catch (error) {
    console.error("fetchExpense failed:", error?.code, error?.message);
    throw new Error(error?.message ?? "Failed to fetch expense");
  }
}

export async function updateExpense(groupId, expenseId, updates, previousAmount) {
  try {
    const batch = writeBatch(db);

    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    batch.update(expenseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (updates.amount !== undefined && previousAmount !== undefined) {
      const amountDelta = parseFloat(updates.amount) - parseFloat(previousAmount);

      if (amountDelta !== 0) {
        const groupRef = doc(db, "groups", groupId);
        batch.update(groupRef, {
          totalExpenses: increment(amountDelta),
          updatedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error("updateExpense failed:", error?.code, error?.message);
    throw new Error(
      error?.code === "permission-denied"
        ? "Permission denied. Check your Firestore security rules."
        : error?.message ?? "Failed to update expense"
    );
  }
}

export async function deleteExpense(groupId, expenseId, expenseAmount, requesterUid) {
  try {
    const expenseSnap = await getDoc(doc(db, "groups", groupId, "expenses", expenseId));
    if (!expenseSnap.exists()) {
      throw new Error("Expense not found");
    }

    const expenseData = expenseSnap.data();
    console.log('Current User:', requesterUid, 'Expense Paid By:', expenseData.paidBy);

    if (expenseData.paidBy !== requesterUid) {
      throw new Error("Only the person who paid for this expense can delete it");
    }

    const batch = writeBatch(db);

    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    batch.delete(expenseRef);

    if (expenseAmount && expenseAmount > 0) {
      const groupRef = doc(db, "groups", groupId);
      batch.update(groupRef, {
        totalExpenses: increment(-expenseAmount),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error("deleteExpense failed:", error?.code, error?.message);
    throw new Error(
      error?.code === "permission-denied"
        ? "Permission denied. Check your Firestore security rules."
        : error?.message ?? "Failed to delete expense"
    );
  }
}

export function subscribeToExpenses(groupId, onData, onError) {
  const expensesQuery = query(
    collection(db, "groups", groupId, "expenses"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(expenses);
    },
    (error) => {
      console.error("subscribeToExpenses error:", error?.code, error?.message);
      onError?.(error?.message ?? "Failed to load expenses");
    }
  );
}

export function getExpenseCategories() {
  return [
    { value: "food", label: "Food & Drinks", emoji: "🍕" },
    { value: "transport", label: "Transport", emoji: "🚗" },
    { value: "shopping", label: "Shopping", emoji: "🛍️" },
    { value: "entertainment", label: "Entertainment", emoji: "🎬" },
    { value: "utilities", label: "Utilities", emoji: "💡" },
    { value: "rent", label: "Rent", emoji: "🏠" },
    { value: "groceries", label: "Groceries", emoji: "🛒" },
    { value: "medical", label: "Medical", emoji: "💊" },
    { value: "education", label: "Education", emoji: "📚" },
    { value: "travel", label: "Travel", emoji: "✈️" },
    { value: "general", label: "General", emoji: "📦" },
  ];
}

export function getCategoryByValue(categoryValue) {
  const categories = getExpenseCategories();
  return (
    categories.find((cat) => cat.value === categoryValue) ??
    categories[categories.length - 1]
  );
}
