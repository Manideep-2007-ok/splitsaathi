import {
  db,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
} from "./firebase.js";

export async function addExpense(groupId, expenseData, currentUserUid) {
  try {
    const expensesCollection = collection(db, "groups", groupId, "expenses");

    const newExpense = {
      title: (expenseData.title ?? "").trim(),
      amount: parseFloat(expenseData.amount) || 0,
      paidBy: expenseData.paidBy ?? currentUserUid,
      category: expenseData.category ?? "general",
      splitType: expenseData.splitType ?? "equal",
      splits: expenseData.splits ?? {},
      date: expenseData.date ?? new Date().toISOString(),
      createdAt: serverTimestamp(),
      createdBy: currentUserUid,
    };

    const docRef = await addDoc(expensesCollection, newExpense);

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      totalExpenses: increment(newExpense.amount),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...newExpense };
  } catch (error) {
    throw new Error(error?.message ?? "Failed to add expense");
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
    throw new Error(error?.message ?? "Failed to fetch expense");
  }
}

export async function updateExpense(groupId, expenseId, updates, previousAmount) {
  try {
    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);

    await updateDoc(expenseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (updates.amount !== undefined && previousAmount !== undefined) {
      const amountDelta = parseFloat(updates.amount) - parseFloat(previousAmount);

      if (amountDelta !== 0) {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, {
          totalExpenses: increment(amountDelta),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    throw new Error(error?.message ?? "Failed to update expense");
  }
}

export async function deleteExpense(groupId, expenseId, expenseAmount) {
  try {
    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
    await deleteDoc(expenseRef);

    if (expenseAmount && expenseAmount > 0) {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        totalExpenses: increment(-expenseAmount),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    throw new Error(error?.message ?? "Failed to delete expense");
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
