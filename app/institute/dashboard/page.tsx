'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  IndianRupee,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  BrainCircuit,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

export default function InstituteDashboard() {
  const { t } = useI18n()
  const d = t.admin
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/institute/dashboard/data')
      const json = await res.json()
      setData(json)
      setLoading(false)
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

  const { institute, totalStudents, activeStudents, totalCourses, monthRevenue, testResults, recentStudents, upcomingTests, totalRevenue, revenueTrend, averageRevenue, monthlyData, instituteId } = data
  const instituteName = institute?.name || 'Your Institute'

  const avgPassRate = testResults.length > 0
    ? Math.round(testResults.filter((r: any) => r.score >= r.test.passingMarks).length / testResults.length * 100)
    : 0

  const kpis = [
    { label: d.totalStudents, value: totalStudents.toLocaleString(), change: `${activeStudents} ${d.activeStudents}`, isUp: true, icon: Users, color: 'text-primary', border: 'border-primary/30' },
    { label: d.activeCourses, value: totalCourses.toString(), change: t.common.success, isUp: true, icon: BookOpen, color: 'text-secondary', border: 'border-secondary/30' },
    { label: d.revenueMtd, value: `₹${(monthRevenue / 1000).toFixed(1)}K`, change: d.thisMonth || 'This month', isUp: true, icon: IndianRupee, color: 'text-emerald-400', border: 'border-emerald-400/30' },
    { label: d.passRate, value: `${avgPassRate}%`, change: `${testResults.length} ${d.tests}`, isUp: avgPassRate >= 70, icon: Trophy, color: 'text-tertiary', border: 'border-tertiary/30' },
  ]

  const quickActions = [
    {
      href: '/institute/students',
      label: d.manageStudents,
      detail: d.dashboardSubtitle || 'Control admissions, activity, and engagement.',
      icon: Users,
    },
    {
      href: '/institute/tests',
      label: d.launchAssessments,
      detail: d.testDetail || 'Create tests and keep performance signals fresh.',
      icon: CalendarClock,
    },
    {
      href: '/institute/payments',
      label: d.monitorRevenue,
      detail: d.revenueDetail || 'Track collections, pending fees, and flow health.',
      icon: IndianRupee,
    },
  ]

  const operationalCards = [
    {
      label: d.instituteCode,
      value: instituteId.slice(-8).toUpperCase(),
      detail: `${d.shareCode}: ${instituteId}`,
      icon: ShieldCheck,
      accent: 'from-primary/20 to-transparent',
    },
    {
      label: d.activeStudents,
      value: `${totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%`,
      detail: `${activeStudents} of ${totalStudents} ${d.studentsAreActive || 'students are active right now.'}`,
      icon: Users,
      accent: 'from-secondary/20 to-transparent',
    },
    {
      label: d.tests,
      value: upcomingTests.toString(),
      detail: d.scheduledAssessments || 'Scheduled assessments waiting in your academic pipeline.',
      icon: BrainCircuit,
      accent: 'from-emerald-400/20 to-transparent',
    },
  ]

  const maxRevenue = Math.max(...monthlyData.map((m: any) => m.revenue), 1)

  return (
    <div className="space-y-8 pb-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{d.dashboardTitle}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">
              {instituteName}
              <span className="block text-slate-300 text-2xl md:text-3xl mt-3 font-medium">
                {d.dashboardSubtitle}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              {d.dashboardSummary || 'Keep students active, assessments flowing, and revenue visible from one surface.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary font-bold">
                {institute?.plan || 'FREE'} plan
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                {institute?.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                {upcomingTests} {d.tests}
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 hover:border-primary/40 transition-colors">
                  <action.icon className="w-5 h-5 text-primary mb-4" />
                  <p className="text-sm font-bold text-white">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-5">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{d.operationalPulse}</p>
                <h2 className="mt-2 text-2xl font-space-grotesk font-bold text-white">{d.liveIntelligence || 'Live Intelligence'}</h2>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              {operationalCards.map((item) => (
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

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{d.monitorRevenue}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-space-grotesk font-bold text-white">₹{Math.round(totalRevenue).toLocaleString(t.lang === 'hi' ? 'hi-IN' : 'en-IN')}</p>
                    <p className="text-sm text-slate-400 mt-1">{d.totalCollections || 'Total completed collections'}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold border ${revenueTrend >= 0 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>
                    {revenueTrend >= 0 ? '+' : ''}₹{Math.abs(Math.round(revenueTrend)).toLocaleString(t.lang === 'hi' ? 'hi-IN' : 'en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity bg-current ${kpi.color}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-surface-lowest border ${kpi.border}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-surface-lowest border ${kpi.isUp ? 'text-emerald-400 border-emerald-400/20' : 'text-rose-400 border-rose-400/20'}`}>
                <TrendingUp className={`w-3 h-3 ${!kpi.isUp ? 'rotate-180' : ''}`} />
                {kpi.change}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-space-grotesk font-bold text-white mb-1">{kpi.value}</h3>
              <p className="text-outline text-sm uppercase tracking-wide">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-space-grotesk font-bold text-white">{d.revenueTrend}</h3>
              <p className="text-outline text-xs mt-1">{d.last6Months || 'Last 6 months monitoring'}</p>
            </div>
          </div>
          <div className="flex-1 w-full bg-surface-lowest/50 rounded-xl border border-outline-variant/20 flex items-end justify-between p-4 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-primary/20 to-transparent opacity-50 pointer-events-none" />
            {monthlyData.map((m: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-2 w-[14%]">
                <div
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-sm relative"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-slate-400">₹{Math.round(m.revenue).toLocaleString(t.lang === 'hi' ? 'hi-IN' : 'en-IN')}</span>
                <span className="text-[10px] text-outline">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-space-grotesk font-bold text-white">{d.recentStudents}</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {recentStudents.length === 0 ? (
              <p className="text-outline text-sm text-center py-8">{d.noStudentsYet || 'No students yet.'}</p>
            ) : recentStudents.map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bright/50 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center font-bold text-white text-xs border border-outline-variant/50">
                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{student.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
