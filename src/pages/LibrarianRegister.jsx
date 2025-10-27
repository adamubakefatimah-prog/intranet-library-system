import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

export default function LibrarianRegister() {
  const { user, profile } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    userId: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Only librarians can register new librarians
  if (!user || profile?.role !== "librarian") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-3 flex items-center justify-center gap-2">
            <UserPlus size={20} /> Librarian Access Required
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            You must be logged in as a librarian to register another librarian.
            Please login using a librarian account.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.userId || !form.email || !form.password) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await createUserProfile(cred.user.uid, {
        email: form.email,
        fullName: form.fullName,
        userId: form.userId,
        role: "librarian",
      });

      toast.success("✅ Librarian account created successfully!");
      setTimeout(() => nav("/LibrarianDashboard"), 1500);
    } catch (e) {
      console.error(e);
      const msg =
        e.code === "auth/email-already-in-use"
          ? "Email already registered."
          : e.code === "auth/invalid-email"
          ? "Invalid email address."
          : e.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : "Failed to register librarian.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-slate-900 text-white px-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 justify-center">
         Register Librarian
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            name="userId"
            value={form.userId}
            onChange={handleChange}
            placeholder="Staff ID"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />


          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Librarian Email"
            type="email"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Creating...
                </>
              ) : (
                <>Create Librarian</>
              )}
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              className="flex items-center justify-center gap-2 flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
