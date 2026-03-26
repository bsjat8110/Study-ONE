import { NextRequest, NextResponse } from 'next/server'
import { requireStudent, isNextResponse } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { dailyTokensUsed: true, lastTokenReset: true }
    })

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const lastReset = new Date(fullUser.lastTokenReset)
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    return NextResponse.json({
      dailyTokensUsed: isNewDay ? 0 : fullUser.dailyTokensUsed,
      limit: 100000,
      isNewDay
    })
  } catch (error) {
    console.error('Usage fetch error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
