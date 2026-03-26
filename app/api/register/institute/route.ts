import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { registerInstituteSchema } from '@/lib/validation'
import { withDbRetry } from '@/lib/db-retry'

export async function POST(req: Request) {
  const ip = getIP(req)
  const rl = rateLimit(`register-institute:${ip}`, { limit: 3, windowSec: 3600 })
  if (!rl.success) {
    return NextResponse.json(
      { message: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const parsedBody = registerInstituteSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Invalid registration data' }, { status: 400 })
    }
    const { name, email, password, instituteName } = parsedBody.data

    const existingUser = await withDbRetry(() => prisma.user.findUnique({
      where: { email }
    }))

    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create Institute + Admin user in one transaction
    const result = await withDbRetry(() => prisma.$transaction(async (tx) => {
      const institute = await tx.institute.create({
        data: {
          name: instituteName,
          email,
        }
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'INSTITUTE_ADMIN',
          instituteId: institute.id,
        }
      })

      return { userId: user.id, instituteId: institute.id }
    }))

    return NextResponse.json({ message: 'Institute registered', ...result }, { status: 201 })
  } catch (error) {
    console.error('Institute registration error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
