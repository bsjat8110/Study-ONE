import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { jsonNoStore, noStoreHeaders, textNoStore } from '@/lib/http'

function toCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escape = (v: string | number | boolean | null | undefined) => {
    const s = v == null ? '' : String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) lines.push(row.map(escape).join(','))
  return lines.join('\r\n')
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId || user.role !== 'INSTITUTE_ADMIN') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }

  const type = req.nextUrl.searchParams.get('type') // 'payments' | 'students'

  if (type === 'payments') {
    const payments = await prisma.payment.findMany({
      where: { instituteId: user.instituteId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })

    const headers = ['Transaction ID', 'Student Name', 'Student Email', 'Amount (₹)', 'Status', 'Method', 'Description', 'Date']
    const rows = payments.map(p => [
      p.id,
      p.user.name,
      p.user.email,
      p.amount,
      p.status,
      p.method || '',
      p.description || '',
      new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ])

    const csv = toCSV(headers, rows)
    const filename = `payments_${new Date().toISOString().slice(0, 10)}.csv`

    return textNoStore(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  if (type === 'students') {
    const students = await prisma.user.findMany({
      where: { instituteId: user.instituteId, role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { enrollments: true, testResults: true } },
      },
    })

    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Status', 'Courses Enrolled', 'Tests Taken', 'Joined Date']
    const rows = students.map(s => [
      s.id,
      s.name,
      s.email,
      s.phone || '',
      s.isActive ? 'Active' : 'Inactive',
      s._count.enrollments,
      s._count.testResults,
      new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ])

    const csv = toCSV(headers, rows)
    const filename = `students_${new Date().toISOString().slice(0, 10)}.csv`

    return textNoStore(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  return jsonNoStore(
    { error: 'type must be "payments" or "students"' },
    { status: 400, headers: noStoreHeaders() }
  )
}
