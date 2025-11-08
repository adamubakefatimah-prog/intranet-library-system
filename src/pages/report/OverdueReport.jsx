import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import { auditService } from "../../services/auditService";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";

export default function OverdueReports() {
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverdue();
  }, []);

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const transactions = await transactionService.getAllTransactions();
      const today = new Date();

      const overdue = transactions.filter((tx) => {
        // tx.dueDate may be Firestore Timestamp or JS Date string/object
        const due =
          tx.dueDate && typeof tx.dueDate.toDate === "function"
            ? tx.dueDate.toDate()
            : tx.dueDate
            ? new Date(tx.dueDate)
            : null;

        return tx.status === "borrowed" && due && due < today;
      });

      console.log("Overdue transactions:", overdue);
      setOverdueList(overdue);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load overdue reports.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tx) => {
    setSelectedTx(tx);
    setComment("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTx(null);
    setComment("");
  };

  const handleMarkReturned = async () => {
    if (!selectedTx) return;
    try {
      setActionLoading(true);

      await transactionService.updateTransactionStatus(selectedTx.id, "returned", {
        returnDate: new Date(),
        comment: comment || "Marked as returned (overdue).",
      });

      await auditService.createLog({
        action: "returned (overdue)",
        transactionId: selectedTx.id,
        userName: selectedTx.userName,
        userId: selectedTx.userId,
        admissionNumber: selectedTx.admissionNumber || "",
        materialId: selectedTx.recordId,
        materialTitle: selectedTx.title,
        comment: comment || "Returned late",
      });

      toast.success("Material marked as returned successfully.");
      setOverdueList((prev) => prev.filter((t) => t.id !== selectedTx.id));
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  const daysOverdue = (dueDate) => {
    const today = new Date();
    if (!dueDate) return 0;
    const diff = today - dueDate;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

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
    <div className="p-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-end space-x-2 mb-6 pb-3">
        <button
          onClick={fetchOverdue}
          className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Refresh
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
        >
          ← Back
        </button>
      </div>

      {/* Table or loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading overdue data...
        </div>
      ) : overdueList.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-slate-800 rounded-lg">
          🎉 No overdue materials at the moment.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-800 rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-slate-700 text-gray-200 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Adm No.</th>
                <th className="p-3">Material</th>
                <th className="p-3">Borrowed</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-center">Days Overdue</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdueList.map((tx) => {
                const due =
                  tx.dueDate && typeof tx.dueDate.toDate === "function"
                    ? tx.dueDate.toDate()
                    : new Date(tx.dueDate);

                return (
                  <tr
                    key={tx.id}
                    className="border-t border-slate-700 hover:bg-slate-700/40 transition"
                  >
                    <td className="p-3 capitalize">{tx.userName}</td>
                    <td className="p-3">{tx.admissionNumber || "—"}</td>
                    <td className="p-3">{tx.title}</td>
                    <td className="p-3">{formatDate(tx.borrowDate)}</td>
                    <td className="p-3 text-red-400">{formatDate(tx.dueDate)}</td>
                    <td className="p-3 text-center text-yellow-400 font-medium">
                      {daysOverdue(due)} days
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openModal(tx)}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm transition text-white"
                      >
                        Returned
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Confirm Return"
        confirmText="Mark Returned"
        onConfirm={handleMarkReturned}
        confirmDisabled={actionLoading}
      >
        {selectedTx && (
          <>
            <p className="text-sm text-gray-300">
              Are you sure you want to mark <strong>{selectedTx.title}</strong>{" "}
              (borrowed by <strong>{selectedTx.userName}</strong>) as returned?
            </p>
            <textarea
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white mt-3"
              rows={3}
              placeholder="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
