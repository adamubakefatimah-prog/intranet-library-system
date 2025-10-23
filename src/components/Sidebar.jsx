import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  BookOpen,
  LayoutDashboard,
  Users,
  LogOut,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Sidebar({ open, setOpen }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const baseLinks = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/search", label: "Search", icon: <Search size={18} /> },
  ];

  const userLinks = [
    { to: "/UserDashboard", label: "Dashboard", icon: <BookOpen size={18} /> },
  ];

  const librarianLinks = [
    { to: "/LibrarianDashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/add-material", label: "Add Material", icon: <BookOpen size={18} /> },
    { to: "/LibrarianTransactions", label: "Transactions", icon: <BookOpen size={18} /> },
    { to: "/register-librarian", label: "Add Librarian", icon: <Users size={18} /> },
  ];

  const links = [
    ...baseLinks,
    ...(profile?.role === "user" ? userLinks : []),
    ...(profile?.role === "librarian" ? librarianLinks : []),
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed z-50 inset-y-0 left-0 w-64 bg-slate-800 text-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}
      aria-hidden={!open}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center bg-indigo-600 text-white font-bold">
              IL
            </div>
            <div className="text-sm font-semibold">Intranet Library</div>
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-white/5"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "hover:bg-gray-700 text-gray-300"
                }`
              }
            >
              {link.icon}
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-700">
          {!profile?.role ? (
            <div className="space-y-2">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <LogIn size={16} /> <span className="text-sm">Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <UserPlus size={16} /> <span className="text-sm">Register</span>
              </NavLink>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-600/10 text-red-400 transition"
            >
              <LogOut size={16} /> <span className="text-sm">Logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
