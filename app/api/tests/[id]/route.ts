import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, requireSession, isNextResponse } from '@/lib/auth-utils'
import { updateTestSchema } from '@/lib/validation'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const user = await requireSession()
  if (isNextResponse(user)) return user
  const { id } = await params

  const test = await prisma.test.findFirst({
    where: {
      id,
      isActive: true,
      ...(user.instituteId ? { instituteId: user.instituteId } : { instituteId: 'none' }),
    },
    select: { id: true, title: true, subject: true, duration: true, totalMarks: true, passingMarks: true, scheduledAt: true }
  })
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: { ...test, scheduledAt: test.scheduledAt.toISOString() } })
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  const parsedBody = updateTestSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid test update' }, { status: 400 })
  }

  const { title, subject, duration, totalMarks, passingMarks, isActive, scheduledAt } = parsedBody.data
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (subject !== undefined) data.subject = subject
  if (duration !== undefined) data.duration = duration
  if (totalMarks !== undefined) data.totalMarks = totalMarks
  if (passingMarks !== undefined) data.passingMarks = passingMarks
  if (isActive !== undefined) data.isActive = isActive
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt)

  const test = await prisma.test.updateMany({
    where: { id, instituteId: user.instituteId! },
    data
  })
  if (test.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  const updated = await prisma.test.updateMany({
    where: { id, instituteId: user.instituteId! },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
