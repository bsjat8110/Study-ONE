import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Tests' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TestsClient from './TestsClient'

export default async function InstituteTests() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId) redirect('/login')

  const tests = await prisma.test.findMany({
    where: { instituteId: user.instituteId },
    orderBy: { scheduledAt: 'desc' },
    include: { _count: { select: { testResults: true } } }
  })

  const data = tests.map(t => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    duration: t.duration,
    totalMarks: t.totalMarks,
    passingMarks: t.passingMarks,
    scheduledAt: t.scheduledAt.toISOString(),
    isActive: t.isActive,
    resultCount: t._count.testResults,
  }))

  return <TestsClient initialTests={data} />
}
