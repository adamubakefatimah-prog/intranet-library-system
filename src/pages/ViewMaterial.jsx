import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMaterial, deleteMaterial, incrementViewCount } from "../services/materialService";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Edit3, Trash2, BookOpen, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function ViewMaterial() {
  const { id } = useParams();
  const nav = useNavigate();
  const { profile, user } = useAuth();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestedFlag, setRequestedFlag] = useState(false);
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
          // increment view count asynchronously
          try {
            await incrementViewCount(m.id);
          } catch (incErr) {
            console.warn("incrementViewCount failed", incErr);
          }
        }
      } catch (e) {
        console.error("Failed to load material:", e);
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
    setDeleting(true);
    try {
      await deleteMaterial(id);
      toast.success("Material deleted successfully!");
      nav("/search");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed: " + (e.message || e));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    if (ts.toDate) return ts.toDate().toLocaleString();
    const d = new Date(ts);
    return isNaN(d) ? String(ts) : d.toLocaleString();
  };

  const handleDownload = async () => {
    if (!material?.fileUrl) {
      toast.error("No file available for download.");
      return;
    }
    if (!user) {
      toast.info("Please log in to download materials.");
      nav("/login");
      return;
    }

    try {
      // Open Cloudinary file in new tab
      window.open(material.fileUrl, "_blank", "noopener,noreferrer");

      // Increment view/download count
      try {
        await incrementViewCount(material.id);
      } catch (err) {
        console.warn("Failed to increment view count:", err);
      }
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Unable to download file. Try again.");
    }
  };

  const handleRequest = async () => {
    if (!user) {
      toast.info("Please log in to request materials.");
      nav("/login");
      return;
    }
    if (profile?.role !== "user") {
      toast.warning("Only regular users can request materials.");
      return;
    }

    setRequesting(true);
    try {
      await transactionService.requestBook(user, {
        id: material.id,
        title: material.title,
        author: material.author,
        type: material.type,
      });
      setRequestedFlag(true);
      toast.success(`Request sent for "${material.title}"`);
    } catch (err) {
      console.error("Request failed", err);
      toast.error(err?.message || "Failed to send request.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading material...
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

  const fileMeta = material.fileUrl
    ? {
        url: material.fileUrl,
        name: material.fileName || material.fileUrl.split("/").pop(),
      }
    : null;

  return (
    <div className="relative min-h-screen bg-slate-900 text-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <BookOpen className="w-5 h-5" />
              <h1 className="text-2xl font-semibold text-white">
                {material.title}
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              {material.author} • {material.publicationYear || "—"}
            </p>
            <div className="mt-1 text-xs bg-indigo-500/10 text-indigo-300 inline-block px-2 py-1 rounded">
              {material.type}
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-700" />

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Abstract</h3>
          <p className="text-gray-300 leading-relaxed">
            {material.abstract || "No abstract provided."}
          </p>
        </section>

        <div className="mt-6 text-xs text-gray-500 border-t border-slate-700 pt-3 flex items-center justify-between">
          <div>
            <div>Created: {formatDate(material.createdAt)}</div>
            <div>Last Updated: {formatDate(material.updatedAt)}</div>
          </div>

          <div className="flex items-end gap-3">
            {fileMeta && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <Download size={16} /> Download
                </button>
            )}

            {profile?.role === "user" && (
              <button
                onClick={handleRequest}
                disabled={requesting || requestedFlag}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  requestedFlag
                    ? "bg-green-700 text-green-100 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {requesting
                  ? "Sending..."
                  : requestedFlag
                  ? "Requested"
                  : "Request Material"}
              </button>
            )}

            {profile?.role === "librarian" && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/materials/${id}/edit`}
                  className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition"
                >
                  <Trash2 className="w-4 h-4" />{" "}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
