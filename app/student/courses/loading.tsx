function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function StudentCoursesLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <Skeleton className="h-9 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
