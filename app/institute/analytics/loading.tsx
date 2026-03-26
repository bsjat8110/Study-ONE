function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstituteAnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}
