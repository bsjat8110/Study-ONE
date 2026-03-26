// app/institute/analytics/page.tsx
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Advanced Analytics | Study-ONE' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { 
  Users, BookOpen, GraduationCap, TrendingUp, 
  Clock, Award, BarChart3, PieChart, Sparkles, ShieldCheck
} from 'lucide-react'
import AnalyticsCharts from './AnalyticsCharts'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId) redirect('/login')

  const instituteId = user.instituteId

  // Fetch expanded analytics data
  const [
    totalEnrollments,
    totalTests,
    avgScores,
    activeStudentsCount,
    popularCourses,
    payments,
    topStudents
  ] = await Promise.all([
    prisma.enrollment.count({ where: { course: { instituteId } } }),
    prisma.test.count({ where: { instituteId } }),
    prisma.testResult.aggregate({
      where: { test: { instituteId } },
      _avg: { score: true }
    }),
    prisma.user.count({ where: { instituteId, role: 'STUDENT', isActive: true } }),
    prisma.course.findMany({
      where: { instituteId },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 5
    }),
    prisma.payment.findMany({
      where: { instituteId, status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { testResults: { _count: 'desc' } },
      take: 4,
      select: {
        name: true,
        testResults: { select: { score: true } }
      }
    })
  ])
  const now = new Date()
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const revenue = payments
      .filter((payment) => {
        const paidAt = new Date(payment.createdAt)
        return paidAt.getMonth() === date.getMonth() && paidAt.getFullYear() === date.getFullYear()
      })
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      month: date.toLocaleString('en', { month: 'short' }),
      revenue,
    }
  })
  const topStudentsData = topStudents
    .map((student) => ({
      name: student.name,
      avgScore: student.testResults.length > 0
        ? Math.round(student.testResults.reduce((sum, result) => sum + result.score, 0) / student.testResults.length)
        : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
  const activeRatio = totalEnrollments > 0 ? Math.round((activeStudentsCount / Math.max(topStudents.length, 1)) * 100) : activeStudentsCount > 0 ? 100 : 0
  const revenueThisMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0
  const analyticsSignals = [
    { label: 'Revenue pulse', value: `₹${Math.round(revenueThisMonth).toLocaleString('en-IN')}`, detail: 'Collections realized in the current month', icon: TrendingUp },
    { label: 'Enrollment graph', value: totalEnrollments.toLocaleString(), detail: 'Live course-to-student relationships in the system', icon: ShieldCheck },
    { label: 'Data depth', value: `${topStudentsData.length} leaders`, detail: 'High-signal student profiles available for analysis', icon: Sparkles },
  ]

  const stats = [
    { label: 'Total Enrollments', value: totalEnrollments, icon: BookOpen, color: 'text-primary' },
    { label: 'Active Students', value: activeStudentsCount, icon: Users, color: 'text-secondary' },
    { label: 'Total Tests', value: totalTests, icon: GraduationCap, color: 'text-tertiary' },
    { label: 'Avg. Test Score', value: `${Math.round(avgScores._avg.score || 0)}%`, icon: Award, color: 'text-emerald-400' },
  ]

  return (
    <div className="space-y-8 pb-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">Advanced Intelligence</p>
            <h2 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">See how your institute is actually performing.</h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Revenue, enrollments, scores, and course traction come together here so your decisions are based on signal, not guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analyticsSignals.map((signal) => (
              <div key={signal.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <signal.icon className="w-5 h-5 text-primary mb-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{signal.label}</p>
                <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{signal.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-surface-highest group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-outline uppercase tracking-widest font-bold">{stat.label}</p>
                <h3 className="text-2xl font-space-grotesk font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        monthlyRevenue={monthlyRevenue}
        avgScore={Math.round(avgScores._avg.score || 0)}
        topStudents={topStudentsData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Courses Table */}
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-space-grotesk font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-secondary" />
              Popular Courses
            </h3>
          </div>
          <div className="space-y-4">
            {popularCourses.map((course, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-bright/20 border border-outline-variant/10 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-surface-highest flex items-center justify-center font-bold text-primary">
                     {i + 1}
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-white">{course.title}</h4>
                     <p className="text-xs text-outline">{course.subject}</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{course._count.enrollments}</p>
                  <p className="text-[10px] text-outline">Students</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity */}
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-space-grotesk font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-tertiary" />
              Institute Pulse
            </h3>
          </div>
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
             {[
               { title: 'New Test Created', desc: 'Mock Test #4 for JEE Main', time: '10m ago' },
               { title: 'New Enrollment', desc: 'Rahul Sharma joined Physics 101', time: '1h ago' },
               { title: 'Payment Received', desc: '₹2,500 from Amit Kumar', time: '3h ago' },
               { title: 'AI Training Complete', desc: 'Organic Chemistry Chapter 5 indexed', time: '5h ago' }
             ].map((item, i) => (
               <div key={i} className="relative">
                 <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-primary z-10" />
                 <div>
                   <h4 className="text-sm font-bold text-white">{item.title}</h4>
                   <p className="text-xs text-outline">{item.desc}</p>
                   <span className="text-[10px] text-primary/60 font-medium">{item.time}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
