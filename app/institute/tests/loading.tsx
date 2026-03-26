function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstituteTestsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full hidden md:block" />
            <Skeleton className="h-6 w-24 rounded-full hidden md:block" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
