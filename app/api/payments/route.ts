// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'
import { jsonNoStore } from '@/lib/http'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { searchParams } = new URL(req.url)
  const raw = parseInt(searchParams.get('limit') ?? '', 10)
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 200) : 50

  const payments = await prisma.payment.findMany({
    where: { instituteId: user.instituteId! },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { name: true, email: true } } }
  })

  const data = payments.map(p => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
  }))

  // Revenue stats — computed over ALL institute payments, not just this page
  const [completedAgg, pendingAgg] = await Promise.all([
    prisma.payment.aggregate({
      where: { instituteId: user.instituteId!, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { instituteId: user.instituteId!, status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    }),
  ])
  const totalRevenue = completedAgg._sum.amount ?? 0
  const pendingAmount = pendingAgg._sum.amount ?? 0
  const pendingCount = pendingAgg._count

  return jsonNoStore({ data, totalRevenue, pendingAmount, pendingCount })
}
