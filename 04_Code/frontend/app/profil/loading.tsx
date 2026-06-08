export default function ProfilLoading() {
  return (
    <div className="px-4 py-6">
      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-44 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}
