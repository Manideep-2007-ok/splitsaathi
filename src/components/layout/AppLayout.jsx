import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { Menu } from "lucide-react";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[#1F2937] dark:hover:text-[#F9F9F9] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <Navbar />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
