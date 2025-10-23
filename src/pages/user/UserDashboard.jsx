// src/pages/user/UserDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import OverviewCard from "../../components/OverviewCard";
import EmptyState from "../../components/EmptyState";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function formatDateField(field) {
  if (!field) return "—";
  try {
    if (typeof field === "string") {
      const d = new Date(field);
      return isNaN(d) ? field : d.toLocaleDateString();
    }
    if (typeof field.toDate === "function") {
      return field.toDate().toLocaleDateString();
    }
    return String(field);
  } catch {
    return "—";
  }
}

export default function UserDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // useRef to track previous statuses to detect updates
  const prevStatusesRef = useRef({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestore, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // detect changes (e.g. librarian updated a transaction)
        list.forEach((tx) => {
          const prevStatus = prevStatusesRef.current[tx.id];
          if (prevStatus && prevStatus !== tx.status) {
            // show toast based on new status
            if (tx.status === "approved") {
              toast.success(`✅ Your request for "${tx.title}" was approved!`);
            } else if (tx.status === "rejected") {
              toast.error(`❌ Your request for "${tx.title}" was rejected.`);
            } else if (tx.status === "borrowed") {
              toast.info(`📚 You have borrowed "${tx.title}".`);
            } else if (tx.status === "returned") {
              toast.success(`📦 You returned "${tx.title}".`);
            }
          }
          prevStatusesRef.current[tx.id] = tx.status;
        });

        setTransactions(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to transactions:", err);
        setLoading(false);
        toast.error("Failed to load your transactions.");
      }
    );

    return () => unsubscribe();
  }, []);

  const borrowed = transactions.filter((t) => t.status === "borrowed");
  const returned = transactions.filter((t) => t.status === "returned");
  const pending = transactions.filter((t) => t.status === "pending");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading your transactions...
      </div>
    );
  }

  if (!auth.currentUser) {
    return <EmptyState message="Please sign in to see your dashboard." />;
  }

  if (transactions.length === 0) {
    return <EmptyState message="You haven’t made any transactions yet." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewCard title="Borrowed Items" count={borrowed.length} color="indigo" />
        <OverviewCard title="Returned" count={returned.length} color="emerald" />
        <OverviewCard title="Pending Requests" count={pending.length} color="amber" />
      </div>

      {/* Active Borrowed Items */}
      <div className="bg-slate-800 p-4 rounded shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Active Borrowed Items</h3>
          {/* <button
            onClick={() => nav("/user/request")}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-white"
          >
            + Request Book
          </button> */}
        </div>

        {borrowed.length === 0 ? (
          <div className="text-gray-400">No active borrowed items.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="text-gray-400 border-b border-slate-700">
                <tr>
                  <th className="py-2 text-left">Title</th>
                  <th className="py-2 text-center">Borrowed</th>
                  <th className="py-2 text-center">Due</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowed.map((t) => (
                  <tr
                    key={t.id || `${t.title}-${t.borrowDate}`}
                    className="border-b border-slate-700 hover:bg-slate-700"
                  >
                    <td className="py-2">{t.title}</td>
                    <td className="text-center">{formatDateField(t.borrowDate)}</td>
                    <td className="text-center">{formatDateField(t.dueDate)}</td>
                    <td className="text-center capitalize">{t.status}</td>
                    <td className="text-center">
                      <button
                        onClick={() => (t.materialId ? nav(`/view-material/${t.materialId}`) : null)}
                        className="text-indigo-400 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-slate-800 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3 text-white">Transaction History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="text-gray-400 border-b border-slate-700">
              <tr>
                <th className="py-2 text-left">Title</th>
                <th className="py-2 text-center">Borrowed</th>
                <th className="py-2 text-center">Returned</th>
                <th className="py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id || `${t.title}-${t.borrowDate}`}
                  className="border-b border-slate-700 hover:bg-slate-700"
                >
                  <td className="py-2">{t.title}</td>
                  <td className="text-center">{formatDateField(t.borrowDate)}</td>
                  <td className="text-center">{formatDateField(t.returnDate)}</td>
                  <td className="text-center capitalize">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
