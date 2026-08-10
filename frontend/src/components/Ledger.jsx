import React, { useState, useEffect } from "react";
import {
  BookOpen,
  RefreshCw,
  Layers,
  ShieldCheck,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { transactionsAPI } from "../api";

export default function Ledger({ accounts, showToast }) {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAccount, setFilterAccount] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getLedger(filterAccount || null, {
        page,
        limit: 50,
      });
      if (res.success && res.data) {
        setLedgerEntries(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to fetch ledger entries",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filterAccount, page]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Immutable Audit Trail
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Double-Entry Ledger Log
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Every movement creates an append-only DEBIT and CREDIT record with
            derived balance tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 border border-white/10 px-3 py-2 rounded-xl">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-white text-xs font-mono focus:outline-none"
            >
              <option value="">All User Accounts</option>
              {accounts &&
                accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountNumber}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={fetchLedger}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider text-gray-300">
            Total Permanent Entries:{" "}
            <span className="text-emerald-400 font-bold">{totalCount}</span>
          </span>
          <span>
            Showing Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Movement Type</th>
                <th className="py-3.5 px-4">Account Number</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Balance After</th>
                <th className="py-3.5 px-4">Txn Reference</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledgerEntries && ledgerEntries.length > 0 ? (
                ledgerEntries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          entry.type === "CREDIT"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {entry.type === "CREDIT" ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-white font-bold">
                      {entry.account?.accountNumber || "Account"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{entry.amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      ₹{entry.balanceAfter?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-purple-300">
                      {entry.transaction?.reference || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-gray-500 text-sm"
                  >
                    No double-entry ledger records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-4 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 font-medium"
            >
              &larr; Previous Page
            </button>
            <span className="text-gray-400">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 font-medium"
            >
              Next Page &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
