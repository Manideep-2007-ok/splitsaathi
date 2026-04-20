import { useState, useEffect, useMemo } from "react";
import { subscribeToExpenses } from "../services/expenses.js";
import { subscribeToSettlements } from "../services/settlements.js";
import { simplifyDebts, calculateNetBalances, hasActiveDebts, getTotalGroupSpend } from "../utils/debtSimplifier.js";

export function useBalances(groupId, memberUids) {
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      setExpensesLoading(false);
      return;
    }

    setExpensesLoading(true);

    const unsubscribe = subscribeToExpenses(
      groupId,
      (fetchedExpenses) => {
        setExpenses(fetchedExpenses ?? []);
        setExpensesLoading(false);
      },
      (errorMessage) => {
        console.error("useBalances expenses error:", errorMessage);
        setError(errorMessage);
        setExpenses([]);
        setExpensesLoading(false);
      }
    );

    const safetyTimeout = setTimeout(() => {
      setExpensesLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      setSettlements([]);
      setSettlementsLoading(false);
      return;
    }

    setSettlementsLoading(true);

    const unsubscribe = subscribeToSettlements(
      groupId,
      (fetchedSettlements) => {
        setSettlements(fetchedSettlements ?? []);
        setSettlementsLoading(false);
      },
      (errorMessage) => {
        console.error("useBalances settlements error:", errorMessage);
        setError(errorMessage);
        setSettlements([]);
        setSettlementsLoading(false);
      }
    );

    const safetyTimeout = setTimeout(() => {
      setSettlementsLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [groupId]);

  const resolvedMemberUids = useMemo(
    () => memberUids ?? [],
    [JSON.stringify(memberUids)]
  );

  const simplifiedTransactions = useMemo(
    () => simplifyDebts(expenses, settlements, resolvedMemberUids),
    [expenses, settlements, resolvedMemberUids]
  );

  const netBalances = useMemo(
    () => calculateNetBalances(expenses, settlements, resolvedMemberUids),
    [expenses, settlements, resolvedMemberUids]
  );

  const totalGroupSpend = useMemo(() => getTotalGroupSpend(expenses), [expenses]);

  const hasDebts = useMemo(() => hasActiveDebts(simplifiedTransactions), [simplifiedTransactions]);

  const loading = expensesLoading || settlementsLoading;

  return {
    simplifiedTransactions,
    netBalances,
    totalGroupSpend,
    hasDebts,
    expenses,
    settlements,
    loading,
    error,
  };
}
