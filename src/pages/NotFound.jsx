import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center text-slate-200 bg-slate-900">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-lg">
        <h1 className="text-6xl font-extrabold text-indigo-500 mb-3">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Oops! The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <Link
          onClick={() => nav(-1)}
          className="flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-all duration-200 w-36"
        >
          <ArrowLeftCircle size={20} />
          Go Back
        </Link>
      </div>

      <p className="mt-8 text-gray-500 text-sm">
        Need help? <Link to="/" className="text-indigo-400 hover:underline">Return Home</Link>
      </p>
    </div>
  );
}
