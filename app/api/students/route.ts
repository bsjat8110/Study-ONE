import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where = {
    instituteId: user.instituteId!,
    role: 'STUDENT' as const,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {})
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
        testResults: { select: { score: true } },
      }
    }),
    prisma.user.count({ where })
  ])

  const data = students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    enrollmentCount: s._count.enrollments,
    avgScore: s.testResults.length > 0
      ? Math.round(s.testResults.reduce((sum, r) => sum + r.score, 0) / s.testResults.length)
      : null,
  }))

  return NextResponse.json({ data, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  try {
    const { name, email, password, phone } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        instituteId: user.instituteId!,
        ...(phone ? { phone } : {}),
      },
      select: { id: true, name: true, email: true }
    })
    return NextResponse.json({ data: student }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
