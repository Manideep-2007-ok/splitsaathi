import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }) {
  const { currentUser, profileComplete, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          <p className="text-[var(--text-muted)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default ProtectedRoute;
