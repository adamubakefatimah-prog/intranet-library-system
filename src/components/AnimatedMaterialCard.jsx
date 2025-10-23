import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  hover: { scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.6)" },
};

export default function AnimatedMaterialCard({
  item,
  currentUserRole,
  onDelete,
  onRequest,
}) {
  const [requested, setRequested] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const handleRequestClick = async () => {
    if (requested || loadingRequest) return;
    setLoadingRequest(true);

    try {
      await onRequest?.(item);
      setRequested(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequest(false);
    }
  };

  return (
    <motion.article
      className="card p-4 rounded-lg bg-slate-800 backdrop-blur border border-slate-700"
      layout
      initial="hidden"
      animate="show"
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {item.author} • {item.publicationYear}
          </p>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-white/3">{item.type}</span>
        </div>
      </div>

      <p className="text-sm mt-3 text-gray-300 line-clamp-3">{item.abstract}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to={`/view-material/${item.id}`}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-white/9 text-sm hover:bg-white/3"
          >
            <Eye size={14} /> View
          </Link>

          {currentUserRole === "librarian" && (
            <Link
              to={`/edit-material/${item.id}`}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-white/6 text-sm hover:bg-white/3"
            >
              <Edit2 size={14} /> Edit
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentUserRole === "librarian" && (
            <button
              onClick={() => onDelete && onDelete(item.id)}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-white/6 text-sm text-red-400 hover:bg-red-600/10"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}

          {/* User Request Button */}
          {currentUserRole === "user" && (
            <button
              onClick={handleRequestClick}
              disabled={requested || loadingRequest}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border border-white/10 text-sm transition ${
                requested
                  ? "bg-green-800/40 text-green-300 cursor-not-allowed"
                  : loadingRequest
                  ? "bg-blue-700/20 text-blue-200 cursor-wait"
                  : "hover:bg-blue-700/20 text-blue-500 hover:text-blue-200"
              }`}
            >
              {loadingRequest ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Requesting...
                </>
              ) : (
                <>
                  <BookOpen size={14} />
                  {requested ? "Requested" : "Request"}
                </>
              )}
            </button>
          )}

          <div className="text-xs text-gray-500">
            {(item.keywords || [])
              .slice(0, 2)
              .map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 mr-1 rounded bg-white/4"
                >
                  {k}
                </span>
              ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
