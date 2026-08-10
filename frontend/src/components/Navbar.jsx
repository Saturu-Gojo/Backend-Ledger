import React from "react";
import {
  Landmark,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BookOpen,
  ShieldAlert,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  accounts,
}) {
  const totalBalance = (accounts || []).reduce(
    (acc, curr) => acc + (curr.balance || 0),
    0,
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 glow-emerald text-white">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Aether Ledger
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                ACID Double-Entry Core
              </span>
            </div>
          </div>

          {/* Mobile User Tag */}
          <div className="flex md:hidden items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium truncate max-w-[100px]">
              {user?.name}
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        {user && (
          <nav className="flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === "accounts"
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wallet className="w-4 h-4" />
              Accounts ({accounts?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === "transactions"
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Money Movement
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === "ledger"
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Ledger Audit
            </button>

            {user.role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30"
                    : "text-purple-300/70 hover:text-purple-300 hover:bg-purple-500/10"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Admin Panel
              </button>
            )}
          </nav>
        )}

        {/* User Info & Actions */}
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-white">
                  {user.name}
                </span>
                {user.role === "admin" ? (
                  <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Total Balance:{" "}
                <span className="text-emerald-400 font-bold">
                  ₹{totalBalance.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
