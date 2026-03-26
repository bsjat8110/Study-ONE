'use client'

import Link from 'next/link'
import {
  PlayCircle,
  BookOpen,
  Trophy,
  ArrowUpRight,
  Brain,
  CalendarClock,
  Sparkles,
  Target,
} from 'lucide-react'
import PayFeeCard from './PayFeeCard'
import AiTutorWidget from './AiTutorWidget'
import JoinInstitute from '@/components/student/JoinInstitute'
import Leaderboard from './Leaderboard'
import AchievementCard from './AchievementCard'
import { useI18n } from '@/lib/i18n/store'
import { useEffect, useState } from 'react'

function getRelativeStudyLabel(dateInput: Date | string | null | undefined, t: any) {
  if (!dateInput) return t.student.noRecentSession || 'No recent study session'

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))

  if (diffHours < 24) return t.student.activeToday || 'Active today'
  if (diffHours < 48) return t.student.studiedYesterday || 'Studied yesterday'

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${t.student.daysAgo || 'days since last session'}`
}

export default function StudentDashboard() {
  const { t } = useI18n()
  const d = t.student
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/student/dashboard/data')
        if (!res.ok) { setError(true); setLoading(false); return }
        const json = await res.json()
        if (json.error) { setError(true); setLoading(false); return }
        setData(json)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse text-primary font-space-grotesk font-bold text-xl">
        {t.common.loading}
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-rose-400 font-bold text-xl mb-2">{t.common.error}</p>
        <p className="text-outline text-sm">Could not load dashboard. Please refresh the page.</p>
      </div>
    </div>
  )

  const { enrollments, testResults, achievements, upcomingTests, userPoints, user } = data
  const firstName = user.name?.split(' ')[0] || d.student

  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((s: any, r: any) => s + (r.test.totalMarks > 0 ? (r.score / r.test.totalMarks) * 100 : r.score), 0) / testResults.length)
    : 0
  const completionRate = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum: any, enrollment: any) => sum + enrollment.progress, 0) / enrollments.length)
    : 0
  const heroEnrollment = enrollments[0]
  const momentumScore = Math.round((avgScore * 0.55) + (completionRate * 0.45))
  const studyStatus = getRelativeStudyLabel(heroEnrollment?.lastStudied, t)

  const colorClasses = [
    'bg-primary/10 border-primary/30 text-primary',
    'bg-secondary/10 border-secondary/30 text-secondary',
    'bg-tertiary/10 border-tertiary/30 text-tertiary',
  ]
  
  const performanceMessage = momentumScore >= 80
    ? (t.student.highPerformance || 'You are in a high-performance rhythm. Keep compounding.')
    : momentumScore >= 60
      ? (t.student.buildingMomentum || 'Momentum is building well. Stay consistent this week.')
      : (t.student.roomToImprove || 'There is room to tighten execution. Focus on next blocks.')

  const overviewCards = [
    { label: d.enrolled, value: enrollments.length.toString(), icon: BookOpen, detail: d.activeLearningTracks || 'Active learning tracks' },
    { label: d.totalPoints, value: userPoints.toLocaleString(), icon: Sparkles, detail: d.earnedConsistency || 'Earned through consistency' },
    { label: d.avgScore, value: `${avgScore}%`, icon: Trophy, detail: d.currentBenchmark || 'Current score benchmark' },
    { label: d.achievements, value: achievements.length.toString(), icon: Target, detail: d.unlockedMilestones || 'Unlocked milestones' },
  ]

  const intelligenceHighlights = [
    {
      label: d.momentumScore,
      value: `${momentumScore}%`,
      detail: performanceMessage,
      icon: Sparkles,
      accent: 'from-primary/20 to-transparent',
    },
    {
      label: d.completionAvg,
      value: `${completionRate}%`,
      detail: heroEnrollment
        ? `${heroEnrollment.course.title} ${d.strongestTrack || 'is your strongest active track.'}`
        : d.enrollToStart || 'Enroll in a course to start building your graph.',
      icon: Target,
      accent: 'from-secondary/20 to-transparent',
    },
    {
      label: d.totalEarned,
      value: `${userPoints} ${d.points}`,
      detail: achievements.length > 0
        ? `${d.unlocked} ${achievements.length} ${d.badges}!`
        : d.keepLearningBadges || 'Keep learning to unlock your first badge.',
      icon: Brain,
      accent: 'from-tertiary/20 to-transparent',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{d.dashboardTitle}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">
              {d.welcomeHeader}, {firstName}.
              <span className="block text-slate-300 text-2xl md:text-3xl mt-3 font-medium">
                {d.nextBreakthrough}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              {d.dashboardDescription || 'This dashboard turns your courses, tests, and AI guidance into one focused control surface.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary font-bold">
                {studyStatus}
              </div>
              <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> {userPoints} {d.points}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                {achievements.length} {d.unlocked}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Student Intelligence</p>
                <h2 className="mt-2 text-2xl font-space-grotesk font-bold text-white">Platform Capabilities</h2>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              {intelligenceHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Progress Card or Join Institute */}
      {user.instituteId ? (
        heroEnrollment ? (
          <div className="glass-card p-8 rounded-[2rem] border-primary/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-glow-primary animate-pulse" />
                  {d.resumeLesson}
                </p>
                <h2 className="text-3xl md:text-5xl font-space-grotesk font-bold text-white mb-2">{heroEnrollment.course.title}</h2>
                <p className="text-outline text-lg mb-8">{heroEnrollment.course.subject}</p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                    {heroEnrollment.course.totalChapters} {t.admin.courses}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                    {studyStatus}
                  </div>
                </div>
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-xs font-bold text-white mb-2">
                    <span>{d.completionAvg}</span>
                    <span className="text-primary">{heroEnrollment.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-lowest rounded-full overflow-hidden border border-outline-variant/30">
                    <div className="h-full bg-gradient-primary relative" style={{ width: `${heroEnrollment.progress}%` }}>
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/student/courses" className="px-8 py-4 rounded-xl font-bold bg-gradient-primary text-surface-dim hover:shadow-glow-primary hover:scale-105 transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  {d.resumeLesson}
                </Link>
                <Link href="/student/tests" className="px-8 py-4 rounded-xl font-bold glass-panel text-white hover:bg-surface-bright transition-all flex items-center gap-2 justify-center">
                  <CalendarClock className="w-5 h-5" />
                  {d.viewTests}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-[2rem] border-primary/30 text-center">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">{d.welcomeHeader}, {firstName}!</h2>
            <p className="text-outline">{d.enrollToStart || 'Enroll in a course to start learning.'}</p>
          </div>
        )
      ) : (
        <JoinInstitute />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((stat, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-outline-variant/20 text-left">
                <stat.icon className="w-6 h-6 text-outline mb-4" />
                <h4 className="text-2xl font-space-grotesk font-bold text-white">{stat.value}</h4>
                <p className="text-[10px] text-outline uppercase tracking-[0.24em] mt-1">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-3 leading-5">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-space-grotesk font-bold text-white">{d.activeCourses}</h3>
              <a href="/student/courses" className="text-xs text-primary hover:underline font-bold">{d.viewLibrary || 'View Library'}</a>
            </div>
            {enrollments.length === 0 ? (
              <p className="text-outline text-sm">{d.noCoursesYet || 'No courses yet.'}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.map((enrollment: any, idx: number) => {
                  const colorClass = colorClasses[idx % colorClasses.length]
                  return (
                    <div key={enrollment.id} className="glass-card p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${colorClass}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-white font-space-grotesk leading-tight mb-2">{enrollment.course.title}</h4>
                      <p className="text-xs text-outline mb-6">{enrollment.course.subject}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
                        <span>{enrollment.course.totalChapters} {d.chapters || 'chapters'}</span>
                        <span>{getRelativeStudyLabel(enrollment.lastStudied, t)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold font-space-grotesk text-white">{enrollment.progress}%</span>
                        <Link href="/student/courses" className="w-8 h-8 rounded-full bg-surface-highest hover:bg-primary hover:text-surface-dim hover:shadow-glow-sm transition-all flex items-center justify-center border border-outline-variant/50 text-white">
                          <PlayCircle className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
          </div>

          <div className="glass-card p-6 rounded-[1.75rem] border border-white/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-space-grotesk font-bold text-white">{d.upcomingTests}</h3>
                <p className="text-sm text-slate-400 mt-1">{d.whatIsApproaching || 'What is approaching next in your schedule'}</p>
              </div>
              <Link href="/student/tests" className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
                {d.openTestCenter || 'Open test center'}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingTests.length === 0 ? (
              <p className="text-sm text-slate-400">{d.noUpcomingTests || 'No upcoming tests scheduled.'}</p>
            ) : (
              <div className="space-y-4">
                {upcomingTests.map((test: any) => (
                  <div key={test.id} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{test.subject}</p>
                      <h4 className="mt-2 text-lg font-space-grotesk font-bold text-white">{test.title}</h4>
                      <p className="mt-2 text-sm text-slate-400">
                        {new Date(test.scheduledAt).toLocaleDateString(t.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {test.totalMarks} marks
                      </p>
                    </div>
                    <Link href="/student/tests" className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-surface-dim transition-all">
                      <CalendarClock className="w-4 h-4" />
                      {d.prepareNow}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Tutor + Leaderboard */}
        <div className="space-y-6">
          <Leaderboard />
          
          <div className="glass-card p-6 rounded-[1.75rem] border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-space-grotesk font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {d.achievements}
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{achievements.length} {d.unlocked}</p>
            </div>
            
            <div className="space-y-3">
              {achievements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <p className="text-xs text-slate-500">{d.keepLearningBadges}</p>
                </div>
              ) : (
                achievements.map((item: any) => (
                  <AchievementCard key={item.id} achievement={item as any} />
                ))
              )}
            </div>
          </div>

          <PayFeeCard name={user.name || d.student} email={user.email || ''} />
          <AiTutorWidget />
        </div>
      </div>
    </div>
  )
}
