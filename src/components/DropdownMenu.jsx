// src/components/DropdownMenu.jsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function DropdownMenu({ children, anchorRef, onClose }) {
  const menuRef = useRef(null);

  // 🔹 Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !anchorRef.current?.contains(e.target)
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchorRef]);

  // 🔹 Position menu relative to anchor
  useEffect(() => {
    if (anchorRef.current && menuRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      menuRef.current.style.position = "absolute";
      menuRef.current.style.top = `${rect.bottom + 0}px`;
      menuRef.current.style.left = `${rect.right - 176}px`;
      menuRef.current.style.zIndex = "9999";
    }
  }, [anchorRef]);

  return createPortal(
    <div
      ref={menuRef}
      className="w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl origin-top-right animate-dropdown"
    >
      {children}
    </div>,
    document.body
  );
}
