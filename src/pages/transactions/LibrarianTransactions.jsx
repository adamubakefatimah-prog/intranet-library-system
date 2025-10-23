// src/pages/transactions/LibrarianTransactions.jsx
import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import Modal from "../../components/Modal";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function LibrarianTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [comment, setComment] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAllTransactions();
      setTransactions(res || []);
    } catch (err) {
      console.error("Failed loading transactions", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const openModal = (tx, type) => {
    setSelectedTx(tx);
    setModalType(type);
    setComment("");
    setDueDate("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedTx(null);
    setComment("");
    setDueDate("");
  };

  const handleConfirm = async () => {
    if (!selectedTx || !modalType) return;

    const id = selectedTx.id;
    let newStatus = "";

    if (modalType === "approve") newStatus = "approved";
    if (modalType === "reject") newStatus = "rejected";
    if (modalType === "borrow") newStatus = "borrowed";
    if (modalType === "return") newStatus = "returned";

    if (newStatus === "borrowed" && !dueDate) {
      toast.warn("Please set a due date before confirming borrow.");
      return;
    }

    try {
      setActionLoadingId(id);

      const extraData = {};
      if (comment) extraData.comment = comment;

      if (newStatus === "borrowed") {
        const now = new Date();
        const due = new Date(`${dueDate}T00:00:00`);
        extraData.borrowDate = now.toISOString();
        extraData.dueDate = due.toISOString();
      }

      if (newStatus === "returned") {
        extraData.returnDate = new Date().toISOString();
      }

      await transactionService.updateTransactionStatus(
        id,
        newStatus,
        extraData
      );

      setTransactions((prev) => {
        if (newStatus === "returned") {
          return prev.filter((t) => t.id !== id);
        }
        return prev.map((t) =>
          t.id === id ? { ...t, status: newStatus, ...extraData } : t
        );
      });

      toast.success(
        newStatus === "returned"
          ? "Transaction marked returned and removed from list."
          : `Transaction updated to "${newStatus}"`
      );
    } catch (err) {
      console.error("Action failed", err);
      toast.error(err?.message || "Failed to update transaction");
    } finally {
      setActionLoadingId(null);
      closeModal();
    }
  };

  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayed = transactions.slice(startIndex, startIndex + itemsPerPage);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  try {
    let date;

    // Handle Firestore Timestamp
    if (typeof dateValue.toDate === "function") {
      date = dateValue.toDate();
    }
    // Handle ISO string (e.g., "2025-10-19T00:00:00Z")
    else if (typeof dateValue === "string") {
      if (dateValue.trim() === "") return "—";
      const parsed = new Date(dateValue);
      if (isNaN(parsed.getTime())) return "—";
      date = parsed;
    }
    // Handle Unix timestamp (milliseconds)
    else if (typeof dateValue === "number") {
      date = new Date(dateValue);
    }
    // Otherwise give up gracefully
    else {
      return "—";
    }

    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("❌ Error formatting date:", error, dateValue);
    return "—";
  }
};


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/audit-log"
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm text-white"
          >
            View Audit Log
          </Link>
          <button
            onClick={fetchTransactions}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading transactions...
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No transactions to show.
        </div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-lg shadow">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-slate-700 text-gray-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Borrow Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-slate-700 hover:bg-slate-700/30 transition"
                  >
                    <td className="p-3 text-white">
                      {tx.userName || tx.userEmail || tx.userId}
                    </td>
                    <td className="p-3 text-white">
                      {tx.title || tx.materialTitle}
                    </td>
                    <td>{formatDate(tx.borrowDate)}</td>
                    <td>{formatDate(tx.dueDate)}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          tx.status === "approved"
                            ? "bg-blue-700/40 text-blue-200"
                            : tx.status === "pending"
                            ? "bg-yellow-700/30 text-yellow-200"
                            : tx.status === "borrowed"
                            ? "bg-indigo-700/30 text-indigo-200"
                            : tx.status === "rejected"
                            ? "bg-red-700/30 text-red-200"
                            : tx.status === "returned"
                            ? "bg-green-700/30 text-green-200"
                            : "bg-slate-700/30 text-slate-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm text-white transition-all duration-200"
                          onClick={() =>
                            setActionLoadingId((prev) =>
                              prev === tx.id ? null : tx.id
                            )
                          }
                        >
                          Actions ▾
                        </button>

                        {/* Dropdown Menu */}
                        {actionLoadingId === tx.id && (
                          <div
                            className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-100
                   origin-top-right animate-dropdown"
                          >
                            {[
                              {
                                label: "Approve",
                                color: "text-green-400",
                                action: "approve",
                              },
                              {
                                label: "Borrow",
                                color: "text-indigo-400",
                                action: "borrow",
                              },
                              {
                                label: "Return",
                                color: "text-yellow-400",
                                action: "return",
                              },
                              {
                                label: "Reject",
                                color: "text-red-400",
                                action: "reject",
                              },
                            ].map(({ label, color, action }) => (
                              <button
                                key={action}
                                onClick={() => openModal(tx, action)}
                                className={`block w-full text-left px-3 py-2 hover:bg-slate-700 text-sm transition-colors duration-150 ${color}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-gray-300">
            <div className="text-sm">
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, transactions.length)} of{" "}
              {transactions.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm">
                Page {currentPage} / {totalPages}
              </div>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalType === "approve"
            ? "Approve Request"
            : modalType === "reject"
            ? "Reject Request"
            : modalType === "borrow"
            ? "Mark as Borrowed"
            : modalType === "return"
            ? "Confirm Return"
            : "Action"
        }
        confirmText={modalType === "borrow" ? "Confirm Borrow" : "Confirm"}
        onConfirm={handleConfirm}
        confirmDisabled={
          actionLoadingId !== null && actionLoadingId === selectedTx?.id
        }
      >
        {selectedTx ? (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-slate-400">User</div>
              <div className="text-sm font-medium">
                {selectedTx.userName ||
                  selectedTx.userEmail ||
                  selectedTx.userId}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400">Material</div>
              <div className="text-sm font-medium">
                {selectedTx.title || selectedTx.materialTitle}
              </div>
            </div>

            {(modalType === "approve" || modalType === "reject") && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Add an optional note for the user..."
                  className="w-full bg-slate-800 text-slate-100 p-2 rounded border border-slate-700"
                />
              </div>
            )}

            {modalType === "borrow" && (
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Borrow date</div>
                <div className="text-sm font-medium text-white">
                  {format(new Date(), "MMM dd, yyyy")}
                </div>

                <div className="text-sm text-slate-400 mt-2">Set due date</div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-slate-800 text-slate-100 p-2 rounded border border-slate-700"
                />
              </div>
            )}

            {modalType === "return" && (
              <div>
                <p className="text-sm text-slate-300">
                  Confirm that the material has been returned. This will remove
                  the transaction from the list.
                </p>
                <div className="mt-2">
                  <label className="block text-sm text-slate-300 mb-1">
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    placeholder="Optional note"
                    className="w-full bg-slate-800 text-slate-100 p-2 rounded border border-slate-700"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
}
