import { useContext } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import clsx from "clsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import { useTheme } from "../../hooks/useTheme.js";
import Avatar from "../common/Avatar.jsx";
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  UserCircle,
  Users,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/friends", label: "Friends", icon: Users },
  { path: "/balances", label: "Balances", icon: Wallet },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

function Sidebar({ isOpen, onClose }) {
  const { userProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();

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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-72 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div 
            onClick={() => { navigate('/dashboard'); window.location.reload(); }} 
            className="text-2xl font-logo text-[var(--accent)] hover:brightness-110 transition-all cursor-pointer"
          >
            SplitSaathi
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all duration-200"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                    ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-slate-100 hover:bg-[var(--bg-elevated)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-[var(--accent)]"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
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
              <p className="text-sm font-medium text-[#1F2937] dark:text-slate-100 truncate">
                {userProfile?.displayName ?? "User"}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {userProfile?.email ?? ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-[#FF6392]/10 transition-all duration-200"
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
