function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstituteDashboardLoading() {
  return (
    <div className="space-y-8 pb-10">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-20 h-7 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  )
}
