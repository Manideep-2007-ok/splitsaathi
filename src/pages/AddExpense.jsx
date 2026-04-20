import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import { subscribeToGroup } from "../services/groups.js";
import { addExpense } from "../services/expenses.js";
import { getExpenseCategories } from "../services/expenses.js";
import {
  calculateEqualSplit,
  validateSplitConfig,
} from "../utils/splitCalculator.js";
import { formatCurrency } from "../utils/formatters.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import SplitCalculator from "../components/expenses/SplitCalculator.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";
import {
  ArrowLeft,
  IndianRupee,
  Tag,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";

function AddExpense() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);

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

  useEffect(() => {
    if (!groupId) {
      return;
    }

    const unsubscribe = subscribeToGroup(
      groupId,
      (groupData) => {
        setGroup(groupData);
        setGroupLoading(false);
      },
      (errorMessage) => {
        toast.danger(errorMessage ?? "Failed to load group");
        setGroupLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  const memberUids = group?.members ?? [];
  const memberDetails = group?.memberDetails ?? {};
  const parsedAmount = parseFloat(amount) || 0;
  const trimmedTitle = title.trim();

  const resolvedSplits =
    splitType === "equal" && parsedAmount > 0 && memberUids.length > 0
      ? calculateEqualSplit(parsedAmount, memberUids)
      : customSplits;

  const splitValidation =
    splitType === "equal"
      ? { isValid: true, errorMessage: null }
      : validateSplitConfig(splitType, parsedAmount, customSplits, memberUids);

  const isFormValid =
    trimmedTitle.length > 0 &&
    parsedAmount > 0 &&
    splitValidation.isValid &&
    paidBy;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense(
        groupId,
        {
          title: trimmedTitle,
          amount: parsedAmount,
          paidBy,
          category,
          splitType,
          splits: resolvedSplits,
          date: expenseDate,
        },
        currentUser.uid
      );

      toast.success("Expense added successfully!");
      navigate(`/group/${groupId}`);
    } catch (error) {
      toast.danger(error?.message ?? "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (groupLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <SkeletonCard rows={4} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)]">Group not found</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] font-[Syne]">
            Add Expense
          </h1>
          <p className="text-xs text-[var(--text-muted)]">{group?.name}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
      >
        <Input
          label="What's this expense for?"
          placeholder="e.g., Dinner at Barbeque Nation"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          leftIcon={<Tag className="w-4 h-4" />}
          error={
            title.length > 0 && trimmedTitle.length === 0
              ? "Title is required"
              : undefined
          }
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
            amount.length > 0 && parsedAmount <= 0
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
                {memberUids.map((uid) => (
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
          members={memberUids}
          memberDetails={memberDetails}
          currentUserUid={currentUser?.uid}
          splitType={splitType}
          onSplitTypeChange={(newType) => {
            setSplitType(newType);
            setCustomSplits({});
          }}
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
            Add Expense — {parsedAmount > 0 ? formatCurrency(parsedAmount) : "₹0.00"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/group/${groupId}`)}
            fullWidth
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;
