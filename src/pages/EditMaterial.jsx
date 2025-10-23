import { useEffect, useState } from "react";
import { getMaterial, updateMaterial } from "../services/materialService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function EditMaterial() {
  const { id } = useParams();
  const nav = useNavigate();
  const { profile } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const m = await getMaterial(id);
        setForm(m);
      } catch (e) {
        setErr("❌ Material not found or failed to load. " + e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (profile?.role !== "librarian") {
    return (
      <div className="bg-white p-6 rounded shadow text-center text-gray-700">
        🚫 Only librarians can edit materials.
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-slate-200">
        <Loader2 className="animate-spin mr-2" /> Loading material...
      </div>
    );

  if (!form)
    return (
      <div className="bg-red-100 p-4 rounded text-red-700 text-center">
        Material not found.
      </div>
    );

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await updateMaterial(id, {
        title: form.title,
        author: form.author,
        publicationYear: Number(form.publicationYear),
        type: form.type,
        abstract: form.abstract,
        keywords: form.keywords || [],
      });
      toast.success("✅ Material updated successfully!");
      nav("/LibrarianDashboard");
    } catch (err) {
      toast.error(`❌ ${err.message || "Error updating material"}`);
      setErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 mt-6 rounded-2xl shadow-lg text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">✏️ Edit Material</h2>
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {err && (
        <div className="bg-red-500/20 border border-red-400 text-red-200 p-3 rounded mb-3">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Author</label>
          <input
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Publication Year
          </label>
          <input
            type="number"
            value={form.publicationYear}
            onChange={(e) =>
              setForm((f) => ({ ...f, publicationYear: e.target.value }))
            }
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Book</option>
            <option>Thesis</option>
            <option>Journal</option>
            <option>Report</option>
            <option>Presentation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Abstract</label>
          <textarea
            rows={3}
            value={form.abstract}
            onChange={(e) =>
              setForm((f) => ({ ...f, abstract: e.target.value }))
            }
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 w-full py-2 rounded-md font-semibold text-white transition flex justify-center items-center"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} /> Saving...
            </>
          ) : (
            "💾 Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
