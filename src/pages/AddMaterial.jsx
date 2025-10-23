import { useState } from "react";
import { createMaterial } from "../services/materialService";
import { validators } from "../utils/validators";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function AddMaterial() {
  const { profile } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    materialId: "",
    publicationYear: "",
    type: "",
    abstract: "",
  });

  const [loading, setLoading] = useState(false);

  if (profile?.role !== "librarian") {
    return (
      <div className="bg-gray-800 text-center p-6 rounded-lg text-gray-200">
        Only librarians can add materials.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Form validation
    if (!validators.required(form.title))
      return toast.error("⚠️ Title is required");
    if (!validators.required(form.author))
      return toast.error("⚠️ Author is required");
    if (!validators.year(form.publicationYear))
      return toast.error("⚠️ Invalid publication year");

    setLoading(true);

    try {
      await createMaterial({
        title: form.title,
        author: form.author,
        materialId: form.materialId || `MAT-${Date.now()}`, // auto-generate if empty
        publicationYear: Number(form.publicationYear),
        type: form.type || "Book",
        abstract: form.abstract,
      });

      toast.success("✅ Material added successfully!");
      setTimeout(() => nav("/LibrarianDashboard"), 1200);
    } catch (e) {
      console.error(e);
      toast.error(`❌ Failed to add material: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl shadow-md text-gray-100">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        Add New Material
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />

        <input
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
        />

        <input
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          placeholder="Material ID (optional)"
          value={form.materialId}
          onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
        />

        <select
          value={form.publicationYear}
          onChange={(e) =>
            setForm((f) => ({ ...f, publicationYear: e.target.value }))
          }
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
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

        <select
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Select Type</option>
          <option>Book</option>
          <option>Thesis</option>
          <option>Journal</option>
          <option>Report</option>
          <option>Presentation</option>
        </select>

        <textarea
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none min-h-[120px]"
          placeholder="Abstract"
          value={form.abstract}
          onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Material
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => nav(-1)}
            className="flex items-center gap-1 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </form>
    </div>
  );
}
