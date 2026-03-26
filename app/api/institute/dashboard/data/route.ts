import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'INSTITUTE_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const instituteId = session.user.instituteId
  if (!instituteId) {
    return NextResponse.json({ error: 'No Institute found' }, { status: 404 })
  }

  try {
    const [institute, totalStudents, activeStudents, totalCourses, payments, testResults, recentStudents, upcomingTests] = await Promise.all([
      prisma.institute.findUnique({
        where: { id: instituteId },
        select: { name: true, plan: true, isActive: true },
      }),
      prisma.user.count({ where: { instituteId, role: 'STUDENT' } }),
      prisma.user.count({ where: { instituteId, role: 'STUDENT', isActive: true } }),
      prisma.course.count({ where: { instituteId, isActive: true } }),
      prisma.payment.findMany({
        where: { instituteId, status: 'COMPLETED' },
        select: { amount: true, createdAt: true }
      }),
      prisma.testResult.findMany({
        where: { test: { instituteId } },
        select: { score: true, test: { select: { passingMarks: true, totalMarks: true } } },
        take: 100
      }),
      prisma.user.findMany({
        where: { instituteId, role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, isActive: true }
      }),
      prisma.test.count({
        where: { instituteId, isActive: true, scheduledAt: { gte: new Date() } }
      }),
    ])

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthRevenue = payments
      .filter(p => new Date(p.createdAt) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0)
      
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const lastMonthRevenue = payments
      .filter(p => {
        const pd = new Date(p.createdAt)
        return pd >= lastMonthStart && pd <= lastMonthEnd
      })
      .reduce((sum, p) => sum + p.amount, 0)

    const revenueTrend = monthRevenue - lastMonthRevenue
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const revenue = payments
        .filter(p => {
          const pd = new Date(p.createdAt)
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
        })
        .reduce((sum, p) => sum + p.amount, 0)
      return { month: d.toLocaleString('en', { month: 'short' }), revenue }
    })

    return NextResponse.json({
      institute,
      totalStudents,
      activeStudents,
      totalCourses,
      monthRevenue,
      testResults,
      recentStudents,
      upcomingTests,
      totalRevenue,
      revenueTrend,
      averageRevenue: totalRevenue / 6,
      monthlyData,
      instituteId
    })
  } catch (error) {
    console.error('Institute dashboard error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
