// app/api/test-results/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-utils'
import { testResultSubmissionSchema } from '@/lib/validation'

export async function GET() {
  const user = await requireStudent()
  if (isNextResponse(user)) return user

  const results = await prisma.testResult.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      test: {
        select: { id: true, title: true, subject: true, totalMarks: true, passingMarks: true, scheduledAt: true }
      }
    }
  })

  // Also fetch upcoming tests (not yet attempted by student)
  const attempted = results.map(r => r.testId)
  const upcomingTests = await prisma.test.findMany({
    where: {
      isActive: true,
      scheduledAt: { gte: new Date() },
      id: { notIn: attempted },
      instituteId: user.instituteId ?? 'none',
    },
    orderBy: { scheduledAt: 'asc' },
    take: 5,
    select: { id: true, title: true, subject: true, duration: true, scheduledAt: true }
  })

  return NextResponse.json({
    results: results.map(r => ({
      id: r.id,
      score: r.score,
      timeTaken: r.timeTaken,
      submittedAt: r.submittedAt.toISOString(),
      test: {
        ...r.test,
        scheduledAt: r.test.scheduledAt ? r.test.scheduledAt.toISOString() : null,
      },
    })),
    upcoming: upcomingTests.map(t => ({
      ...t,
      scheduledAt: t.scheduledAt.toISOString()
    }))
  })
}

export async function POST(req: NextRequest) {
  const user = await requireStudent()
  if (isNextResponse(user)) return user

  const parsedBody = testResultSubmissionSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'testId, score, timeTaken required' }, { status: 400 })
  }
  const { testId, score, timeTaken } = parsedBody.data

  try {
    // Verify test exists, is active, and belongs to student's institute
    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        isActive: true,
        ...(user.instituteId ? { instituteId: user.instituteId } : {}),
      },
      select: { totalMarks: true, passingMarks: true }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or not available' }, { status: 404 })
    }

    // Score must be a valid number between 0 and totalMarks (inclusive)
    const parsedScore = Number(score)
    if (parsedScore > test.totalMarks) {
      return NextResponse.json(
        { error: `Score must be between 0 and ${test.totalMarks}` },
        { status: 400 }
      )
    }

    // timeTaken must be positive integer (seconds)
    const parsedTime = Number(timeTaken)
    if (parsedTime < 0) {
      return NextResponse.json({ error: 'Invalid timeTaken' }, { status: 400 })
    }

    const result = await prisma.testResult.create({
      data: { userId: user.id, testId, score: parsedScore, timeTaken: Math.round(parsedTime) },
      select: { id: true, score: true, timeTaken: true, submittedAt: true }
    })
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
