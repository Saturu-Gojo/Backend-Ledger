import React, { useState } from "react";
import {
  Landmark,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { authAPI } from "../api";

export default function AuthModal({ onAuthSuccess, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        if (res.success && res.data) {
          const { user, accessToken, refreshToken } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));
          showToast("Successfully logged in!", "success");
          onAuthSuccess(user);
        }
      } else {
        const res = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (res.success && res.data) {
          const { user, accessToken, refreshToken } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));
          showToast("Account registered successfully!", "success");
          onAuthSuccess(user);
        }
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Authentication failed";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 shadow-2xl relative border border-white/10 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white mb-4 glow-emerald">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? "Welcome Back" : "Create Ledger Account"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLogin
              ? "Access your double-entry accounts & ACID ledger"
              : "Start tracking immutable transactions with bank-grade security"}
          </p>
        </div>

        {/* Form Toggles */}
        <div className="flex bg-gray-900/80 p-1 rounded-xl mb-6 border border-white/5 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-gray-900/90 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-gray-900/90 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-900/90 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg glow-emerald transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {isLogin ? "Sign In to Dashboard" : "Create Account"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JWT Secured</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Double-Entry ACID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
