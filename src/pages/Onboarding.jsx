import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import { createUserDocument } from "../services/users.js";
import { isValidUpiId } from "../utils/upiHelper.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import Avatar from "../components/common/Avatar.jsx";
import { User, Smartphone, ArrowRight, Loader2 } from "lucide-react";

function Onboarding() {
  const { currentUser, profileComplete, loading, markProfileComplete } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [upiId, setUpiId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) navigate("/login", { replace: true });
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (!loading && profileComplete) navigate("/dashboard", { replace: true });
  }, [profileComplete, loading, navigate]);

  const trimmedName = displayName.trim();
  const trimmedUpi = upiId.trim();
  const upiError = trimmedUpi.length > 0 && !isValidUpiId(trimmedUpi) ? "Enter a valid UPI ID (e.g., name@paytm)" : undefined;
  const isFormValid = trimmedName.length > 0 && !upiError;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const userDoc = await createUserDocument({ uid: currentUser.uid, displayName: trimmedName, email: currentUser.email ?? "", photoURL: currentUser.photoURL ?? null, upiId: trimmedUpi });
      markProfileComplete(userDoc);
      toast.success("Welcome to SplitSaathi! 🎉");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.danger(error?.message ?? "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--accent)] rounded-full opacity-[0.06] blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--accent-light)] rounded-full opacity-[0.06] blur-3xl" />
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-logo text-[var(--accent)] mb-4 animate-float">Welcome!</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">Let&apos;s set up your profile so your friends can find you</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-lg space-y-6">
          <div className="flex justify-center mb-2"><Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size="xl" /></div>
          <p className="text-center text-xs text-[var(--text-muted)]">Signed in as {currentUser?.email ?? ""}</p>
          <Input label="Display Name" placeholder="What should your friends call you?" value={displayName} onChange={(e) => setDisplayName(e.target.value)} leftIcon={<User className="w-4 h-4" />} error={displayName.length > 0 && trimmedName.length === 0 ? "Name is required" : undefined} />
          <Input label="UPI ID (optional)" placeholder="yourname@paytm" value={upiId} onChange={(e) => setUpiId(e.target.value)} leftIcon={<Smartphone className="w-4 h-4" />} error={upiError} helperText={!upiError ? "Used for receiving settlements. You can add this later." : undefined} />
          <Button type="submit" disabled={!isFormValid} isLoading={isSubmitting} fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)]">Get Started</Button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
