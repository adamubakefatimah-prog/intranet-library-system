import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function LibrarianDashboard() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const materialsQuery = query(
          collection(firestore, "materials"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snapshot = await getDocs(materialsQuery);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMaterials(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (!profile || profile.role !== "librarian") {
    return (
      <p className="text-gray-400 p-4">
        Access Denied — Librarians only.
      </p>
    );
  }

  return (
    <div className="p-6">

      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/add-material"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Material
        </Link>
        <Link
          to="/LibrarianTransactions"
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Transactions
        </Link>
        <Link
          to="/register-librarian"
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Register Librarian
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin" /> Loading materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-gray-800 text-center p-6 rounded-lg text-gray-400">
          No materials found in the database.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Year</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, index) => (
                <tr
                  key={mat.id}
                  className="border-b border-gray-700 hover:bg-gray-700/40 transition"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{mat.title}</td>
                  <td className="py-3 px-4">{mat.author}</td>
                  <td className="py-3 px-4">{mat.type}</td>
                  <td className="py-3 px-4">{mat.publicationYear}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-gray-400 text-xs text-right p-3">
            Showing {materials.length} of the most recent 20 uploads.
          </div>
        </div>
      )}
    </div>
  );
}
