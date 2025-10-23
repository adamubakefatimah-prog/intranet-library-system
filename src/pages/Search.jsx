import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { searchMaterialsSmart, incrementViewCount } from "../services/materialService";
import { transactionService } from "../services/transactionService";
import AnimatedMaterialCard from "../components/AnimatedMaterialCard";
import { toast } from "react-toastify";
import SearchBar from "../components/SearchBar";
import { debounce } from "../utils/debounce";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("popular");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [queryText, setQueryText] = useState("");
  const { profile, user } = useAuth();
  const nav = useNavigate();

  // 🔹 mark materials that the user already requested
  const markRequestedFlags = useCallback(async (materials) => {
    if (!user || profile?.role !== "user") return materials;
    try {
      const txs = await transactionService.getUserTransactions(user.uid);
      const activeIds = new Set(
        txs.filter((t) => ["pending", "borrowed"].includes(t.status))
           .map((t) => t.materialId)
      );
      return materials.map((m) => ({ ...m, requested: activeIds.has(m.id) }));
    } catch (err) {
      console.error("Error marking requests:", err);
      return materials;
    }
  }, [user, profile]);

  // 🔹 smart search logic (client-side type/year filter)
  const doSearch = useCallback(async (payload) => {
    const { q, type, year, sort } = payload;
    if (!q && !type && !year) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let res = await searchMaterialsSmart({ q, sort, limitNum: 50 });

      // ✅ client-side filter for type/year
      if (type) {
        res = res.filter((m) =>
          m.type?.toLowerCase().includes(type.toLowerCase())
        );
      }
      if (year) {
        res = res.filter((m) => String(m.publicationYear) === String(year));
      }

      const withFlags = await markRequestedFlags(res || []);
      setResults(withFlags);
    } catch (err) {
      console.error(err);
      toast.error("Failed to search materials.");
    } finally {
      setLoading(false);
    }
  }, [markRequestedFlags]);

  // 🔹 debounce search for performance
  const debouncedSearch = useCallback(debounce(doSearch, 400), [doSearch]);

  useEffect(() => {
    debouncedSearch({ q: queryText, type, year, sort });
    return () => debouncedSearch.cancel && debouncedSearch.cancel();
  }, [queryText, type, year, sort, debouncedSearch]);

  // 🔹 when user picks from suggestion list
  const onSelectSuggestion = async (material) => {
    try {
      await incrementViewCount(material.id);
      nav(`/view-material/${material.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to open material");
    }
  };

  // handle search suggestions list live update
  const onSearchResults = async (materials) => {
    const withFlags = await markRequestedFlags(materials);
    setResults(withFlags);
  };

  // 🔹 handle book request
  const handleRequest = async (material) => {
    if (!user) {
      toast.info("Please log in to request materials.");
      nav("/login");
      return;
    }
    if (profile?.role !== "user") {
      toast.warning("Only regular users can request materials.");
      return;
    }
    try {
      await transactionService.requestBook(
        { uid: user.uid, displayName: user.fullName, email: user.email },
        material
      );
      setResults((prev) =>
        prev.map((r) =>
          r.id === material.id ? { ...r, requested: true } : r
        )
      );
      toast.success(`Request sent for "${material.title}"`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to request");
    }
  };

  // 🔹 handle delete (for librarians)
  const handleDelete = async (id) => {
    if (!confirm("Delete this material?")) return;
    try {
      const { deleteMaterial } = await import("../services/materialService");
      await deleteMaterial(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
      toast.success("Material deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete material.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Search input and sort dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1">
          <SearchBar
            onSelect={onSelectSuggestion}
            onResults={onSearchResults} // ✅ wire live results
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="p-3 rounded bg-slate-800 border border-slate-700 text-slate-100 outline-none hover:ring hover:ring-indigo-500"
        >
          <option value="popular">Most Viewed</option>
          <option value="recent">Most Recent</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>

      {/* Advanced filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Type Dropdown */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select Material Type</option>
          <option value="Book">Book</option>
          <option value="Thesis">Thesis</option>
          <option value="Journal">Journal</option>
          <option value="Report">Report</option>
          <option value="Presentation">Presentation</option>
          <option value="Magazine">Magazine</option>
          <option value="Article">Article</option>
        </select>

        {/* Year Dropdown */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select Publish Year</option>
          {Array.from({ length: 50 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      {/* Search results */}
      {loading && (
        <div className="text-gray-400 mt-4 text-center">Searching...</div>
      )}
      {!loading && results.length === 0 && (
        <div className="text-gray-400 mt-4 text-center">
          No materials found.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r) => (
          <AnimatedMaterialCard
            key={r.id}
            item={r}
            currentUserRole={profile?.role}
            onDelete={handleDelete}
            onRequest={() => handleRequest(r)}
            requested={!!r.requested}
          />
        ))}
      </div>
    </div>
  );
}
