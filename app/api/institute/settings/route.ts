import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { instituteSettingsSchema, normalizeOptionalPhone } from '@/lib/validation'

export async function PATCH(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  try {
    const parsedBody = instituteSettingsSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }
    const { name, phone } = parsedBody.data

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, ...(phone !== undefined && { phone: normalizeOptionalPhone(phone) }) }
    })

    return NextResponse.json({ success: true, data: { name: updated.name, phone: updated.phone } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
