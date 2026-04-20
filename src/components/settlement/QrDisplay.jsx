import QRCode from "react-qr-code";
import { buildUpiQrString } from "../../utils/upiHelper.js";
import { formatCurrency } from "../../utils/formatters.js";
import { QrCode } from "lucide-react";

function QrDisplay({ upiId, payeeName, amount }) {
  const qrValue = buildUpiQrString({ upiId, amount });

  if (!qrValue) {
    return (
      <div className="text-center py-6">
        <QrCode className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-sm text-[var(--text-muted)]">Unable to generate QR code</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
        <QrCode className="w-5 h-5" />
        <p className="text-sm font-medium">Scan to Pay</p>
      </div>
      <div className="inline-flex p-4 rounded-2xl bg-white border border-[var(--border-subtle)] mx-auto shadow-sm">
        <QRCode value={qrValue} size={180} level="M" bgColor="#FFFFFF" fgColor="#1A1A2E" />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-[var(--text-secondary)]">
          Pay <span className="font-bold font-money text-[var(--text-primary)]">{formatCurrency(amount)}</span> to {payeeName}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">UPI ID: {upiId}</p>
      </div>
      <p className="text-xs text-[var(--text-muted)]">Scan this QR code with any UPI app, then click &quot;I have completed the payment&quot; below</p>
    </div>
  );
}

export default QrDisplay;
