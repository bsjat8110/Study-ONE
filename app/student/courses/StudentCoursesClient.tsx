'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PlayCircle, Plus, X, BookOpen, Sparkles, ArrowUpRight, Layers3, Brain } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

type EnrolledCourse = {
  enrollmentId: string
  progress: number
  courseId: string
  title: string
  subject: string
  totalChapters: number
}

type AvailableCourse = {
  id: string
  title: string
  subject: string
  totalChapters: number
}

interface Props {
  initialEnrolled: EnrolledCourse[]
  initialAvailable: AvailableCourse[]
}

export default function StudentCoursesClient({ initialEnrolled, initialAvailable }: Props) {
  const { t } = useI18n()
  const s = t.student
  const [enrolled, setEnrolled] = useState(initialEnrolled)
  const [available, setAvailable] = useState(initialAvailable)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const averageProgress = enrolled.length > 0
    ? Math.round(enrolled.reduce((sum, c) => sum + c.progress, 0) / enrolled.length) : 0
  const mostAdvancedCourse = enrolled.reduce<EnrolledCourse | null>((best, c) => (!best || c.progress > best.progress) ? c : best, null)
  const totalChapters = enrolled.reduce((sum, c) => sum + c.totalChapters, 0)

  const summaryCards = [
    { label: s.liveEnrollments, value: enrolled.length.toString(), detail: s.coursesShaping, icon: BookOpen },
    { label: s.averageProgressLabel, value: `${averageProgress}%`, detail: s.overallCompletionDepth, icon: Layers3 },
    { label: s.availableNext, value: available.length.toString(), detail: s.freshCourses, icon: Sparkles },
  ]

  const handleEnroll = async (courseId: string) => {
    setError('')
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Enrollment failed'); setEnrollingId(null); return }
      const course = available.find(c => c.id === courseId)!
      setEnrolled(prev => [...prev, { enrollmentId: json.data.id, progress: 0, courseId, title: course.title, subject: course.subject, totalChapters: course.totalChapters }])
      setAvailable(prev => prev.filter(c => c.id !== courseId))
      setEnrollingId(null)
    } catch {
      setError('Network error — please try again')
      setEnrollingId(null)
    }
  }

  const handleUnenroll = async (enrollmentId: string, courseId: string) => {
    if (!confirm(s.unenrollConfirmMsg)) return
    setError('')
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); setError(j.error || 'Failed to unenroll'); return }
      const course = enrolled.find(e => e.enrollmentId === enrollmentId)!
      setEnrolled(prev => prev.filter(e => e.enrollmentId !== enrollmentId))
      setAvailable(prev => [...prev, { id: courseId, title: course.title, subject: course.subject, totalChapters: course.totalChapters }])
    } catch {
      setError('Network error — please try again')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{s.courseCommand}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">{s.courseHeroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">{s.courseHeroDesc}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary font-bold">
                {totalChapters} {s.chaptersMapped}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                {mostAdvancedCourse ? `${mostAdvancedCourse.title} ${s.leadsProgress}` : s.noActiveLeader}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{s.learningPulse}</p>
                <h2 className="mt-2 text-2xl font-space-grotesk font-bold text-white">{s.activeStudyEngine}</h2>
              </div>
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          {s.continueLearning}
        </h2>
        {enrolled.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center text-outline">{s.notEnrolledYet}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolled.map((e) => (
              <div key={e.enrollmentId} className="glass-card p-6 rounded-2xl border-outline-variant/30 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold text-white mb-1 relative z-10">{e.title}</h3>
                <p className="text-xs text-outline mb-4 relative z-10">{e.subject}</p>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-slate-300 mb-4 relative z-10">
                  {e.progress >= 75 ? s.finishingStretch : e.progress >= 35 ? s.momentumHealthy : s.earlyStageProgress}
                </div>
                <div className="flex justify-between text-xs text-outline mb-2 relative z-10">
                  <span>{e.totalChapters} {s.chaptersLabel}</span>
                  <span className="text-primary font-bold">{e.progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-lowest rounded-full overflow-hidden border border-outline-variant/30 relative z-10">
                  <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${e.progress}%` }} />
                </div>
                <div className="flex gap-2 mt-6 relative z-10">
                  <Link href="/student/dashboard" className="flex-1 py-2 rounded-xl border border-primary/50 text-primary hover:bg-primary hover:text-surface-dim hover:shadow-glow-sm transition-all text-sm font-bold flex items-center justify-center gap-2">
                    {s.resumeLabel}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setUnenrollingId(id => id === e.enrollmentId ? null : e.enrollmentId)}
                    className="px-3 py-2 rounded-xl border border-outline-variant/30 text-outline hover:text-red-400 hover:border-red-500/30 transition-colors text-xs"
                    title="Unenroll"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${unenrollingId === e.enrollmentId ? 'max-h-[100px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-3 border-t border-red-500/20">
                    <p className="text-xs text-red-400 mb-2">{s.unenrollConfirmMsg}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUnenroll(e.enrollmentId, e.courseId)}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors"
                      >
                        {s.confirmUnenroll}
                      </button>
                      <button onClick={() => setUnenrollingId(null)} className="py-1.5 px-3 rounded-lg border border-outline-variant/30 text-outline text-xs hover:text-white transition-colors">
                        {s.cancelLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      {available.length > 0 && (
        <div>
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            {s.availableCourses}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {available.map((course) => (
              <div key={course.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/20 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                <p className="text-xs text-outline mb-1">{course.subject}</p>
                <p className="text-xs text-outline mb-4">{course.totalChapters} {s.chaptersLabel}</p>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-slate-300 mb-4">{s.expandCoverage}</div>
                <button
                  onClick={() => setEnrollingId(id => id === course.id ? null : course.id)}
                  className="w-full py-2 rounded-xl border border-secondary/50 text-secondary hover:bg-secondary hover:text-surface-dim transition-all text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {s.enrollLabel}
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${enrollingId === course.id ? 'max-h-[100px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-3 border-t border-secondary/20">
                    <p className="text-xs text-outline mb-2">{s.enrollIn} <span className="text-white font-bold">{course.title}</span>?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="flex-1 py-1.5 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-bold text-xs hover:bg-secondary/20 transition-colors"
                      >
                        {s.confirmEnroll}
                      </button>
                      <button onClick={() => setEnrollingId(null)} className="py-1.5 px-3 rounded-lg border border-outline-variant/30 text-outline text-xs hover:text-white transition-colors">
                        {s.cancelLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
