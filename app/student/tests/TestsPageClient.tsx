'use client'
import { useI18n } from '@/lib/i18n/store'
import { Clock, Brain, Trophy, CalendarClock, Sparkles, BarChart2, X, Target } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SummaryCard {
  label: string
  value: string
  detail: string
  icon: any
}

interface UpcomingTest {
  id: string
  title: string
  subject: string
  duration: number
  scheduledAt: string
}

interface ResultItem {
  id: string
  score: number
  timeTaken: number
  submittedAt: string
  testId: string
  test: { title: string; subject: string; totalMarks: number; passingMarks: number }
}

export default function TestsPageClient({ upcoming, results }: { upcoming: UpcomingTest[], results: ResultItem[] }) {
  const { t } = useI18n()
  const d = t.student
  const [openId, setOpenId] = useState<string | null>(null)

  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + ((r.score / (r.test.totalMarks || 1)) * 100), 0) / results.length)
    : 0
  const passCount = results.filter(r => r.score >= r.test.passingMarks).length
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0

  const summaryCards: SummaryCard[] = [
    { label: d.upcoming, value: upcoming.length.toString(), detail: d.upcomingScheduled, icon: CalendarClock },
    { label: d.completed, value: results.length.toString(), detail: d.completedFeedback, icon: Trophy },
    { label: d.passRate, value: `${passRate}%`, detail: d.passRateConsistency, icon: Sparkles },
    { label: d.avgScore, value: `${averageScore}%`, detail: d.avgScoreBenchmark, icon: Brain },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{d.testArena}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">
              {d.testHeroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              {d.testHeroDesc}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <card.icon className="w-5 h-5 text-primary mb-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{card.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tests */}
        <div className="glass-card p-6 rounded-2xl border-orange-500/20 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px]" />
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Clock className="w-5 h-5 text-orange-400" />
            {d.upcomingTestsTitle}
          </h2>
          <div className="space-y-4 relative z-10">
            {upcoming.length === 0 ? (
              <p className="text-outline text-sm text-center py-8">{d.noUpcomingScheduled}</p>
            ) : upcoming.map((test) => (
              <div key={test.id} className="p-4 rounded-xl border border-outline-variant/30 hover:border-orange-500/30 transition-colors bg-surface-lowest">
                <h3 className="font-bold text-white mb-1">{test.title}</h3>
                <p className="text-xs text-outline mb-4">{test.subject}</p>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-slate-300 mb-4">
                  {d.highQualityAttempt}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-surface-highest px-3 py-1 rounded-full text-outline-variant">{test.duration} {d.mins}</span>
                  <span className="text-orange-400 font-bold">{new Date(test.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <Link
                  href={`/student/tests/${test.id}`}
                  className="mt-3 block w-full text-center py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all"
                >
                  {d.attemptTest}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Past Results */}
        <div className="glass-panel p-6 rounded-2xl border-outline-variant/20">
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {d.previousResults}
          </h2>
          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-outline text-sm text-center py-8">{d.noTestResults}</p>
            ) : results.map((result) => {
              const pct = result.test.totalMarks > 0 ? Math.round((result.score / result.test.totalMarks) * 100) : result.score
              const passed = result.score >= result.test.passingMarks
              const isOpen = openId === result.id
              const mins = Math.floor(result.timeTaken / 60)
              const secs = result.timeTaken % 60
              const date = new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <div key={result.id} className="rounded-xl border border-outline-variant/20 overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-surface-bright/50 transition-colors">
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">{result.test.title}</h3>
                      <div className="flex gap-3 text-xs">
                        <span className={passed ? 'text-emerald-400' : 'text-rose-400'}>{passed ? d.passed : d.failed}</span>
                        <span className="text-outline">{result.test.subject}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">{d.refineStrategy}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-3 sm:pt-0 sm:pl-4">
                      <div className="text-center">
                        <p className="text-2xl font-space-grotesk font-bold text-white leading-none">{result.score}/{result.test.totalMarks}</p>
                        <p className="text-[10px] text-outline mt-1">{pct}%</p>
                      </div>
                      <button
                        onClick={() => setOpenId(isOpen ? null : result.id)}
                        className="bg-surface-lowest hover:bg-white hover:text-surface-dim transition-all text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        {isOpen ? <X className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
                        {isOpen ? d.close : d.analysis}
                      </button>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 bg-surface-lowest border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                        <p className={`text-2xl font-bold font-space-grotesk ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{pct}%</p>
                        <p className="text-[10px] text-outline uppercase mt-1">{d.percentage}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                        <p className="text-2xl font-bold font-space-grotesk text-white">{result.score}</p>
                        <p className="text-[10px] text-outline uppercase mt-1">{d.score}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-outline" />
                          <p className="text-lg font-bold font-space-grotesk text-white">{mins}m {secs}s</p>
                        </div>
                        <p className="text-[10px] text-outline uppercase">{d.timeTaken}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-3 h-3 text-outline" />
                          <p className="text-lg font-bold font-space-grotesk text-white">{result.test.passingMarks}</p>
                        </div>
                        <p className="text-[10px] text-outline uppercase">{d.passMark}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-4">
                        <div className="flex justify-between text-xs text-outline mb-1">
                          <span>{d.score}</span>
                          <span>{result.score} / {result.test.totalMarks}</span>
                        </div>
                        <div className="h-2 w-full bg-surface-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${passed ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-outline mt-2">{d.submittedOn} {date}</p>
                        <p className="text-[11px] text-slate-400 mt-3">
                          {passed ? d.passedAnalysis : d.failedAnalysis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
