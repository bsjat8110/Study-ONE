function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function StudentAchievementsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-16 w-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
