import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const joinSchema = z.object({
  instituteId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { instituteId } = joinSchema.parse(body)

    // Check if institute exists
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
    })

    if (!institute) {
      return NextResponse.json({ error: 'Invalid Institute ID' }, { status: 404 })
    }

    // Update user's instituteId
    await prisma.user.update({
      where: { id: session.user.id },
      data: { instituteId },
    })

    return NextResponse.json({ success: true, message: 'Joined successfully' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
