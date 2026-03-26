import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { registerStudentSchema } from '@/lib/validation'
import { withDbRetry } from '@/lib/db-retry'

export async function POST(req: Request) {
  // Rate limit: 5 registrations per IP per hour
  const ip = getIP(req)
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowSec: 3600 })
  if (!rl.success) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const parsedBody = registerStudentSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Invalid registration data' }, { status: 400 })
    }
    const { name, email, password } = parsedBody.data

    const existingUser = await withDbRetry(() => prisma.user.findUnique({
      where: { email }
    }))

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Role is ALWAYS STUDENT on self-registration — never accept from client
    const user = await withDbRetry(() => prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      }
    }))

    return NextResponse.json({ message: 'User created', user: { id: user.id } }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
