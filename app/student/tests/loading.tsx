function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function StudentTestsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <Skeleton className="h-9 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-40" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-40" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
