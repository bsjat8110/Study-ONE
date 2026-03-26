import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { normalizeOptionalPhone, updateStudentSchema } from '@/lib/validation'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  const parsedBody = updateStudentSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid student update' }, { status: 400 })
  }

  const { isActive, name, phone } = parsedBody.data
  const data: Record<string, unknown> = {}
  if (isActive !== undefined) data.isActive = isActive
  if (name !== undefined) data.name = name
  if (phone !== undefined) data.phone = normalizeOptionalPhone(phone)

  const student = await prisma.user.updateMany({
    where: { id, instituteId: user.instituteId!, role: 'STUDENT' },
    data
  })
  if (student.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user
  const { id } = await params

  const updated = await prisma.user.updateMany({
    where: { id, instituteId: user.instituteId!, role: 'STUDENT' },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
