// src/components/SearchBar.jsx
import { useEffect, useMemo, useState } from "react";
import { debounce } from "../utils/debounce";
import { searchTitlesPrefix } from "../services/materialService";

export default function SearchBar({
  onSelect,
  onResults,
  placeholder = "Search titles or authors...",
}) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);

  const doSearch = async (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      setOpen(false);
      onResults?.([]);
      return;
    }
    try {
      const res = await searchTitlesPrefix(text, 10);
      setSuggestions(res || []);
      setOpen(true);
      setActive(-1);
      onResults?.(res || []);
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
      setOpen(false);
      onResults?.([]);
    }
  };

  const debounced = useMemo(() => debounce(doSearch, 300), []);

  useEffect(() => {
    debounced(q);
    return () => debounced.cancel && debounced.cancel();
  }, [q, debounced]);

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActive((a) => Math.max(a - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (active >= 0 && suggestions[active]) {
        handleSelect(suggestions[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleSelect = (item) => {
    setQ(item.title || "");
    setOpen(false);
    setSuggestions([]);
    setActive(-1);
    onSelect?.(item);
  };

  return (
    <div className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full p-3 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-auto z-50 max-h-60">
          {suggestions.map((s, idx) => (
            <li
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              className={`p-2 cursor-pointer transition ${
                idx === active
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-700"
              }`}
            >
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-slate-400">
                {s.author || "Unknown"} • {s.publicationYear ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
