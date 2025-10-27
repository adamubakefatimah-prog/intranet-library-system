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

  const [dropdownOpenId, setDropdownOpenId] = useState(null);
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
    setDropdownOpenId(null);
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
      toast.warning("Please set a due date before confirming borrow.");
      return;
    }

    try {
      setActionLoadingId(id);
      const extraData = {};

      if (comment) extraData.comment = comment;

      if (newStatus === "borrowed") {
        extraData.borrowDate = new Date().toISOString();
        extraData.dueDate = new Date(`${dueDate}T00:00:00`).toISOString();
      }

      if (newStatus === "returned") {
        extraData.returnDate = new Date().toISOString();
      }

      await transactionService.updateTransactionStatus(id, newStatus, extraData);

      setTransactions((prev) =>
        newStatus === "returned"
          ? prev.filter((t) => t.id !== id)
          : prev.map((t) =>
              t.id === id ? { ...t, status: newStatus, ...extraData } : t
            )
      );

      toast.success(
        newStatus === "returned"
          ? "✔ Returned and removed from list."
          : `✔ Status updated to: ${newStatus}`
      );
    } catch (err) {
      toast.error("Failed to update transaction");
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
      if (typeof dateValue.toDate === "function") {
        date = dateValue.toDate();
      } else {
        date = new Date(dateValue);
      }
      return isNaN(date.getTime()) ? "—" : format(date, "MMM dd, yyyy");
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/audit-log"
          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm text-white"
        >
          Audit Log
        </Link>

        <button
          onClick={fetchTransactions}
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No transactions available.
        </div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-lg shadow">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-slate-700 text-gray-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Borrowed</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayed.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-3 capitalize">{tx.userName || tx.userEmail}</td>
                    <td className="p-3">{tx.title}</td>
                    <td>{formatDate(tx.borrowDate)}</td>
                    <td>{formatDate(tx.dueDate)}</td>
                    <td className="p-3 text-xs">
                      <span className={`px-2 py-1 rounded ${{
                        pending: "bg-yellow-700/30 text-yellow-200",
                        approved: "bg-blue-700/30 text-blue-200",
                        borrowed: "bg-indigo-700/30 text-indigo-200",
                        returned: "bg-green-700/30 text-green-200",
                        rejected: "bg-red-700/30 text-red-200",
                      }[tx.status]}`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-3 text-right relative">
                      <button
                        onClick={() =>
                          setDropdownOpenId(
                            dropdownOpenId === tx.id ? null : tx.id
                          )
                        }
                        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
                      >
                        Actions ▾
                      </button>

                      {dropdownOpenId === tx.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-20">
                          {["approve", "borrow", "return", "reject"].map(
                            (action) => (
                              <button
                                key={action}
                                onClick={() => openModal(tx, action)}
                                className="block w-full text-left px-3 py-2 hover:bg-slate-700 text-sm capitalize"
                              >
                                {action}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-gray-300 text-sm">
            <div>
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
              <span>
                {currentPage} / {totalPages}
              </span>
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        confirmText="Confirm"
        onConfirm={handleConfirm}
        confirmDisabled={actionLoadingId === selectedTx?.id} // ✅ Fixed
        title={
          modalType === "approve"
            ? "Approve Request"
            : modalType === "reject"
            ? "Reject Request"
            : modalType === "borrow"
            ? "Mark as Borrowed"
            : "Confirm Return"
        }
      >
        {selectedTx ? (
          <>
            <p className="text-sm text-gray-300">
              Action on <strong>{selectedTx.title}</strong> for{" "}
              <strong>{selectedTx.userName}</strong>
            </p>

            {(modalType === "approve" ||
              modalType === "reject" ||
              modalType === "return") && (
              <textarea
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white mt-3"
                rows={3}
                placeholder="Comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            )}

            {modalType === "borrow" && (
              <input
                type="date"
                className="w-full p-2 mt-3 bg-slate-800 border border-slate-700 rounded text-white"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            )}
          </>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
}
