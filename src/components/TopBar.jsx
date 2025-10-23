// src/components/TopBar.jsx
import IconButton from "../components/IconButton";
import { Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ onOpen }) {
  const { firebaseUser, profile, logout } = useAuth();

  return (
    <div className="lg:hidden w-full p-3 flex items-center justify-between bg-slate-800 text-white shadow">
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <IconButton onClick={onOpen} aria-label="Open navigation">
          <Menu />
        </IconButton>

        {/* Logo / Title */}
        <Link to="/" className="font-semibold text-sm">
          Intranet Library
        </Link>
      </div>

      {/* Right-side user indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {!profile?.role ? (
          <span>Guest</span>
        ) : (
          <>
            <span>
              {profile
                ? `${profile.role.toUpperCase()}`
                : firebaseUser.email?.split("@")[0]}
            </span>
            {/* Logout button */}
            <IconButton
              onClick={logout}
              aria-label="Logout"
              className="text-red-400 hover:text-red-500"
            >
              <LogOut size={18} />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}
