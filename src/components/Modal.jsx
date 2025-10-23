import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Confirm",
  onConfirm,
  confirmDisabled = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 w-full max-w-lg mx-4 rounded-2xl shadow-2xl border border-slate-700/60 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/50">
          <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${
              confirmDisabled
                ? "bg-indigo-500/50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-800/30"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Simple Animations */}
      {/* <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out forwards;
        }
      `}</style> */}
    </div>
  );
}
