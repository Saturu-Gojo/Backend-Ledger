import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Overview from "./components/Overview";
import Accounts from "./components/Accounts";
import Transactions from "./components/Transactions";
import Ledger from "./components/Ledger";
import AdminPanel from "./components/AdminPanel";
import Toast from "./components/Toast";
import { authAPI, accountsAPI, transactionsAPI } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Check auth session on load
  const checkSession = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setInitialLoading(false);
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        fetchAccountsAndLedger();
      }
    } catch (err) {
      console.error("Session check failed", err);
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch accounts & recent ledger entries
  const fetchAccountsAndLedger = async () => {
    try {
      const [accRes, ledgerRes] = await Promise.all([
        accountsAPI.getMyAccounts(),
        transactionsAPI.getLedger(null, { page: 1, limit: 10 }),
      ]);

      if (accRes.success) setAccounts(accRes.data || []);
      if (ledgerRes.success && ledgerRes.data)
        setLedgerEntries(ledgerRes.data.items || []);
    } catch (err) {
      console.error("Error loading ledger data", err);
    }
  };

  useEffect(() => {
    checkSession();

    const handleLogoutEvent = () => {
      setUser(null);
      setAccounts([]);
      setLedgerEntries([]);
      showToast("Session expired, please login again.", "warning");
    };

    window.addEventListener("auth:logout", handleLogoutEvent);
    return () => window.removeEventListener("auth:logout", handleLogoutEvent);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    fetchAccountsAndLedger();
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setAccounts([]);
    setLedgerEntries([]);
    showToast("Logged out safely.", "info");
  };

  const handleOpenAction = (action) => {
    if (action === "createAccount") {
      setActiveTab("accounts");
    } else {
      setActiveTab("transactions");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-mono tracking-wider uppercase">
            Loading Aether Ledger Core...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        accounts={accounts}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
        {!user ? (
          <AuthModal onAuthSuccess={handleAuthSuccess} showToast={showToast} />
        ) : (
          <>
            {activeTab === "overview" && (
              <Overview
                accounts={accounts}
                ledgerEntries={ledgerEntries}
                onNavigate={setActiveTab}
                onOpenAction={handleOpenAction}
              />
            )}

            {activeTab === "accounts" && (
              <Accounts
                accounts={accounts}
                onRefresh={fetchAccountsAndLedger}
                showToast={showToast}
              />
            )}

            {activeTab === "transactions" && (
              <Transactions
                accounts={accounts}
                onRefreshAccounts={fetchAccountsAndLedger}
                showToast={showToast}
              />
            )}

            {activeTab === "ledger" && (
              <Ledger accounts={accounts} showToast={showToast} />
            )}

            {activeTab === "admin" && user.role === "admin" && (
              <AdminPanel showToast={showToast} />
            )}
          </>
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
