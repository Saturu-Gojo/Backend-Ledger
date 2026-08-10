import React, { useState } from "react";
import {
  Wallet,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { accountsAPI } from "../api";

export default function Accounts({ accounts, onRefresh, showToast }) {
  const [copiedId, setCopiedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [currency, setCurrency] = useState("INR");

  const handleCopy = (accNum) => {
    navigator.clipboard.writeText(accNum);
    setCopiedId(accNum);
    showToast(`Copied ${accNum} to clipboard!`, "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await accountsAPI.createAccount({ currency });
      if (res.success) {
        showToast(`Account created: ${res.data.accountNumber}`, "success");
        onRefresh();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create account",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            ACID Double-Entry Vaults
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Accounts Management
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your accounts with optimistic concurrency versioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Refresh Accounts"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Quick Create Form */}
          <form
            onSubmit={handleCreateAccount}
            className="flex items-center gap-2"
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-semibold focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg glow-emerald transition-all duration-200 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {creating ? "Creating..." : "Open New Account"}
            </button>
          </form>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts && accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              key={acc._id}
              className="glass-panel p-6 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {acc.currency} Vault
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    acc.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {acc.status === "ACTIVE" ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  {acc.status}
                </span>
              </div>

              {/* Account Number */}
              <div className="mb-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Account Number
                </span>
                <div className="flex items-center justify-between bg-gray-900/80 p-2.5 rounded-xl border border-white/5 mt-1">
                  <span className="font-mono text-sm font-bold text-white tracking-wider">
                    {acc.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(acc.accountNumber)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedId === acc.accountNumber ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Available Ledger Balance
                </span>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                  ₹{(acc.balance || 0).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>Version Lock: v{acc.version ?? 0}</span>
                <span>
                  Created: {new Date(acc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 glass-panel">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white">
              No Accounts Created Yet
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-4">
              Create your first ledger account to start executing double-entry
              transactions with ACID guarantees.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
