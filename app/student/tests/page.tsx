import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mock Tests' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TestsPageClient from './TestsPageClient'
import type { SessionUser } from '@/types'

export default async function StudentTests() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as SessionUser
  if (!user.id) redirect('/login')
  const instituteId = user.instituteId ?? null

  let pastResults: any[] = []
  let upcoming: any[] = []

  try {
    pastResults = await prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true, score: true, timeTaken: true, submittedAt: true, testId: true,
        test: { select: { title: true, subject: true, totalMarks: true, passingMarks: true } }
      }
    })

    const attemptedIds = pastResults.map(r => r.testId)
    upcoming = await prisma.test.findMany({
      where: {
        isActive: true,
        scheduledAt: { gte: new Date() },
        id: { notIn: attemptedIds },
        instituteId: instituteId ?? 'none',
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      select: { id: true, title: true, subject: true, duration: true, scheduledAt: true }
    })
  } catch (_) {
    // DB temporarily unreachable — render empty state
  }

  const results = pastResults.map(r => ({
    id: r.id,
    score: r.score,
    timeTaken: r.timeTaken,
    submittedAt: r.submittedAt.toISOString(),
    testId: r.testId,
    test: r.test,
  }))

  const upcomingForClient = upcoming.map(t => ({
    ...t,
    scheduledAt: t.scheduledAt.toISOString(),
  }))

  return <TestsPageClient upcoming={upcomingForClient} results={results} />
}
