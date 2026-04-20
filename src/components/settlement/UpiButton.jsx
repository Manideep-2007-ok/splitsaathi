import Button from "../common/Button.jsx";
import { buildUpiCleanLink } from "../../utils/upiHelper.js";
import { formatCurrency } from "../../utils/formatters.js";
import { Smartphone } from "lucide-react";

function UpiButton({
  upiId,
  payeeName,
  amount,
  onSettle,
  isLoading,
}) {
  const upiDeepLink = buildUpiCleanLink({ upiId, amount });

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
      <div className="flex items-center justify-center gap-2 text-gray-300">
        <Smartphone className="w-5 h-5" />
        <p className="text-sm font-medium">Pay via UPI App</p>
      </div>

      <p className="text-xs text-gray-400">
        Tap below to open your UPI app and pay{" "}
        <span className="font-[JetBrains_Mono] text-white">
          {formatCurrency(amount)}
        </span>{" "}
        to {payeeName}
      </p>

      <Button
        onClick={handlePayViaUpi}
        isLoading={isLoading}
        fullWidth
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-indigo-600"
      >
        Pay {formatCurrency(amount)} via UPI
      </Button>

      <p className="text-[10px] text-gray-500">
        UPI ID: {upiId}
      </p>
    </div>
  );
}

export default UpiButton;
