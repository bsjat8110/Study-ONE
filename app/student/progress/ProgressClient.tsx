'use client'
import { useI18n } from '@/lib/i18n/store'
import { TrendingUp, Target, Brain, Activity, Sparkles } from 'lucide-react'

type Enrollment = {
  id: string
  progress: number
  course: { title: string; subject: string }
}

export default function ProgressClient({
  enrollments,
  testStats,
}: {
  enrollments: Enrollment[]
  testStats: { overallProgress: number; accuracy: number; averageScore: number; passCount: number; totalTests: number; strongestCourseTitle: string | null }
}) {
  const { t } = useI18n()
  const s = t.student
  const { overallProgress, accuracy, averageScore, passCount, totalTests, strongestCourseTitle } = testStats

  const summaryCards = [
    { label: s.passRateLabel, value: `${accuracy}%`, detail: `${passCount} ${s.testsPassedOf} ${totalTests} ${s.testsPassed2}`, icon: Target },
    { label: s.overallProgress, value: `${overallProgress}%`, detail: `${enrollments.length} ${s.activeCourseTracks}`, icon: TrendingUp },
    { label: s.avgScoreLabel, value: `${averageScore}%`, detail: s.performanceBaseline, icon: Brain },
  ]

  const masteryText = overallProgress >= 75 && accuracy >= 70
    ? s.strongTrajectory
    : overallProgress >= 45 || accuracy >= 50
      ? s.stableGrowth
      : s.needsFocused

  const masteryDesc = overallProgress >= 75 && accuracy >= 70
    ? s.strongTrajectoryDesc
    : overallProgress >= 45 || accuracy >= 50
      ? s.stableGrowthDesc
      : s.needsFocusedDesc

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{s.progressIntelligence}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">{s.progressHeroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">{s.progressHeroDesc}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary font-bold">
                {strongestCourseTitle ? `${strongestCourseTitle} ${s.strongestTrackLabel}` : s.noLeadingTrack}
              </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-space-grotesk font-bold text-white">{s.masterySignal}</h3>
                <p className="text-sm text-slate-400 mt-1">{s.quickReadSignal}</p>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{s.currentReadout}</p>
              <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">{masteryText}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{masteryDesc}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-outline-variant/20">
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            {s.courseProgress}
          </h2>
          {enrollments.length === 0 ? (
            <p className="text-outline text-sm text-center py-8">{s.noCoursesEnrolled}</p>
          ) : (
            <div className="space-y-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white font-bold truncate max-w-[160px]">{enrollment.course.title}</span>
                    <span className="text-outline shrink-0">{enrollment.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-lowest rounded-full overflow-hidden border border-outline-variant/30">
                    <div
                      className={`h-full ${enrollment.progress > 80 ? 'bg-emerald-400' : enrollment.progress > 40 ? 'bg-primary' : 'bg-rose-400'}`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-outline mt-1">{enrollment.course.subject}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {enrollment.progress > 80 ? s.approachingMastery : enrollment.progress > 40 ? s.solidMovement : s.earlyStage}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
