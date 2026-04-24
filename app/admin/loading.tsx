export default function AdminDashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <div className="h-6 w-44 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-4 w-60 bg-slate-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-7 w-24 bg-slate-100 rounded-full animate-pulse" />
      </div>

      <div className="p-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-l-4 border-slate-200 p-5 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
              <div className="h-7 bg-slate-100 rounded w-14 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>

        {/* Chart row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
            <div className="h-5 w-48 bg-slate-100 rounded mb-1.5" />
            <div className="h-3 w-36 bg-slate-100 rounded mb-6" />
            <div className="h-[210px] bg-slate-100 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
            <div className="h-5 w-40 bg-slate-100 rounded mb-1.5" />
            <div className="h-3 w-28 bg-slate-100 rounded mb-6" />
            <div className="h-[210px] bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Chart row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
              <div className="h-5 w-48 bg-slate-100 rounded mb-1.5" />
              <div className="h-3 w-32 bg-slate-100 rounded mb-6" />
              <div className="h-[210px] bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
