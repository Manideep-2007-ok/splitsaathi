import { useState, useMemo, useContext } from "react";
import clsx from "clsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { addExpense } from "../../services/expenses.js";
import { getExpenseCategories } from "../../services/expenses.js";
import { validateSplitConfig, calculateEqualSplit } from "../../utils/splitCalculator.js";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import SplitCalculator from "./SplitCalculator.jsx";
import { IndianRupee, Tag, Calendar, ChevronDown } from "lucide-react";

function ExpenseForm({ groupId, members, memberDetails, onSuccess, onCancel }) {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentUser?.uid ?? "");
  const [category, setCategory] = useState("general");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = getExpenseCategories();
  const parsedAmount = parseFloat(amount) || 0;
  const trimmedTitle = title.trim();

  const resolvedSplits = useMemo(() => {
    if (splitType === "equal" && parsedAmount > 0 && members?.length > 0) {
      return calculateEqualSplit(parsedAmount, members);
    }
    return customSplits;
  }, [splitType, parsedAmount, members, customSplits]);

  const titleValidation = trimmedTitle.length > 0;
  const amountValidation = parsedAmount > 0;

  const splitValidation = useMemo(() => {
    if (splitType === "equal") {
      return { isValid: true, errorMessage: null };
    }
    return validateSplitConfig(splitType, parsedAmount, customSplits, members);
  }, [splitType, parsedAmount, customSplits, members]);

  const isFormValid =
    titleValidation && amountValidation && splitValidation.isValid && paidBy;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        title: trimmedTitle,
        amount: parsedAmount,
        paidBy,
        category,
        splitType,
        splits: resolvedSplits,
        date: expenseDate,
      };

      await addExpense(groupId, expenseData, currentUser.uid);
      toast.success("Expense added successfully!");
      onSuccess?.();
    } catch (error) {
      toast.danger(error?.message ?? "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="What's this expense for?"
        placeholder="e.g., Dinner at Barbeque Nation"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        leftIcon={<Tag className="w-4 h-4" />}
        error={title.length > 0 && !titleValidation ? "Title is required" : undefined}
      />

      <Input
        label="Amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        leftIcon={<IndianRupee className="w-4 h-4" />}
        min="0.01"
        step="0.01"
        error={
          amount.length > 0 && !amountValidation
            ? "Amount must be greater than zero"
            : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Paid By
          </label>
          <div className="relative">
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all cursor-pointer"
            >
              {(members ?? []).map((uid) => (
                <option key={uid} value={uid}>
                  {uid === currentUser?.uid
                    ? "You"
                    : memberDetails?.[uid]?.displayName ?? "Unknown"}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      <Input
        label="Date"
        type="date"
        value={expenseDate}
        onChange={(event) => setExpenseDate(event.target.value)}
        leftIcon={<Calendar className="w-4 h-4" />}
      />

      <SplitCalculator
        totalAmount={parsedAmount}
        members={members}
        memberDetails={memberDetails}
        currentUserUid={currentUser?.uid}
        splitType={splitType}
        onSplitTypeChange={setSplitType}
        customSplits={customSplits}
        onCustomSplitsChange={setCustomSplits}
        resolvedSplits={resolvedSplits}
        validationError={splitValidation.errorMessage}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={!isFormValid}
          isLoading={isSubmitting}
          fullWidth
        >
          Add Expense
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default ExpenseForm;
