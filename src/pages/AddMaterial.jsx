import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createMaterial } from "../services/materialService";
import { uploadToCloudinary } from "../services/cloudinaryService";

export default function AddMaterial() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    publicationYear: "",
    type: "",
    abstract: "",
    file: null,
  });

  // handle input changes
  const change = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validations
      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.author.trim()) throw new Error("Author is required");
      if (!form.publicationYear.trim()) throw new Error("Publication year is required");

      let fileUrl = "";

      // Upload to Cloudinary if a file is selected
      if (form.file) {
        fileUrl = await uploadToCloudinary(form.file);
      }

      // Save to Firestore
      await createMaterial({
        title: form.title,
        author: form.author,
        publicationYear: Number(form.publicationYear),
        type: form.type || "Book",
        abstract: form.abstract,
        fileUrl,
      });

      toast.success("Material added successfully!");
      nav("/LibrarianDashboard");

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 mt-6 rounded-2xl shadow-lg text-slate-100">
      {/* <h1 className="text-3xl font-bold mb-6">Add New Material</h1> */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1 text-gray-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => change("title", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            placeholder="Enter material title"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block mb-1 text-gray-300">Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => change("author", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            placeholder="Enter author's name"
          />
        </div>

        {/* Publication Year */}
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

        {/* Type */}
        <div>
          <label className="block mb-1 text-gray-300">Material Type</label>
          <select
            value={form.type}
            onChange={(e) => change("type", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Select type</option>
            <option value="Book">Book</option>
            <option value="Project">Project</option>
            <option value="Research">Research</option>
            <option value="Journal">Journal</option>
            <option value="Handout">Handout</option>
          </select>
        </div>

        {/* Abstract */}
        <div>
          <label className="block mb-1 text-gray-300">Abstract</label>
          <textarea
            value={form.abstract}
            onChange={(e) => change("abstract", e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            placeholder="Write an abstract..."
          ></textarea>
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-1 text-gray-300">Upload File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            onChange={(e) => change("file", e.target.files[0])}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          cursor={loading ? "not-allowed" : "pointer"}
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:bg-gray-600"
        >
          {loading ? "Uploading..." : "Add Material"}
        </button>
      </form>
    </div>
  );
}
