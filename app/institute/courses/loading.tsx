function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstituteCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
