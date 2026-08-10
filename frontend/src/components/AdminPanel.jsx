import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { accountsAPI } from "../api";

export default function AdminPanel({ showToast }) {
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountsAPI.getAllAccounts();
      if (res.success && res.data) {
        setAllAccounts(res.data);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to fetch admin account list",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleToggleFreeze = async (accountId, currentStatus) => {
    setUpdatingId(accountId);
    try {
      if (currentStatus === "ACTIVE") {
        const res = await accountsAPI.freezeAccount(accountId);
        if (res.success) {
          showToast(`Account ${res.data.accountNumber} frozen`, "warning");
        }
      } else {
        const res = await accountsAPI.unfreezeAccount(accountId);
        if (res.success) {
          showToast(`Account ${res.data.accountNumber} reactivated`, "success");
        }
      }
      fetchAllAccounts();
    } catch (err) {
      showToast(err.response?.data?.message || "Status change failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Administrative Override
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            System Admin Control Center
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Monitor system-wide accounts, freeze suspicious vaults, and inspect
            global user states.
          </p>
        </div>

        <button
          onClick={fetchAllAccounts}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors self-start md:self-auto"
          title="Refresh All System Accounts"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Accounts Table */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Account Number</th>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allAccounts && allAccounts.length > 0 ? (
                allAccounts.map((acc) => (
                  <tr
                    key={acc._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400 font-bold">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {acc.user?.name || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs font-mono">
                      {acc.user?.email || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{(acc.balance || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          acc.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {acc.status === "ACTIVE" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        disabled={updatingId === acc._id}
                        onClick={() => handleToggleFreeze(acc._id, acc.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          acc.status === "ACTIVE"
                            ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {acc.status === "ACTIVE" ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Freeze
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            Unfreeze
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 text-sm"
                  >
                    No accounts registered in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
