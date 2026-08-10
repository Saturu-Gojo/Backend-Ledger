import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borderColors = {
    success: "border-emerald-500/40 bg-emerald-950/80",
    error: "border-rose-500/40 bg-rose-950/80",
    warning: "border-amber-500/40 bg-amber-950/80",
    info: "border-blue-500/40 bg-blue-950/80",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-white max-w-md ${borderColors[toast.type] || borderColors.info}`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium pr-2">{toast.message}</p>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
