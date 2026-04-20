import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import Avatar from "../common/Avatar.jsx";
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  UserCircle,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/balances", label: "Balances", icon: Wallet },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

function Sidebar({ isOpen, onClose }) {
  const { userProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.danger(error?.message ?? "Failed to sign out");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-72 bg-[#18181B]/60 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-[var(--text-primary)] font-[Syne] tracking-tight">
              SplitSaathi
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-[var(--accent-light)]"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-light)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-[var(--bg-elevated)]">
            <Avatar
              src={userProfile?.photoURL}
              name={userProfile?.displayName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {userProfile?.displayName ?? "User"}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {userProfile?.email ?? ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
