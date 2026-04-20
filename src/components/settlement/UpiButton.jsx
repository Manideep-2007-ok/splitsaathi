import Button from "../common/Button.jsx";
import { buildUpiCleanLink } from "../../utils/upiHelper.js";
import { formatCurrency } from "../../utils/formatters.js";
import { Smartphone } from "lucide-react";

function UpiButton({ upiId, payeeName, amount, onSettle, isLoading }) {
  const upiDeepLink = buildUpiCleanLink({ upiId, amount });

  const handlePayViaUpi = () => {
    onSettle?.();
    if (upiDeepLink) {
      setTimeout(() => { window.location.href = upiDeepLink; }, 300);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
        <Smartphone className="w-5 h-5" />
        <p className="text-sm font-medium">Pay via UPI App</p>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Tap below to open your UPI app and pay{" "}
        <span className="font-money font-semibold text-[var(--text-primary)]">{formatCurrency(amount)}</span>{" "}
        to {payeeName}
      </p>
      <Button onClick={handlePayViaUpi} isLoading={isLoading} fullWidth size="lg" className="bg-[#5AA9E6] text-[#F9F9F9] font-bold border-none hover:brightness-110">
        Pay Now
      </Button>
      <p className="text-[10px] text-[var(--text-muted)]">UPI ID: {upiId}</p>
    </div>
  );
}

export default UpiButton;
