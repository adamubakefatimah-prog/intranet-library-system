export default function OverviewCard({ title, count, color }) {
  const colorMap = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
  };

  return (
    <div className={`p-4 rounded-lg shadow ${colorMap[color]} text-white`}>
      <h4 className="text-sm">{title}</h4>
      <p className="text-2xl font-semibold">{count}</p>
    </div>
  );
}
