import Button from "../common/Button.jsx";
import { buildUpiDeepLink } from "../../utils/upiHelper.js";
import { formatCurrency } from "../../utils/formatters.js";
import { Smartphone } from "lucide-react";

function UpiButton({
  upiId,
  payeeName,
  amount,
  transactionNote,
  onSettle,
  isLoading,
}) {
  const upiDeepLink = buildUpiDeepLink({
    upiId,
    payeeName,
    amount,
    transactionNote,
  });

  const handlePayViaUpi = () => {
    onSettle?.();

    if (upiDeepLink) {
      setTimeout(() => {
        window.location.href = upiDeepLink;
      }, 300);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
        <Smartphone className="w-5 h-5" />
        <p className="text-sm font-medium">Pay via UPI App</p>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Tap the button below to open your UPI app and pay{" "}
        <span className="font-[JetBrains_Mono] text-[var(--text-primary)]">
          {formatCurrency(amount)}
        </span>{" "}
        to {payeeName}
      </p>

      <Button
        onClick={handlePayViaUpi}
        isLoading={isLoading}
        fullWidth
        size="lg"
        className="bg-gradient-to-r from-[var(--accent)] to-[#6366F1]"
      >
        Pay {formatCurrency(amount)} via UPI
      </Button>

      <p className="text-[10px] text-[var(--text-muted)]">
        UPI ID: {upiId}
      </p>
    </div>
  );
}

export default UpiButton;
