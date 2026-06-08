export default function DashboardLoading() {
  return (
    <div>
      <div className="px-4 pt-8 pb-5 bg-[#9B1C2E]">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
            <div className="h-5 w-36 bg-white/30 rounded animate-pulse" />
            <div className="h-3 w-40 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-white/20 rounded animate-pulse" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-2" />
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
