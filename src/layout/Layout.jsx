import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Layout({ children, title }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile) */}
        <TopBar onOpen={() => setOpen(true)} />

        {/* Page Header */}
        {title && (
          <header className="px-4 py-3 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
            <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-">{children}</main>
      </div>
    </div>
  );
}
