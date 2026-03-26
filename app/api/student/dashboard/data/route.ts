import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const now = new Date()

  try {
    const [enrollments, testResults, achievements, upcomingTests, userPoints, user] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        orderBy: { lastStudied: 'desc' },
        take: 4,
        include: { course: { select: { id: true, title: true, subject: true, totalChapters: true } } }
      }),
      prisma.testResult.findMany({
        where: { userId },
        select: { score: true, timeTaken: true, test: { select: { totalMarks: true } } }
      }),
      prisma.achievement.findMany({ 
        where: { userId },
        orderBy: { earnedAt: 'desc' },
        take: 5
      }),
      session.user.instituteId
        ? prisma.test.findMany({
            where: {
              instituteId: session.user.instituteId,
              isActive: true,
              scheduledAt: { gte: now },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 3,
          })
        : Promise.resolve([]),
      prisma.user.findUnique({ where: { id: userId }, select: { points: true } }).then(u => u?.points || 0),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, instituteId: true } })
    ])

    return NextResponse.json({
      enrollments,
      testResults,
      achievements,
      upcomingTests,
      userPoints,
      user
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
