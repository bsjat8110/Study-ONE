function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstitutePaymentsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30">
          <Skeleton className="h-6 w-40" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-outline-variant/10">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
