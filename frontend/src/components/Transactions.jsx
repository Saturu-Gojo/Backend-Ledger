import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
} from "lucide-react";
import { transactionsAPI } from "../api";

export default function Transactions({
  accounts,
  defaultTab = "transfer",
  onRefreshAccounts,
  showToast,
}) {
  const [mode, setMode] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchRef, setSearchRef] = useState("");
  const [foundTxn, setFoundTxn] = useState(null);

  // Form fields
  const [transferForm, setTransferForm] = useState({
    fromAccountNumber: "",
    toAccountNumber: "",
    amount: "",
    idempotencyKey: "",
  });

  const [depositForm, setDepositForm] = useState({
    accountNumber: "",
    amount: "",
    idempotencyKey: "",
  });

  const [withdrawForm, setWithdrawForm] = useState({
    accountNumber: "",
    amount: "",
    idempotencyKey: "",
  });

  // Set default selected account when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const firstAccNum = accounts[0].accountNumber;
      if (!selectedAccount) setSelectedAccount(accounts[0]._id);
      if (!transferForm.fromAccountNumber)
        setTransferForm((f) => ({ ...f, fromAccountNumber: firstAccNum }));
      if (!depositForm.accountNumber)
        setDepositForm((f) => ({ ...f, accountNumber: firstAccNum }));
      if (!withdrawForm.accountNumber)
        setWithdrawForm((f) => ({ ...f, accountNumber: firstAccNum }));
    }
  }, [accounts]);

  // Generate UUID for Idempotency Key
  const generateIdempotencyKey = () => {
    return (
      "IDEM-" +
      Math.random().toString(36).substring(2, 10).toUpperCase() +
      "-" +
      Date.now().toString(36).toUpperCase()
    );
  };

  // Auto populate idempotency keys on mount
  useEffect(() => {
    const key = generateIdempotencyKey();
    setTransferForm((f) => ({ ...f, idempotencyKey: key }));
    setDepositForm((f) => ({ ...f, idempotencyKey: key }));
    setWithdrawForm((f) => ({ ...f, idempotencyKey: key }));
  }, [mode]);

  // Fetch transaction history for selected account
  const fetchHistory = async () => {
    if (!selectedAccount) return;
    setHistoryLoading(true);
    try {
      const res = await transactionsAPI.getHistory(selectedAccount);
      if (res.success && res.data) {
        setHistory(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedAccount]);

  // Handlers
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fromAccountNumber: transferForm.fromAccountNumber,
        toAccountNumber: transferForm.toAccountNumber,
        amount: parseFloat(transferForm.amount),
      };
      const res = await transactionsAPI.transfer(
        payload,
        transferForm.idempotencyKey,
      );
      if (res.success) {
        showToast(`Transfer successful! Ref: ${res.data.reference}`, "success");
        onRefreshAccounts();
        fetchHistory();
        setTransferForm((f) => ({
          ...f,
          amount: "",
          idempotencyKey: generateIdempotencyKey(),
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Transfer failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        accountNumber: depositForm.accountNumber,
        amount: parseFloat(depositForm.amount),
      };
      const res = await transactionsAPI.deposit(
        payload,
        depositForm.idempotencyKey,
      );
      if (res.success) {
        showToast(`Deposit completed! Ref: ${res.data.reference}`, "success");
        onRefreshAccounts();
        fetchHistory();
        setDepositForm((f) => ({
          ...f,
          amount: "",
          idempotencyKey: generateIdempotencyKey(),
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Deposit failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        accountNumber: withdrawForm.accountNumber,
        amount: parseFloat(withdrawForm.amount),
      };
      const res = await transactionsAPI.withdraw(
        payload,
        withdrawForm.idempotencyKey,
      );
      if (res.success) {
        showToast(
          `Withdrawal completed! Ref: ${res.data.reference}`,
          "success",
        );
        onRefreshAccounts();
        fetchHistory();
        setWithdrawForm((f) => ({
          ...f,
          amount: "",
          idempotencyKey: generateIdempotencyKey(),
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Withdrawal failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLookupRef = async (e) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    try {
      const res = await transactionsAPI.getByReference(searchRef.trim());
      if (res.success) {
        setFoundTxn(res.data);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Transaction not found",
        "error",
      );
      setFoundTxn(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="glass-panel p-6 lg:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Money Movement Core
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Transactions & Transfer Hub
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Execute instant transfers, deposits, and withdrawals with idempotency
          key deduplication.
        </p>

        {/* Navigation Toggles */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setMode("transfer")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "transfer"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg glow-emerald"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            ACID Transfer
          </button>

          <button
            onClick={() => setMode("deposit")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "deposit"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg glow-emerald"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Deposit Funds
          </button>

          <button
            onClick={() => setMode("withdraw")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "withdraw"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw
          </button>

          <button
            onClick={() => setMode("lookup")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "lookup"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            <Search className="w-4 h-4" />
            Reference Lookup
          </button>
        </div>
      </div>

      {/* Main Action Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-1 glass-panel p-6 border border-white/10">
          {mode === "transfer" && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                Transfer Funds
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  From Account
                </label>
                <select
                  value={transferForm.fromAccountNumber}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      fromAccountNumber: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  required
                >
                  {accounts &&
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc.accountNumber}>
                        {acc.accountNumber} (₹
                        {(acc.balance || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  To Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="ACC-XXXXXXXXXX"
                  value={transferForm.toAccountNumber}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      toAccountNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="1000"
                  value={transferForm.amount}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, amount: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Idempotency Key
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setTransferForm({
                        ...transferForm,
                        idempotencyKey: generateIdempotencyKey(),
                      })
                    }
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={transferForm.idempotencyKey}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      idempotencyKey: e.target.value,
                    })
                  }
                  className="w-full bg-gray-950 border border-white/10 rounded-xl p-2.5 text-gray-400 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg glow-emerald transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirm Transfer"
                )}
              </button>
            </form>
          )}

          {mode === "deposit" && (
            <form onSubmit={handleDeposit} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                Deposit Funds
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Target Account
                </label>
                <select
                  value={depositForm.accountNumber}
                  onChange={(e) =>
                    setDepositForm({
                      ...depositForm,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  required
                >
                  {accounts &&
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc.accountNumber}>
                        {acc.accountNumber} (₹
                        {(acc.balance || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="5000"
                  value={depositForm.amount}
                  onChange={(e) =>
                    setDepositForm({ ...depositForm, amount: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 font-bold"
                />

                {/* Quick Presets */}
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setDepositForm({
                          ...depositForm,
                          amount: amt.toString(),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs text-gray-300 font-medium transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg glow-emerald transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Execute Deposit"
                )}
              </button>
            </form>
          )}

          {mode === "withdraw" && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                Withdraw Funds
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Source Account
                </label>
                <select
                  value={withdrawForm.accountNumber}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
                  required
                >
                  {accounts &&
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc.accountNumber}>
                        {acc.accountNumber} (₹
                        {(acc.balance || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Withdraw Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="2000"
                  value={withdrawForm.amount}
                  onChange={(e) =>
                    setWithdrawForm({ ...withdrawForm, amount: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirm Withdrawal"
                )}
              </button>
            </form>
          )}

          {mode === "lookup" && (
            <form onSubmit={handleLookupRef} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                Transaction Reference Lookup
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                  Reference Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="TXN-XXXXXXXXXXXX"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg transition-all duration-200"
              >
                Lookup Transaction
              </button>

              {foundTxn && (
                <div className="mt-4 p-4 rounded-xl bg-gray-900/90 border border-blue-500/30 space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400">Ref:</span>
                    <span className="text-white font-bold">
                      {foundTxn.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-bold text-blue-400">
                      {foundTxn.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-bold text-white">
                      ₹{foundTxn.amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold text-emerald-400">
                      {foundTxn.status}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date(foundTxn.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Transaction History Column */}
        <div className="lg:col-span-2 glass-panel p-6 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Transaction History Log
              </h3>
              <p className="text-xs text-gray-400">
                Filtered by selected account
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none"
              >
                {accounts &&
                  accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountNumber}
                    </option>
                  ))}
              </select>

              <button
                onClick={fetchHistory}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                title="Reload History"
              >
                <RefreshCw
                  className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history && history.length > 0 ? (
                  history.map((txn) => (
                    <tr
                      key={txn._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-xs text-emerald-400 font-bold">
                        {txn.reference}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-gray-300">
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        ₹{txn.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            txn.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : txn.status === "FAILED"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {txn.status === "COMPLETED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-400">
                        {new Date(txn.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-gray-500 text-sm"
                    >
                      No transactions recorded for this account.
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
