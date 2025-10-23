import { Link } from 'react-router-dom';

export default function MaterialCard({ item, currentUserRole, onDelete }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-600">{item.author} • {item.publicationYear}</p>
      <p className="text-xs mt-2 text-gray-700 line-clamp-3">{item.abstract}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">{item.type}</div>

        <div className="flex gap-2">
          {currentUserRole === 'librarian' && (
            <>
              <Link to={`/materials/${item.id}/edit`} className="text-xs px-2 py-1 border rounded">Edit</Link>
              <button onClick={() => onDelete(item.id)} className="text-xs px-2 py-1 border rounded text-red-600">Delete</button>
            </>
          )}

          <Link to={`/materials/${item.id}`} className="text-xs px-2 py-1 border rounded">View</Link>
        </div>
      </div>
    </div>
  );
}
