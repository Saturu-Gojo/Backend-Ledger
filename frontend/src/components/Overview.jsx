import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";

export default function Overview({
  accounts,
  ledgerEntries,
  onNavigate,
  onOpenAction,
}) {
  const totalBalance = (accounts || []).reduce(
    (acc, curr) => acc + (curr.balance || 0),
    0,
  );
  const activeAccountsCount = (accounts || []).filter(
    (a) => a.status === "ACTIVE",
  ).length;
  const recentLedger = (ledgerEntries || []).slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="glass-panel p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Live ACID System Active
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Ledger Overview
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time balance derivation backed by immutable double-entry
              ledger entries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAction("deposit")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-semibold transition-all duration-200"
            >
              <ArrowDownRight className="w-4 h-4" />
              Quick Deposit
            </button>

            <button
              onClick={() => onOpenAction("withdraw")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-sm font-semibold transition-all duration-200"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>

            <button
              onClick={() => onOpenAction("transfer")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg glow-emerald transition-all duration-200"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transfer Money
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Net Balance */}
        <div className="glass-panel p-6 border-emerald-500/20 relative group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Net Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            ₹{totalBalance.toLocaleString("en-IN")}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Derived from Double-Entry Ledger</span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="glass-panel p-6 border-blue-500/20 relative group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Active Accounts
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {activeAccountsCount}{" "}
            <span className="text-sm font-normal text-gray-400">
              / {accounts?.length || 0}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Status: Healthy</span>
            <button
              onClick={() => onNavigate("accounts")}
              className="text-blue-400 hover:underline font-medium"
            >
              Manage &rarr;
            </button>
          </div>
        </div>

        {/* Total Ledger Entries */}
        <div className="glass-panel p-6 border-purple-500/20 relative group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ledger Audits
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {ledgerEntries?.length || 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Immutable Records</span>
            <button
              onClick={() => onNavigate("ledger")}
              className="text-purple-400 hover:underline font-medium"
            >
              View Log &rarr;
            </button>
          </div>
        </div>

        {/* System Security Status */}
        <div className="glass-panel p-6 border-teal-500/20 relative group hover:border-teal-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Idempotency & Isolation
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            Optimistic Lock
          </div>
          <div className="mt-2 text-xs text-teal-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block mr-1" />
            <span>Race Condition Proof</span>
          </div>
        </div>
      </div>

      {/* Account Cards & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounts Summary */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                My Accounts
              </h3>
              <button
                onClick={() => onOpenAction("createAccount")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition-colors"
                title="Create Account"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {accounts && accounts.length > 0 ? (
                accounts.map((acc) => (
                  <div
                    key={acc._id}
                    className="p-4 rounded-xl bg-gray-900/60 border border-white/5 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span className="font-mono text-emerald-400 font-bold">
                        {acc.accountNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          acc.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      ₹{(acc.balance || 0).toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        {acc.currency}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No accounts found. Click Create Account to start.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("accounts")}
            className="w-full mt-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
          >
            Manage All Accounts &rarr;
          </button>
        </div>

        {/* Recent Double-Entry Activity */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                Recent Ledger Entries
              </h3>
              <p className="text-xs text-gray-400">
                Direct double-entry ledger stream
              </p>
            </div>
            <button
              onClick={() => onNavigate("ledger")}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View Full Ledger &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Balance After</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLedger && recentLedger.length > 0 ? (
                  recentLedger.map((entry) => (
                    <tr
                      key={entry._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            entry.type === "CREDIT"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {entry.type === "CREDIT" ? "+" : "-"} {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-gray-300">
                        {entry.account?.accountNumber || "Account"}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        ₹{entry.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400">
                        ₹{entry.balanceAfter?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      No ledger entries yet. Execute a transfer, deposit, or
                      withdrawal!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
