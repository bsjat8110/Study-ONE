function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-highest rounded-xl ${className ?? ''}`} />
}

export default function InstituteStudentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header + search */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      {/* Table rows */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Skeleton className="h-14 w-full rounded-none" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-t border-outline-variant/10">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-40 hidden md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
