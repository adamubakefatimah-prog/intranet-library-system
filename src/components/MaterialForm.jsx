import React, { useState } from "react";

export default function MaterialForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    author: initialData.author || "",
    publicationYear: initialData.publicationYear || "",
    type: initialData.type || "Book",
    abstract: initialData.abstract || "",
    keywords: initialData.keywords?.join(", ") || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      publicationYear: parseInt(form.publicationYear, 10),
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto"
    >
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Author</label>
        <input
          type="text"
          name="author"
          value={form.author}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Publication Year</label>
          <input
            type="number"
            name="publicationYear"
            value={form.publicationYear}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option>Book</option>
            <option>Journal</option>
            <option>Thesis</option>
            <option>Report</option>
            <option>Dataset</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Abstract</label>
        <textarea
          name="abstract"
          value={form.abstract}
          onChange={handleChange}
          rows="4"
          className="w-full border rounded p-2"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Keywords (comma separated)</label>
        <input
          type="text"
          name="keywords"
          value={form.keywords}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Material
      </button>
    </form>
  );
}