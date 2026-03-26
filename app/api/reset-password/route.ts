import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { resetPasswordSchema } from '@/lib/validation'
import { jsonNoStore } from '@/lib/http'

function getResetSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured')
  }
  return new TextEncoder().encode(secret)
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody = resetPasswordSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return jsonNoStore({ error: 'token and password are required' }, { status: 400 })
    }
    const { token, password } = parsedBody.data

    // Verify and decode the JWT
    let payload: { sub?: string; email?: string }
    try {
      const result = await jwtVerify(token, getResetSecret())
      payload = result.payload as { sub?: string; email?: string }
    } catch {
      return jsonNoStore({ error: 'Reset link is invalid or has expired' }, { status: 400 })
    }

    if (!payload.sub) {
      return jsonNoStore({ error: 'Invalid token' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashed },
    })

    return jsonNoStore({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return jsonNoStore({ error: 'Internal server error' }, { status: 500 })
  }
}
