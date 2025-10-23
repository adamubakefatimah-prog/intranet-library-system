import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext";
import { Loader2, FileText, Inbox } from "lucide-react";

export default function UserTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    transactionService.getUserTransactions(user.uid).then((res) => {
      setTransactions(res);
      setLoading(false);
    });
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" />
        Loading your transactions...
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText /> My Transactions
      </h1>

      {transactions.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 shadow-md">
          <Inbox className="w-12 h-12 mb-3 text-gray-500" />
          <p className="text-lg font-medium">No transactions found</p>
          <p className="text-sm text-gray-500">
            You haven’t made any transactions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">{tx.materialTitle}</p>
                <p className="text-sm text-gray-400">
                  Status: {tx.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
