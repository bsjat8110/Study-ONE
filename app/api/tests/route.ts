import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { createTestSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const user = await requireInstituteAdmin()
    if (isNextResponse(user)) return user

    const tests = await prisma.test.findMany({
      where: { instituteId: user.instituteId! },
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

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[TESTS_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireInstituteAdmin()
    if (isNextResponse(user)) return user

    const parsedBody = createTestSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid test data' }, { status: 400 })
    }
    const { title, subject, duration, totalMarks, passingMarks, scheduledAt } = parsedBody.data

    const test = await prisma.test.create({
      data: {
        title, subject,
        duration: duration || 60,
        totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 40,
        scheduledAt: new Date(scheduledAt),
        instituteId: user.instituteId!,
      },
      select: { id: true, title: true }
    })
    return NextResponse.json({ data: test }, { status: 201 })
  } catch (error) {
    console.error('[TESTS_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
