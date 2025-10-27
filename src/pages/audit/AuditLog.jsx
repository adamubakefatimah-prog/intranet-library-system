import { useEffect, useState } from "react";
import { auditService } from "../../services/auditService";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getAllLogs();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load audit logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // filters
  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      (log.userName && log.userName.toLowerCase().includes(query)) ||
      (log.userId && log.userId.toLowerCase().includes(query)) ||
      (log.materialTitle && log.materialTitle.toLowerCase().includes(query)) ||
      (log.comment && log.comment.toLowerCase().includes(query));
    return matchesAction && matchesSearch;
  });

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
  const startIdx = (currentPage - 1) * perPage;
  const displayed = filteredLogs.slice(startIdx, startIdx + perPage);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="p-6">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by user, material or comment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 text-slate-100 px-3 py-2 rounded border border-slate-700 w-64"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-800 text-slate-100 px-3 py-2 rounded border border-slate-700"
        >
          <option value="all">All Actions</option>
          <option value="approved">Approved</option>
          <option value="rejected">Reject</option>
          <option value="borrowed">Borrow</option>
          <option value="returned">Return</option>
        </select>

        <div className="flex items-center self-end space-x-3 ml-auto">
          <button
            onClick={fetchLogs}
            className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition"
          >
            Refresh
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading audit logs...
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No audit records found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-slate-800 rounded-lg shadow">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="bg-slate-700 text-gray-200">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Material</th>
                  <th className="p-3">Comment</th>
                  <th className="p-3">Librarian</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          log.action === "approved"
                            ? "bg-emerald-700/40 text-emerald-200"
                            : log.action === "rejected"
                            ? "bg-red-700/30 text-red-200"
                            : log.action === "borrowed"
                            ? "bg-indigo-700/30 text-indigo-200"
                            : log.action === "returned"
                            ? "bg-sky-700/30 text-sky-200"
                            : "bg-gray-700/30 text-gray-200"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200 capitalize">
                        {log.userName || "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200">
                        {log.materialTitle || "—"}
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{log.comment || "—"}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200 capitalize">
                        {log.librarianName || "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      {log.timestamp?.toDate
                        ? log.timestamp.toDate().toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-gray-300">
            <div className="text-sm">
              Showing {startIdx + 1}-
              {Math.min(startIdx + perPage, filteredLogs.length)} of{" "}
              {filteredLogs.length}
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
    </div>
  );
}
