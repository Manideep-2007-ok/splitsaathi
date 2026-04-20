import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import { Sparkles, LogIn } from "lucide-react";
import Button from "../components/common/Button.jsx";

function Login() {
  const { currentUser, profileComplete, loading, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate(profileComplete ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [currentUser, profileComplete, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Welcome to SplitSaathi!");
    } catch (error) {
      toast.danger(error?.message ?? "Sign in failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--accent)] rounded-full opacity-[0.04] blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#6366F1] rounded-full opacity-[0.04] blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] rounded-full opacity-[0.02] blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[#6366F1] shadow-2xl shadow-[var(--accent-glow)] mb-6 animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] font-[Syne] tracking-tight mb-3">SplitSaathi</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Smart expense splitting for your squad. Track, split &amp; settle — all in one place.
          </p>
        </div>

        <div className="bg-[#18181B]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-[Syne] text-center mb-2">Get Started</h2>
          <p className="text-sm text-[var(--text-muted)] text-center mb-8">Sign in with your Google account to continue</p>

          <Button
            onClick={handleGoogleSignIn}
            size="lg"
            fullWidth
            leftIcon={<LogIn className="w-5 h-5" />}
            className="bg-gradient-to-r from-[var(--accent)] to-[#6366F1] hover:shadow-xl hover:shadow-[var(--accent-glow)] transition-shadow"
          >
            Continue with Google
          </Button>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-[var(--text-muted)]">Why SplitSaathi?</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { emoji: "⚡", label: "Instant Split" },
              { emoji: "📊", label: "Smart Debts" },
              { emoji: "💸", label: "UPI Settle" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-[10px] font-medium text-[var(--text-muted)] text-center">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--text-muted)] mt-6">Built for Indian college students 🇮🇳</p>
      </div>
    </div>
  );
}

export default Login;
