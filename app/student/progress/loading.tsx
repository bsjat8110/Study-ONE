function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function StudentProgressLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <Skeleton className="h-9 w-36 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-36" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
