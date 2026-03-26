import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Progress' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProgressClient from './ProgressClient'

export default async function StudentProgress() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  const userId = user.id
  if (!userId) redirect('/login')

  let enrollments: { id: string; progress: number; course: { title: string; subject: string } }[] = []
  let testResults: { score: number; test: { totalMarks: number; passingMarks: number } }[] = []
  try {
    ;[enrollments, testResults] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: { select: { title: true, subject: true } } }
      }),
      prisma.testResult.findMany({
        where: { userId },
        select: { score: true, test: { select: { totalMarks: true, passingMarks: true } } }
      })
    ])
  } catch { /* DB connectivity issue */ }

  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0
  const passCount = testResults.filter(r => r.score >= r.test.passingMarks).length
  const accuracy = testResults.length > 0 ? Math.round((passCount / testResults.length) * 100) : 0
  const averageScore = testResults.length > 0
    ? Math.round(testResults.reduce((sum, r) => sum + ((r.score / (r.test.totalMarks || 1)) * 100), 0) / testResults.length) : 0
  const strongestCourse = enrollments.reduce<typeof enrollments[number] | null>(
    (best, e) => (!best || e.progress > best.progress) ? e : best, null
  )

  return (
    <ProgressClient
      enrollments={enrollments}
      testStats={{
        overallProgress,
        accuracy,
        averageScore,
        passCount,
        totalTests: testResults.length,
        strongestCourseTitle: strongestCourse?.course.title ?? null
      }}
    />
  )
}
