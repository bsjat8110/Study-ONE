import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const user = await requireSession()
  if (isNextResponse(user)) return user
  const { id } = await params

  const deleted = await prisma.enrollment.deleteMany({
    where: { id, userId: user.id }
  })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
