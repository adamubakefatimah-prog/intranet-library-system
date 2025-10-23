import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { materialService } from "../../services/materialService";
import { transactionService } from "../../services/transactionService";
import { auth } from "../../services/firebase";
import { Loader2 } from "lucide-react";

export default function RequestMaterial() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await materialService.getAllMaterials();
        setMaterials(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError("Failed to load materials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleRequest = async (book) => {
    const user = auth.currentUser;

    if (!user) {
      // Redirect to login if not signed in
      return nav("/login");
    }

    // ✅ Check if user is a librarian
    const token = await user.getIdTokenResult();
    const role = token.claims.role || "user";
    if (role !== "user") {
      return setError("Only users can request materials. Librarians cannot make requests.");
    }

    try {
      setMessage("");
      setError("");

      await transactionService.requestBook(
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
        },
        book
      );

      setMessage(`✅ Request for “${book.title}” sent successfully!`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error sending request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading materials...
      </div>
    );
  }

  if (error && !materials.length) {
    return <div className="text-center text-red-400 mt-10">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Request a Material</h2>

      {/* Messages */}
      {message && <div className="bg-green-700 text-white p-2 rounded">{message}</div>}
      {error && <div className="bg-red-700 text-white p-2 rounded">{error}</div>}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((book) => (
          <div
            key={book.id}
            className="bg-slate-800 p-4 rounded shadow text-gray-200 border border-slate-700 hover:border-indigo-600 transition"
          >
            <h3 className="font-medium text-indigo-400">{book.title}</h3>
            <p className="text-sm text-gray-400 mb-2">
              {book.author || "Unknown Author"}
            </p>
            <button
              onClick={() => handleRequest(book)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
            >
              Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
