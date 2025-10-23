import { useEffect, useState } from "react";
import { borrowService } from "../services/borrowService";
import { useAuth } from "../context/AuthContext";
import { Loader2, BookOpen, Calendar, Inbox } from "lucide-react";

export default function Borrow() {
  const { firebaseUser } = useAuth();
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const fetchBorrowed = async () => {
      try {
        const res = await borrowService.getBorrowed(firebaseUser.uid);
        setBorrowed(res);
      } catch (err) {
        console.error("Error fetching borrowed items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowed();
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-400">
        <Loader2 className="animate-spin mr-2" />
        Loading borrowed items...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-800 rounded-lg shadow-md">
        <Inbox className="w-12 h-12 mb-3 text-gray-500" />
        <p className="text-lg font-medium">Please log in to view borrowed items</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BookOpen /> My Borrowed Materials
      </h1>

      {borrowed.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 shadow-md">
          <Inbox className="w-12 h-12 mb-3 text-gray-500" />
          <p className="text-lg font-medium">No borrowed items found</p>
          <p className="text-sm text-gray-500">
            You haven’t borrowed any materials yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {borrowed.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">{item.materialTitle}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Due:{" "}
                  {new Date(item.dueDate.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === "pending"
                    ? "bg-yellow-600 text-white"
                    : item.status === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
