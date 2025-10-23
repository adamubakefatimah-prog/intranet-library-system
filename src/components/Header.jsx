import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Book,
  Home,
  Search,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout, isLibrarian } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/search", label: "Search", icon: <Search size={18} /> },
    { to: "/borrow", label: "Borrow", icon: <ClipboardList size={18} /> },
  ];

  if (isLibrarian)
    navLinks.push({
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    });

  const isActive = (path) =>
    location.pathname === path ? "text-blue-400" : "text-gray-300";

  return (
    <header className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-800 text-white shadow-lg sticky top-0 z-50 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300 transition"
        >
          <Book size={24} /> Intranet Library
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1 hover:text-blue-400 transition ${isActive(
                to
              )}`}
            >
              {icon} {label}
            </Link>
          ))}

          {!user ? (
            <>
              <Link
                to="/login"
                className={`flex items-center gap-1 hover:text-green-400 transition ${isActive(
                  "/login"
                )}`}
              >
                <LogIn size={18} /> Login
              </Link>
              <Link
                to="/register"
                className={`flex items-center gap-1 hover:text-green-400 transition ${isActive(
                  "/register"
                )}`}
              >
                <UserPlus size={18} /> Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="ml-4 flex items-center gap-1 px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700 px-5 py-4 space-y-4 animate-slideDown">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 text-gray-300 hover:text-blue-400 transition ${isActive(
                to
              )}`}
            >
              {icon} {label}
            </Link>
          ))}

          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
              >
                <LogIn size={18} /> Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
              >
                <UserPlus size={18} /> Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left text-red-400 hover:text-red-500 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
