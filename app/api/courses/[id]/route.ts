import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { updateCourseSchema } from '@/lib/validation'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  const parsedBody = updateCourseSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid course update' }, { status: 400 })
  }

  const { title, subject, description, totalChapters, isActive } = parsedBody.data
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (subject !== undefined) data.subject = subject
  if (description !== undefined) data.description = description
  if (totalChapters !== undefined) data.totalChapters = totalChapters
  if (isActive !== undefined) data.isActive = isActive

  const course = await prisma.course.updateMany({
    where: { id, instituteId: user.instituteId! },
    data
  })
  if (course.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  // Soft-delete to avoid FK constraint errors with existing enrollments
  const updated = await prisma.course.updateMany({
    where: { id, instituteId: user.instituteId! },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
