// app/api/enrollments/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-utils'
import { enrollmentRequestSchema } from '@/lib/validation'

export async function GET() {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      orderBy: { lastStudied: 'desc' },
      include: {
        course: {
          select: { id: true, title: true, subject: true, totalChapters: true }
        }
      }
    })

    const data = enrollments.map(e => ({
      id: e.id,
      progress: e.progress,
      lastStudied: e.lastStudied.toISOString(),
      course: e.course,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[ENROLLMENTS_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireStudent()
  if (isNextResponse(user)) return user

  const parsedBody = enrollmentRequestSchema.safeParse(await req.json())
  if (!parsedBody.success) return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  const { courseId } = parsedBody.data

  try {
    // Verify course exists, is active, and belongs to the student's own institute
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
        ...(user.instituteId ? { instituteId: user.instituteId } : { instituteId: 'none' }),
      },
      select: { id: true, title: true, subject: true, totalChapters: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found or not available' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id },
      select: { id: true, progress: true, lastStudied: true }
    })

    return NextResponse.json({
      data: {
        id: enrollment.id,
        progress: enrollment.progress,
        lastStudied: enrollment.lastStudied.toISOString(),
        course,
      }
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
