import { Inbox } from "lucide-react";

export default function EmptyState({ message = "No records found" }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-slate-800 rounded-lg shadow-sm">
      <Inbox className="w-12 h-12 mb-3 text-gray-500" />
      <p className="text-base">{message}</p>
    </div>
  );
}
