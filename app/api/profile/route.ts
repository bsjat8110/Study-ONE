import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'
import { normalizeOptionalPhone, studentProfileUpdateSchema } from '@/lib/validation'

export async function PATCH(req: NextRequest) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const parsedBody = studentProfileUpdateSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 })
  }

  const { name, phone } = parsedBody.data
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (phone !== undefined) data.phone = normalizeOptionalPhone(phone)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ success: true })
}
