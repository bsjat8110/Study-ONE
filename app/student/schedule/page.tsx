import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Schedule' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ScheduleClient from './ScheduleClient'

export default async function StudentSchedule() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.id) redirect('/login')

  const today = new Date()
  const todayStr = today.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  let upcomingTests: {
    id: string; title: string; subject: string | null; duration: number | null; totalMarks: number; scheduledAt: Date
  }[] = []
  let attemptedIds: string[] = []

  try {
    if (user.instituteId) {
      upcomingTests = await prisma.test.findMany({
        where: { instituteId: user.instituteId, isActive: true, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
        select: { id: true, title: true, subject: true, duration: true, totalMarks: true, scheduledAt: true },
      })
    }
    if (user.id) {
      const results = await prisma.testResult.findMany({
        where: { userId: user.id },
        select: { testId: true },
      })
      attemptedIds = results.map(r => r.testId)
    }
  } catch { /* DB connectivity issue */ }

  return <ScheduleClient upcomingTests={upcomingTests} attemptedIds={attemptedIds} todayStr={todayStr} />
}
