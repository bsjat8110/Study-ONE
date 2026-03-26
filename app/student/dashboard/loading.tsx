function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function StudentDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Hero card */}
      <Skeleton className="h-52 w-full rounded-[2rem]" />
      {/* Stats + Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}
