import { useEffect, useState } from "react";
import { getMaterial, updateMaterial } from "../services/materialService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../services/cloudinaryService";

export default function EditMaterial() {
  const { id } = useParams();
  const nav = useNavigate();
  const { profile } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [file, setFile] = useState(null);

  // Load material
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

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");

    try {
      let fileUrl = form.fileUrl || "";

      // Upload new file if selected
      if (file) {
        fileUrl = await uploadToCloudinary(file);
      }

      await updateMaterial(id, {
        title: form.title,
        author: form.author,
        publicationYear: Number(form.publicationYear),
        type: form.type,
        abstract: form.abstract,
        keywords: form.keywords || [],
        fileUrl, // include Cloudinary URL
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
        <h2 className="text-2xl font-bold"> Edit Material</h2>
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
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Author</label>
          <input
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>

        <select
          value={form.publicationYear}
          onChange={(e) =>
            setForm((f) => ({ ...f, publicationYear: e.target.value }))
          }
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
        >
          {" "}
          <option value="">Select Publish Year</option>{" "}
          {Array.from({ length: 50 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {" "}
                {y}{" "}
              </option>
            );
          })}{" "}
        </select>

        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
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
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          {form.fileUrl && (
            <p className="mt-1 text-sm text-indigo-200">
              Current file:{" "}
              <a
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View
              </a>
            </p>
          )}
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
