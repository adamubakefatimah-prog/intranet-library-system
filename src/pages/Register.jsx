import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserProfile } from "../services/userService";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [department, setDepartment] = useState("");   // ⭐ NEW
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email is already registered.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Registration failed. Please try again.";
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!fullName || !userId || !department || !email || !pass) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      await createUserProfile(cred.user.uid, {
        email,
        fullName,
        userId,
        department,   // ⭐ ADDED HERE
        role: "user",
      });

      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => nav("/search"), 1200);
    } catch (e) {
      console.error(e);
      toast.error(handleError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={submit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="John Doe"
              required
              className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Staff ID / Admission */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Staff ID / Admission
            </label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              type="text"
              required
              placeholder="staff id or admission number"
              className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ⭐ Department */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              type="text"
              required
              placeholder="e.g. Computer Science"
              className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4"></span>
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
