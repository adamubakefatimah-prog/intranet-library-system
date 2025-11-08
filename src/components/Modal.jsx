import { X, Info } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Confirm",
  onConfirm,
  confirmDisabled = false,
  metaInfo = {}, // ✅ new prop for quick details
  instructions = "", // ✅ optional guidance
}) {
  if (!isOpen) return null;

  const { userName, materialTitle, admissionNumber, userEmail, status } = metaInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 w-full max-w-lg mx-4 rounded-2xl shadow-2xl border border-slate-700/60 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/50">
          <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Block */}
        {(userName || materialTitle) && (
          <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-700/50 text-sm space-y-1">
            <p>
              <span className="font-medium text-slate-300">User:</span>{" "}
              <span className="text-slate-100">{userName || "—"}</span>
              {admissionNumber && (
                <span className="ml-2 text-xs text-slate-400">
                  (ID: {admissionNumber})
                </span>
              )}
            </p>
            {userEmail && (
              <p>
                <span className="font-medium text-slate-300">Email:</span>{" "}
                <span className="text-slate-100">{userEmail}</span>
              </p>
            )}
            <p>
              <span className="font-medium text-slate-300">Material:</span>{" "}
              <span className="text-slate-100">{materialTitle || "—"}</span>
            </p>
            {status && (
              <p>
                <span className="font-medium text-slate-300">Current Status:</span>{" "}
                <span className="capitalize">{status}</span>
              </p>
            )}
          </div>
        )}

        {/* Optional instructions */}
        {instructions && (
          <div className="px-6 py-3 text-amber-300 bg-amber-500/10 border-b border-amber-400/20 text-sm flex items-start gap-2">
            <Info size={16} className="mt-0.5" />
            <p>{instructions}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 space-y-4">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 font-medium transition-all"
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
    </div>
  );
}
