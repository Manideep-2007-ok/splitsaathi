import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast.js";
import { useDevice } from "../../hooks/useDevice.js";
import { addSettlement } from "../../services/settlements.js";
import { fetchUserDocument } from "../../services/users.js";
import { formatCurrency } from "../../utils/formatters.js";
import Modal from "../common/Modal.jsx";
import Avatar from "../common/Avatar.jsx";
import Button from "../common/Button.jsx";
import UpiButton from "./UpiButton.jsx";
import QrDisplay from "./QrDisplay.jsx";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

function SettleModal({ isOpen, onClose, groupId, groupName, transaction, memberDetails }) {
  const toast = useToast();
  const { isMobile } = useDevice();
  const [isSettling, setIsSettling] = useState(false);
  const [liveToMember, setLiveToMember] = useState(null);
  const [fetchingMember, setFetchingMember] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const fromUid = transaction?.from ?? "";
  const toUid = transaction?.to ?? "";
  const amount = transaction?.amount ?? 0;
  const fromMember = memberDetails?.[fromUid] ?? {};

  useEffect(() => {
    if (!isOpen) {
      setShowWarning(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !toUid) { setLiveToMember(null); return; }
    let cancelled = false;
    setFetchingMember(true);
    fetchUserDocument(toUid)
      .then((userDoc) => { if (!cancelled) { setLiveToMember(userDoc); setFetchingMember(false); } })
      .catch((error) => { console.error("Failed to fetch payee profile:", error); if (!cancelled) { setLiveToMember(null); setFetchingMember(false); } });
    return () => { cancelled = true; };
  }, [isOpen, toUid]);

  const toMember = liveToMember ?? memberDetails?.[toUid] ?? {};
  const fromName = fromMember?.displayName ?? "Someone";
  const toName = toMember?.displayName ?? "Someone";
  const toUpiId = toMember?.upiId ?? "";

  const handleSettleUp = async (method = "upi") => {
    setIsSettling(true);
    try {
      await addSettlement(groupId, { from: fromUid, to: toUid, amount, method, transactionRef: `${method}-${Date.now()}` });
      toast.success(`₹${amount.toFixed(2)} settled successfully!`);
      onClose?.();
    } catch (error) {
      toast.danger(error?.message ?? "Failed to record settlement");
    } finally {
      setIsSettling(false);
    }
  };

  if (showWarning) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="p-6 text-center space-y-6">
          <h2 className="text-3xl font-logo text-[var(--accent)] mb-2">Confirm Payment</h2>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            You are about to pay <span className="font-bold text-slate-900 dark:text-white">{toName}</span>.
          </p>
          <div className="py-4">
            <p className="text-5xl font-bold font-money text-[var(--text-primary)] tracking-tight">
              {formatCurrency(amount)}
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
            Please ensure you are sending money to the correct person. All transactions are final.
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowWarning(false)} fullWidth size="lg">Proceed to QR</Button>
            <Button variant="outline" onClick={onClose} fullWidth size="lg" className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-300 dark:border-slate-700">Cancel</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Up" size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar src={fromMember?.photoURL} name={fromName} size="lg" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">{fromName}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-5 h-5 text-[var(--accent)]" />
            <p className="text-lg font-bold text-[var(--accent)] font-money">{formatCurrency(amount)}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar src={toMember?.photoURL} name={toName} size="lg" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">{toName}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {fetchingMember ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" /></div>
          ) : isMobile && toUpiId ? (
            <UpiButton upiId={toUpiId} payeeName={toName} amount={amount} onSettle={() => handleSettleUp("upi")} isLoading={isSettling} />
          ) : toUpiId ? (
            <QrDisplay upiId={toUpiId} payeeName={toName} amount={amount} />
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-muted)] mb-2">{toName} hasn&apos;t set up their UPI ID yet</p>
              <p className="text-xs text-[var(--text-muted)]">You can still mark this as settled manually</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => handleSettleUp(toUpiId ? "upi" : "cash")} isLoading={isSettling} fullWidth leftIcon={<CheckCircle2 className="w-4 h-4" />}>Mark as Paid</Button>
          <Button variant="ghost" onClick={onClose} fullWidth className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default SettleModal;
