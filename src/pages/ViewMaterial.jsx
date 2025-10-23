// src/pages/ViewMaterial.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMaterial, deleteMaterial } from "../services/materialService";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Edit3, Trash2, BookOpen } from "lucide-react";
import { toast } from "react-toastify";

export default function ViewMaterial() {
  const { id } = useParams();
  const nav = useNavigate();
  const { profile } = useAuth();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const m = await getMaterial(id);
        if (!m) {
          setErr("Material not found");
        } else if (mounted) {
          setMaterial(m);
        }
      } catch (e) {
        setErr(e.message || "Failed to load material");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this material? This cannot be undone.")) return;
    try {
      await deleteMaterial(id);
      toast.success("Material deleted successfully!");
      nav("/search");
    } catch (e) {
      toast.error("Delete failed: " + (e.message || e));
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    if (ts.toDate) return ts.toDate().toLocaleString();
    const d = new Date(ts);
    return isNaN(d) ? String(ts) : d.toLocaleString();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        Loading material...
      </div>
    );
  if (err)
    return (
      <div className="bg-slate-800 text-red-400 p-6 rounded shadow text-center">
        {err}
      </div>
    );
  if (!material)
    return (
      <div className="bg-slate-800 text-gray-300 p-6 rounded shadow text-center">
        Material not found.
      </div>
    );

  return (
    <div className="relative min-h-screen bg-slate-900 text-gray-200 p-6">
      {/* Back Button */}
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 px-3 py-2 mb-4 text-sm bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <BookOpen className="w-5 h-5" />
              <h1 className="text-2xl font-semibold text-white">
                {material.title}
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              {material.author} • {material.publicationYear}
            </p>
            <div className="mt-1 text-xs bg-indigo-500/10 text-indigo-300 inline-block px-2 py-1 rounded">
              {material.type}
            </div>
          </div>

          <div className="flex gap-2">
            {profile?.role === "librarian" && (
              <>
                <Link
                  to={`/materials/${id}/edit`}
                  className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <hr className="my-6 border-slate-700" />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Abstract</h3>
          <p className="text-gray-300 leading-relaxed">
            {material.abstract || "No abstract provided."}
          </p>
        </section>

        {/* Metadata */}
        <div className="mt-6 text-xs text-gray-500 border-t border-slate-700 pt-3">
          <div>Created: {formatDate(material.createdAt)}</div>
          <div>Last Updated: {formatDate(material.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}
