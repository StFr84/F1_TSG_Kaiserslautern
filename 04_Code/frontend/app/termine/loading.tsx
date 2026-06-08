export default function TermineLoading() {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <ul className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <li key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
