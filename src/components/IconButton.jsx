export default function IconButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="icon-btn text-gray-300">
      {children}
    </button>
  );
}
