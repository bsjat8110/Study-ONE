// app/api/analytics/route.ts
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { jsonNoStore } from '@/lib/http'

interface Payment {
  amount: number
  createdAt: Date
}

interface TestResult {
  score: number
  test: { passingMarks: number }
}

interface StudentScore {
  name: string | null
  testResults: { score: number }[]
}

interface TopStudentData {
  name: string | null
  avgScore: number
}

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const instituteId = user.instituteId!

  const [
    totalStudents,
    activeStudents,
    totalCourses,
    payments,
    testResults,
    topStudents,
    recentStudents,
  ] = await Promise.all([
    prisma.user.count({ where: { instituteId, role: 'STUDENT' } }),
    prisma.user.count({ where: { instituteId, role: 'STUDENT', isActive: true } }),
    prisma.course.count({ where: { instituteId } }),
    prisma.payment.findMany({
      where: { instituteId, status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    }),
    prisma.testResult.findMany({
      where: { test: { instituteId } },
      select: { score: true, test: { select: { passingMarks: true } } },
      take: 500
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { testResults: { _count: 'desc' } },
      take: 4,
      select: {
        name: true,
        testResults: { select: { score: true } }
      }
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, name: true, isActive: true,
        enrollments: { select: { course: { select: { title: true } } }, take: 1 }
      }
    }),
  ])

  const typedPayments = payments as Payment[]
  const typedTestResults = testResults as TestResult[]
  const typedTopStudents = topStudents as StudentScore[]

  const totalRevenue = typedPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0)
  const passCount = typedTestResults.filter((r: TestResult) => r.score >= r.test.passingMarks).length
  const avgPassRate = typedTestResults.length > 0
    ? Math.round((passCount / typedTestResults.length) * 100)
    : 0

  // Monthly revenue (last 6 months)
  const now = new Date()
  const monthlyRevenue = Array.from({ length: 6 }, (_: unknown, i: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthName = d.toLocaleString('en', { month: 'short' })
    const revenue = typedPayments
      .filter((p: Payment) => {
        const pd = new Date(p.createdAt)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((sum: number, p: Payment) => sum + p.amount, 0)
    return { month: monthName, revenue }
  })

  const topStudentsData: TopStudentData[] = typedTopStudents.map((s: StudentScore) => ({
    name: s.name,
    avgScore: s.testResults.length > 0
      ? Math.round(s.testResults.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / s.testResults.length)
      : 0
  })).sort((a: TopStudentData, b: TopStudentData) => b.avgScore - a.avgScore)

  return jsonNoStore({
    data: {
      totalStudents,
      activeStudents,
      totalCourses,
      totalRevenue,
      avgPassRate,
      monthlyRevenue,
      topStudents: topStudentsData,
      recentStudents: recentStudents.map((s) => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
        course: s.enrollments[0]?.course.title || 'Not Enrolled'
      })),
    }
  })
}
