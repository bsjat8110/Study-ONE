import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { createCourseSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const user = await requireInstituteAdmin()
    if (isNextResponse(user)) return user

    const courses = await prisma.course.findMany({
      where: { instituteId: user.instituteId! },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true } } }
    })

    const data = courses.map(c => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      totalChapters: c.totalChapters,
      isActive: c.isActive,
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[COURSES_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireInstituteAdmin()
    if (isNextResponse(user)) return user

    const body = await req.json()
    const parsedBody = createCourseSchema.safeParse(body)
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid course data', details: parsedBody.error.flatten() }, { status: 400 })
    }
    const { title, subject, description, totalChapters, isActive } = parsedBody.data

    const course = await prisma.course.create({
      data: {
        title, subject, description,
        ...(totalChapters !== undefined ? { totalChapters } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        instituteId: user.instituteId!,
      },
      select: { id: true, title: true }
    })
    return NextResponse.json({ data: course }, { status: 201 })
  } catch (error) {
    console.error('[COURSES_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
