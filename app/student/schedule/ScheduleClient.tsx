'use client'
import { useI18n } from '@/lib/i18n/store'
import Link from 'next/link'
import { Calendar as CalIcon, Clock, FileText, AlertCircle, Sparkles, ShieldCheck, CalendarClock } from 'lucide-react'

type ScheduleTest = {
  id: string
  title: string
  subject: string | null
  duration: number | null
  totalMarks: number
  scheduledAt: Date
}

export default function ScheduleClient({
  upcomingTests,
  attemptedIds,
  todayStr,
}: {
  upcomingTests: ScheduleTest[]
  attemptedIds: string[]
  todayStr: string
}) {
  const { t } = useI18n()
  const s = t.student
  const today = new Date()
  const todayEvents = upcomingTests.filter(test => new Date(test.scheduledAt).toDateString() === today.toDateString()).length
  const attemptedUpcoming = upcomingTests.filter(test => attemptedIds.includes(test.id)).length

  const summaryCards = [
    { label: s.upcomingTestsCard, value: upcomingTests.length.toString(), detail: s.instituteScheduled, icon: CalendarClock },
    { label: s.todayCard, value: todayEvents.toString(), detail: s.assessmentsToday, icon: Sparkles },
    { label: s.alreadyHandled, value: attemptedUpcoming.toString(), detail: s.alreadyAttempted, icon: ShieldCheck },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{s.scheduleIntelligence}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">{s.scheduleHeroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">{s.scheduleHeroDesc}</p>
            <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-highest text-white text-sm font-bold border border-outline-variant/30 w-fit">
              <CalIcon className="w-4 h-4 text-primary" />
              {todayStr}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <card.icon className="w-5 h-5 text-primary mb-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400 leading-5">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glass-card p-8 rounded-3xl border-outline-variant/20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
        {upcomingTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 relative z-10">
            <CalIcon className="w-12 h-12 text-outline opacity-30" />
            <h3 className="font-space-grotesk font-bold text-white text-lg">{s.noUpcomingTestsSchedule}</h3>
            <p className="text-outline text-sm text-center max-w-sm">{s.instituteNoTests}</p>
            <Link href="/student/tests" className="mt-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
              {s.viewPastTests}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {upcomingTests.map((test) => {
              const scheduledDate = new Date(test.scheduledAt)
              const isToday = scheduledDate.toDateString() === today.toDateString()
              const isTomorrow = scheduledDate.toDateString() === new Date(today.getTime() + 86400000).toDateString()
              const attempted = attemptedIds.includes(test.id)
              const dateLabel = isToday ? s.today : isTomorrow ? s.tomorrow : scheduledDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              const timeLabel = scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

              return (
                <div key={test.id} className="flex gap-6 items-start group">
                  <div className="w-24 shrink-0 text-right pt-1">
                    <span className="text-sm font-bold text-outline-variant font-space-grotesk">{timeLabel}</span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isToday ? 'text-primary' : 'text-outline'}`}>{dateLabel}</p>
                  </div>
                  <div className="flex-1 glass-panel p-5 rounded-2xl border border-outline-variant/20 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${attempted ? 'bg-emerald-400/10 text-emerald-400' : isToday ? 'bg-primary/10 text-primary' : 'bg-orange-400/10 text-orange-400'}`}>
                        {attempted ? <FileText className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{test.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-outline font-bold uppercase flex-wrap">
                          <span className={attempted ? 'text-emerald-400' : isToday ? 'text-primary' : 'text-orange-400'}>
                            {attempted ? s.attemptedLabel : s.examLabel}
                          </span>
                          {test.subject && <><span>•</span><span>{test.subject}</span></>}
                          {test.duration && <><span>•</span><span>{test.duration} {s.min}</span></>}
                          <span>•</span><span>{test.totalMarks} {s.marks}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-3">
                          {attempted ? s.alreadyCompleted : isToday ? s.priorityEvent : s.upcomingCheckpoint}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/student/tests"
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all sm:self-center shrink-0 ${attempted ? 'bg-surface-highest text-outline hover:text-white border border-outline-variant/30' : 'bg-surface-highest text-white hover:text-surface-dim hover:bg-white hover:shadow-glow-sm'}`}
                    >
                      {attempted ? s.viewResult : s.startTest}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {upcomingTests.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-outline px-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {upcomingTests.length} {s.scheduledCount}
        </div>
      )}
    </div>
  )
}
