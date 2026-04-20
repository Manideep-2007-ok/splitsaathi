import { useState, useEffect } from "react";
import { subscribeToExpenses } from "../services/expenses.js";

export function useExpenses(groupId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToExpenses(
      groupId,
      (fetchedExpenses) => {
        setExpenses(fetchedExpenses);
        setLoading(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  return { expenses, loading, error };
}
