# Option B — Real Database Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** सभी hardcoded mock pages को real Neon PostgreSQL database से connect करना, API routes banana, aur enterprise-level data fetching implement karna.

**Architecture:** Next.js 14 App Router ke Server Components pages pe direct Prisma queries karte hain (initial render). Mutations aur client-side interactions ke liye API routes use hote hain. Institute data `instituteId` se filter hota hai (session se). Student data `userId` se.

**Tech Stack:** Next.js 14 App Router, Prisma 5 + Neon PostgreSQL, NextAuth v5 session, Recharts (analytics), TypeScript strict mode

---

## File Structure

### New Files to Create:
```
types/index.ts                          # Shared TypeScript types (API responses, DB shapes)
lib/auth-utils.ts                       # requireSession(), requireInstituteAdmin() helpers

app/api/students/route.ts               # GET (paginated, searchable), POST
app/api/students/[id]/route.ts          # PATCH (status toggle), DELETE
app/api/courses/route.ts                # GET, POST
app/api/courses/[id]/route.ts           # PATCH, DELETE
app/api/tests/route.ts                  # GET, POST
app/api/tests/[id]/route.ts             # PATCH, DELETE
app/api/payments/route.ts               # GET (institute payments)
app/api/analytics/route.ts             # GET (aggregated KPIs + trends)
app/api/enrollments/route.ts            # GET (student's enrolled courses with progress)
app/api/test-results/route.ts           # GET (student's past test results)
```

### Files to Modify:
```
app/institute/dashboard/page.tsx        # Real KPIs + recent students from DB
app/institute/students/page.tsx         # Real paginated list + search
app/institute/courses/page.tsx          # Real courses from DB
app/institute/tests/page.tsx            # Real tests from DB
app/institute/payments/page.tsx         # Real payment history
app/institute/analytics/page.tsx        # Recharts + real aggregated data
app/student/dashboard/page.tsx          # Real enrollments + test stats
app/student/courses/page.tsx            # Real enrolled courses + progress
app/student/tests/page.tsx              # Real upcoming + past tests
app/student/progress/page.tsx           # Real progress breakdown
app/student/achievements/page.tsx       # Real achievements from DB
```

---

## Task 1: Shared Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create types file**

```typescript
// types/index.ts

export type UserRole = 'STUDENT' | 'INSTITUTE_ADMIN' | 'SUPER_ADMIN'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  instituteId?: string | null
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  total?: number
}

export interface StudentListItem {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  enrollmentCount: number
  avgScore: number | null
}

export interface CourseListItem {
  id: string
  title: string
  subject: string
  totalChapters: number
  isActive: boolean
  enrollmentCount: number
  createdAt: string
}

export interface TestListItem {
  id: string
  title: string
  subject: string
  duration: number
  totalMarks: number
  passingMarks: number
  scheduledAt: string
  isActive: boolean
  resultCount: number
}

export interface PaymentListItem {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  method: string | null
  description: string | null
  createdAt: string
  user: { name: string; email: string }
}

export interface AnalyticsData {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  totalRevenue: number
  avgPassRate: number
  monthlyRevenue: { month: string; revenue: number }[]
  topStudents: { name: string; avgScore: number }[]
}

export interface EnrollmentWithCourse {
  id: string
  progress: number
  lastStudied: string
  course: {
    id: string
    title: string
    subject: string
    totalChapters: number
  }
}

export interface TestResultWithTest {
  id: string
  score: number
  timeTaken: number
  submittedAt: string
  test: {
    id: string
    title: string
    subject: string
    totalMarks: number
    passingMarks: number
    scheduledAt: string
  }
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types for API layer"
```

---

## Task 2: Auth Helper Utilities

**Files:**
- Create: `lib/auth-utils.ts`

- [ ] **Step 1: Create auth utilities**

```typescript
// lib/auth-utils.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { SessionUser } from '@/types'

export async function requireSession(): Promise<SessionUser | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session.user as SessionUser
}

export async function requireInstituteAdmin(): Promise<SessionUser | NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = session.user as SessionUser
  if (user.role !== 'INSTITUTE_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!user.instituteId) {
    return NextResponse.json({ error: 'No institute associated' }, { status: 403 })
  }
  return user
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth-utils.ts
git commit -m "feat: add auth utility helpers for API routes"
```

---

## Task 3: Students API

**Files:**
- Create: `app/api/students/route.ts`
- Create: `app/api/students/[id]/route.ts`

- [ ] **Step 1: Create GET + POST students route**

```typescript
// app/api/students/route.ts
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
    const { name, email, password } = await req.json()
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
```

- [ ] **Step 2: Create PATCH + DELETE student route**

```typescript
// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { isActive } = await req.json()
  const student = await prisma.user.updateMany({
    where: { id: params.id, instituteId: user.instituteId!, role: 'STUDENT' },
    data: { isActive }
  })
  if (student.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  // Soft-delete only — hard delete would cascade-fail due to FK relations (Enrollment, TestResult, etc.)
  const updated = await prisma.user.updateMany({
    where: { id: params.id, instituteId: user.instituteId!, role: 'STUDENT' },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/students/
git commit -m "feat: add students REST API with auth guard"
```

---

## Task 4: Courses API

**Files:**
- Create: `app/api/courses/route.ts`
- Create: `app/api/courses/[id]/route.ts`

- [ ] **Step 1: Create courses API**

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const courses = await prisma.course.findMany({
    where: { instituteId: user.instituteId! },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } }
  })

  const data = courses.map(c => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    totalChapters: c.totalChapters,
    isActive: c.isActive,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt.toISOString(),
  }))

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { title, subject, description } = await req.json()
  if (!title || !subject) {
    return NextResponse.json({ error: 'title and subject are required' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: { title, subject, description, instituteId: user.instituteId! },
    select: { id: true, title: true }
  })
  return NextResponse.json({ data: course }, { status: 201 })
}
```

```typescript
// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const body = await req.json()
  // Allowlist only safe fields — prevent instituteId or createdAt injection
  const { title, subject, description, isActive } = body
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (subject !== undefined) data.subject = subject
  if (description !== undefined) data.description = description
  if (isActive !== undefined) data.isActive = isActive

  const course = await prisma.course.updateMany({
    where: { id: params.id, instituteId: user.instituteId! },
    data
  })
  if (course.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const deleted = await prisma.course.deleteMany({
    where: { id: params.id, instituteId: user.instituteId! }
  })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/courses/
git commit -m "feat: add courses REST API"
```

---

## Task 5: Tests API

**Files:**
- Create: `app/api/tests/route.ts`
- Create: `app/api/tests/[id]/route.ts`

- [ ] **Step 1: Create tests API**

```typescript
// app/api/tests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const tests = await prisma.test.findMany({
    where: { instituteId: user.instituteId! },
    orderBy: { scheduledAt: 'desc' },
    include: { _count: { select: { testResults: true } } }
  })

  const data = tests.map(t => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    duration: t.duration,
    totalMarks: t.totalMarks,
    passingMarks: t.passingMarks,
    scheduledAt: t.scheduledAt.toISOString(),
    isActive: t.isActive,
    resultCount: t._count.testResults,
  }))

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { title, subject, duration, totalMarks, passingMarks, scheduledAt } = await req.json()
  if (!title || !subject || !scheduledAt) {
    return NextResponse.json({ error: 'title, subject, scheduledAt are required' }, { status: 400 })
  }

  const test = await prisma.test.create({
    data: {
      title, subject,
      duration: duration || 60,
      totalMarks: totalMarks || 100,
      passingMarks: passingMarks || 40,
      scheduledAt: new Date(scheduledAt),
      instituteId: user.instituteId!,
    },
    select: { id: true, title: true }
  })
  return NextResponse.json({ data: test }, { status: 201 })
}
```

```typescript
// app/api/tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const body = await req.json()
  const { title, subject, duration, totalMarks, passingMarks, isActive } = body
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (subject !== undefined) data.subject = subject
  if (duration !== undefined) data.duration = duration
  if (totalMarks !== undefined) data.totalMarks = totalMarks
  if (passingMarks !== undefined) data.passingMarks = passingMarks
  if (isActive !== undefined) data.isActive = isActive

  const test = await prisma.test.updateMany({
    where: { id: params.id, instituteId: user.instituteId! },
    data
  })
  if (test.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const deleted = await prisma.test.deleteMany({
    where: { id: params.id, instituteId: user.instituteId! }
  })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/tests/
git commit -m "feat: add tests REST API"
```

---

## Task 6: Payments & Analytics API

**Files:**
- Create: `app/api/payments/route.ts`
- Create: `app/api/analytics/route.ts`

- [ ] **Step 1: Create payments API**

```typescript
// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')

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

  // Revenue stats
  const completed = payments.filter(p => p.status === 'COMPLETED')
  const pending = payments.filter(p => p.status === 'PENDING')
  const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0)

  return NextResponse.json({ data, totalRevenue, pendingAmount, pendingCount: pending.length })
}
```

- [ ] **Step 2: Create analytics API**

```typescript
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const instituteId = user.instituteId!

  const [
    totalStudents,
    activeStudents,
    totalCourses,
    payments,
    testResults,
    topStudents,
    recentStudents,
  ] = await Promise.all([
    prisma.user.count({ where: { instituteId, role: 'STUDENT' } }),
    prisma.user.count({ where: { instituteId, role: 'STUDENT', isActive: true } }),
    prisma.course.count({ where: { instituteId } }),
    prisma.payment.findMany({
      where: { instituteId, status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    }),
    prisma.testResult.findMany({
      where: { test: { instituteId } },
      select: { score: true, test: { select: { passingMarks: true } } },
      take: 500
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { testResults: { _count: 'desc' } },
      take: 4,
      select: {
        name: true,
        testResults: { select: { score: true } }
      }
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, name: true, isActive: true,
        enrollments: { select: { course: { select: { title: true } } }, take: 1 }
      }
    }),
  ])

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  // avgPassRate = % of test attempts where score >= passingMarks
  // testResults must include passingMarks — update the query above to include it
  const passCount = testResults.filter((r: any) => r.score >= (r.test?.passingMarks ?? 40)).length
  const avgPassRate = testResults.length > 0
    ? Math.round((passCount / testResults.length) * 100)
    : 0

  // Monthly revenue (last 6 months)
  const now = new Date()
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthName = d.toLocaleString('en', { month: 'short' })
    const revenue = payments
      .filter(p => {
        const pd = new Date(p.createdAt)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: monthName, revenue }
  })

  const topStudentsData = topStudents.map(s => ({
    name: s.name,
    avgScore: s.testResults.length > 0
      ? Math.round(s.testResults.reduce((sum, r) => sum + r.score, 0) / s.testResults.length)
      : 0
  })).sort((a, b) => b.avgScore - a.avgScore)

  return NextResponse.json({
    data: {
      totalStudents,
      activeStudents,
      totalCourses,
      totalRevenue,
      avgPassRate,
      monthlyRevenue,
      topStudents: topStudentsData,
      recentStudents: recentStudents.map(s => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
        course: s.enrollments[0]?.course.title || 'Not Enrolled'
      })),
    }
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/payments/ app/api/analytics/
git commit -m "feat: add payments and analytics API"
```

---

## Task 7: Student APIs

**Files:**
- Create: `app/api/enrollments/route.ts`
- Create: `app/api/test-results/route.ts`

- [ ] **Step 1: Create enrollments API**

```typescript
// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

export async function GET() {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { lastStudied: 'desc' },
    include: {
      course: {
        select: { id: true, title: true, subject: true, totalChapters: true }
      }
    }
  })

  const data = enrollments.map(e => ({
    id: e.id,
    progress: e.progress,
    lastStudied: e.lastStudied.toISOString(),
    course: e.course,
  }))

  return NextResponse.json({ data })
}
```

- [ ] **Step 2: Create test-results API**

```typescript
// app/api/test-results/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

export async function GET() {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const results = await prisma.testResult.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      test: {
        select: { id: true, title: true, subject: true, totalMarks: true, passingMarks: true, scheduledAt: true }
      }
    }
  })

  // Also fetch upcoming tests (not yet attempted by student)
  const attempted = results.map(r => r.testId)
  const upcomingTests = await prisma.test.findMany({
    where: {
      isActive: true,
      scheduledAt: { gte: new Date() },
      id: { notIn: attempted },
      // Filter by student's instituteId directly (safe, available in session)
      ...(user.instituteId ? { instituteId: user.instituteId } : {})
    },
    orderBy: { scheduledAt: 'asc' },
    take: 5,
    select: { id: true, title: true, subject: true, duration: true, scheduledAt: true }
  })

  return NextResponse.json({
    results: results.map(r => ({
      id: r.id,
      score: r.score,
      timeTaken: r.timeTaken,
      submittedAt: r.submittedAt.toISOString(),
      test: r.test,
    })),
    upcoming: upcomingTests.map(t => ({
      ...t,
      scheduledAt: t.scheduledAt.toISOString()
    }))
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/enrollments/ app/api/test-results/
git commit -m "feat: add student enrollments and test-results API"
```

---

## Task 8: Institute Dashboard — Real Data

**Files:**
- Modify: `app/institute/dashboard/page.tsx`

- [ ] **Step 1: Replace with server component fetching real data**

```typescript
// app/institute/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Users, BookOpen, IndianRupee, Trophy, TrendingUp } from 'lucide-react'

export default async function InstituteDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.instituteId) redirect('/login')

  const instituteId = user.instituteId

  const [totalStudents, activeStudents, totalCourses, payments, testResults, recentStudents] = await Promise.all([
    prisma.user.count({ where: { instituteId, role: 'STUDENT' } }),
    prisma.user.count({ where: { instituteId, role: 'STUDENT', isActive: true } }),
    prisma.course.count({ where: { instituteId, isActive: true } }),
    prisma.payment.findMany({
      where: { instituteId, status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    }),
    prisma.testResult.findMany({
      where: { test: { instituteId } },
      select: { score: true, test: { select: { passingMarks: true, totalMarks: true } } },
      take: 200
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, name: true, isActive: true,
        enrollments: { select: { course: { select: { title: true } } }, take: 1 }
      }
    })
  ])

  // Current month revenue
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRevenue = payments
    .filter(p => new Date(p.createdAt) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0)

  const passCount = testResults.filter(r => r.score >= r.test.passingMarks).length
  const avgPassRate = testResults.length > 0
    ? Math.round((passCount / testResults.length) * 100)
    : 0

  // Monthly enrollment trend (last 6 months) - use payment dates as proxy
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const revenue = payments
      .filter(p => {
        const pd = new Date(p.createdAt)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: d.toLocaleString('en', { month: 'short' }), revenue }
  })
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  const kpis = [
    { label: 'Total Students', value: totalStudents.toLocaleString(), change: `${activeStudents} Active`, isUp: true, icon: Users, color: 'text-primary', border: 'border-primary/30' },
    { label: 'Active Courses', value: totalCourses.toString(), change: 'Published', isUp: true, icon: BookOpen, color: 'text-secondary', border: 'border-secondary/30' },
    { label: 'Revenue (MTD)', value: `₹${(monthRevenue / 1000).toFixed(1)}K`, change: 'This month', isUp: true, icon: IndianRupee, color: 'text-emerald-400', border: 'border-emerald-400/30' },
    { label: 'Avg. Pass Rate', value: `${avgPassRate}%`, change: `${testResults.length} tests`, isUp: avgPassRate >= 70, icon: Trophy, color: 'text-tertiary', border: 'border-tertiary/30' },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300`}>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity bg-current ${kpi.color}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-surface-lowest border ${kpi.border}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-surface-lowest border ${kpi.isUp ? 'text-emerald-400 border-emerald-400/20' : 'text-rose-400 border-rose-400/20'}`}>
                <TrendingUp className={`w-3 h-3 ${!kpi.isUp ? 'rotate-180' : ''}`} />
                {kpi.change}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-space-grotesk font-bold text-white mb-1">{kpi.value}</h3>
              <p className="text-outline text-sm uppercase tracking-wide">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-space-grotesk font-bold text-white">Revenue Trends</h3>
              <p className="text-outline text-xs mt-1">Last 6 months</p>
            </div>
          </div>
          <div className="flex-1 w-full bg-surface-lowest/50 rounded-xl border border-outline-variant/20 flex items-end justify-between p-4 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-primary/20 to-transparent opacity-50 pointer-events-none" />
            {monthlyData.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-[14%]">
                <div
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-sm relative"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-outline">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-space-grotesk font-bold text-white">Recent Students</h3>
            <a href="/institute/students" className="text-primary text-xs hover:underline">View All</a>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {recentStudents.length === 0 ? (
              <p className="text-outline text-sm text-center py-8">No students yet. Add students to get started.</p>
            ) : recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-bright/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center font-bold text-white text-xs border border-outline-variant/50">
                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{student.name}</h4>
                    <p className="text-xs text-outline truncate w-32">{student.enrollments[0]?.course.title || 'Not Enrolled'}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold border ${student.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser** — Visit `http://localhost:3000/institute/dashboard`. KPIs should show 0 (empty DB) or real data (if seed ran).

- [ ] **Step 3: Commit**

```bash
git add app/institute/dashboard/page.tsx
git commit -m "feat: connect institute dashboard to real database"
```

---

## Task 9: Institute Students Page — Real Data + Search

**Files:**
- Modify: `app/institute/students/page.tsx` — convert to server component for initial load, client search via API

- [ ] **Step 1: Replace with server component + client search**

```typescript
// app/institute/students/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import StudentsClient from './StudentsClient'

export default async function InstituteStudents() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.instituteId) redirect('/login')

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where: { instituteId: user.instituteId, role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, name: true, email: true, isActive: true, createdAt: true,
        _count: { select: { enrollments: true } },
        testResults: { select: { score: true } },
      }
    }),
    prisma.user.count({ where: { instituteId: user.instituteId, role: 'STUDENT' } })
  ])

  const initialStudents = students.map(s => ({
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

  return <StudentsClient initialStudents={initialStudents} total={total} />
}
```

- [ ] **Step 2: Create StudentsClient component**

Create file: `app/institute/students/StudentsClient.tsx`

```typescript
'use client'
import { useState, useCallback, useRef } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import type { StudentListItem } from '@/types'

interface Props {
  initialStudents: StudentListItem[]
  total: number
}

export default function StudentsClient({ initialStudents, total }: Props) {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCount] = useState(() => initialStudents.filter(s => s.isActive).length)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  const fetchStudents = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(q)}&limit=20`)
      const json = await res.json()
      setStudents(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearch(q)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchStudents(q), 300)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">Student Directory</h1>
          <p className="text-outline">Manage enrollments, track performance, and filter student records.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm shadow-glow-sm hover:scale-105 transition-all">
          + Add New Student
        </button>
      </div>

      <div className="glass-card rounded-3xl border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name or email..."
              className="w-full bg-surface-lowest border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-outline">
            <span>Total: {total.toLocaleString()}</span>
            <div className="w-px h-4 bg-outline-variant/50" />
            <span className="text-primary flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {activeCount} Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs uppercase tracking-wider text-outline-variant bg-surface-highest/30">
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Enrolled Courses</th>
                <th className="p-4 font-bold">Avg Score</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/20">
                    <td className="p-4"><div className="h-10 bg-surface-highest/50 rounded-lg animate-pulse w-48" /></td>
                    <td className="p-4"><div className="h-6 bg-surface-highest/50 rounded animate-pulse w-16" /></td>
                    <td className="p-4"><div className="h-6 bg-surface-highest/50 rounded animate-pulse w-16" /></td>
                    <td className="p-4"><div className="h-6 bg-surface-highest/50 rounded animate-pulse w-24" /></td>
                    <td className="p-4"><div className="h-6 bg-surface-highest/50 rounded animate-pulse w-16" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-outline">
                    {search ? `No students found for "${search}"` : 'No students yet. Add students to get started.'}
                  </td>
                </tr>
              ) : students.map((student) => (
                <tr key={student.id} className="border-b border-outline-variant/20 hover:bg-surface-highest/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface-highest to-surface-lowest border border-outline-variant/50 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5">{student.name}</div>
                        <div className="text-xs text-outline">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white font-bold">{student.enrollmentCount}</td>
                  <td className="p-4">
                    {student.avgScore != null ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {student.avgScore}%
                      </div>
                    ) : (
                      <span className="text-outline text-xs">No tests</span>
                    )}
                  </td>
                  <td className="p-4 text-outline text-xs">
                    {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    {student.isActive ? (
                      <span className="flex items-center gap-1.5 text-xs text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-outline">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" /> Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-outline">
          <div>Showing {students.length} of {total.toLocaleString()} students</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/institute/students/
git commit -m "feat: connect students page to database with live search"
```

---

## Task 10: Institute Courses, Tests, Payments Pages

**Files:**
- Modify: `app/institute/courses/page.tsx`
- Modify: `app/institute/tests/page.tsx`
- Modify: `app/institute/payments/page.tsx`

- [ ] **Step 1: Update courses page with real data**

Replace the page with a server component that queries Prisma directly (same pattern as dashboard — see Task 8 for reference). Fetch `prisma.course.findMany` with `_count: { enrollments: true }`. Render results using the same card UI as existing mock, but with real values.

- [ ] **Step 2: Update tests page with real data**

Query `prisma.test.findMany` for the institute, include `_count: { testResults: true }`. Display upcoming vs past tests based on `scheduledAt`.

- [ ] **Step 3: Update payments page with real data**

Query `prisma.payment.findMany` with `include: { user: true }`. Calculate `totalRevenue` (COMPLETED sum), `pendingAmount` (PENDING sum). Display in existing table UI.

- [ ] **Step 4: Commit**

```bash
git add app/institute/courses/page.tsx app/institute/tests/page.tsx app/institute/payments/page.tsx
git commit -m "feat: connect institute courses, tests, payments to database"
```

---

## Task 11: Institute Analytics — Recharts

**Files:**
- Modify: `app/institute/analytics/page.tsx`

- [ ] **Step 1: Create server data fetch + client chart wrapper**

Create `app/institute/analytics/AnalyticsCharts.tsx` as a client component using Recharts `BarChart` and `LineChart`. The parent `page.tsx` (server component) fetches data and passes it as props.

```typescript
// app/institute/analytics/page.tsx (server component)
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AnalyticsCharts from './AnalyticsCharts'

export default async function InstituteAnalytics() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.instituteId) redirect('/login')

  const instituteId = user.instituteId
  const now = new Date()

  const [payments, testResults, topStudents] = await Promise.all([
    prisma.payment.findMany({
      where: { instituteId, status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    }),
    prisma.testResult.findMany({
      where: { test: { instituteId } },
      select: { score: true, test: { select: { totalMarks: true } } },
      take: 500
    }),
    prisma.user.findMany({
      where: { instituteId, role: 'STUDENT' },
      take: 4,
      select: { name: true, testResults: { select: { score: true } } }
    })
  ])

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const revenue = payments
      .filter(p => {
        const pd = new Date(p.createdAt)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: d.toLocaleString('en', { month: 'short' }), revenue }
  })

  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((s, r) => s + r.score, 0) / testResults.length)
    : 0

  const topStudentsData = topStudents.map(s => ({
    name: s.name.split(' ')[0],
    avgScore: s.testResults.length > 0
      ? Math.round(s.testResults.reduce((sum, r) => sum + r.score, 0) / s.testResults.length)
      : 0
  })).sort((a, b) => b.avgScore - a.avgScore)

  return (
    <AnalyticsCharts
      monthlyRevenue={monthlyRevenue}
      avgScore={avgScore}
      topStudents={topStudentsData}
    />
  )
}
```

```typescript
// app/institute/analytics/AnalyticsCharts.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity } from 'lucide-react'

interface Props {
  monthlyRevenue: { month: string; revenue: number }[]
  avgScore: number
  topStudents: { name: string; avgScore: number }[]
}

export default function AnalyticsCharts({ monthlyRevenue, avgScore, topStudents }: Props) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2 flex items-center gap-3">
          Advanced Analytics
        </h1>
        <p className="text-outline">Deep insights into performance, engagement, and revenue.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 h-[400px] flex flex-col">
          <h3 className="font-space-grotesk font-bold text-white text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue Growth (6M)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#grad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Score Donut */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 h-[400px] flex flex-col">
          <h3 className="font-space-grotesk font-bold text-white text-lg mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" /> Average Test Score
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-[16px] border-surface-lowest relative flex items-center justify-center">
              <div
                className="absolute inset-[-16px] rounded-full border-[16px] border-secondary/80 border-t-transparent border-l-transparent"
                style={{ transform: `rotate(${(avgScore / 100) * 360}deg)` }}
              />
              <div className="text-center">
                <div className="text-3xl font-space-grotesk font-bold text-white">{avgScore}%</div>
                <div className="text-[10px] text-outline font-bold uppercase tracking-wider">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className="glass-card p-6 rounded-2xl border-outline-variant/30">
        <h3 className="font-space-grotesk font-bold text-white text-lg mb-6">Top Performing Students</h3>
        {topStudents.length === 0 ? (
          <p className="text-outline text-center py-8">No test data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topStudents.map((student, i) => (
              <div key={i} className="bg-surface-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  #{i + 1}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{student.name}</div>
                  <div className="text-xs text-outline">{student.avgScore}% Avg</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/institute/analytics/
git commit -m "feat: connect analytics page with real Recharts visualization"
```

---

## Task 12: Student Dashboard — Real Data

**Files:**
- Modify: `app/student/dashboard/page.tsx`

- [ ] **Step 1: Fetch real enrollments + test stats**

```typescript
// In page.tsx (server component), add to existing auth check:
const userId = (session.user as any).id
if (!userId) redirect('/login') // Guard: token.sub can be undefined

const [enrollments, testResults, achievements] = await Promise.all([
  prisma.enrollment.findMany({
    where: { userId },
    orderBy: { lastStudied: 'desc' },
    take: 3,
    include: { course: { select: { title: true, totalChapters: true } } }
  }),
  prisma.testResult.findMany({
    where: { userId },
    select: { score: true, test: { select: { totalMarks: true } } }
  }),
  prisma.achievement.count({ where: { userId } })
])

const avgScore = testResults.length > 0
  ? Math.round(testResults.reduce((s, r) => s + r.score, 0) / testResults.length)
  : 0
```

Replace hardcoded stats with real values: enrolled count, tests done, avg score, study hours (total timeTaken from testResults).

- [ ] **Step 2: Commit**

```bash
git add app/student/dashboard/page.tsx
git commit -m "feat: connect student dashboard to real data"
```

---

## Task 13: Student Courses, Tests, Progress, Achievements

**Files:**
- Modify: `app/student/courses/page.tsx`
- Modify: `app/student/tests/page.tsx`
- Modify: `app/student/progress/page.tsx`
- Modify: `app/student/achievements/page.tsx`

- [ ] **Step 1: Student Courses — real enrollments**

Fetch `prisma.enrollment.findMany({ where: { userId }, include: { course: true } })`. Map to the "Continue Learning" card UI. If no enrollments, show empty state.

- [ ] **Step 2: Student Tests — real upcoming + past**

Fetch upcoming tests (scheduled in future, not yet attempted) + past test results with scores and percentile approximation.

- [ ] **Step 3: Student Progress — real data**

Aggregate enrollment progress per course. Show subject-wise breakdown using total enrollments and their progress %.

- [ ] **Step 4: Student Achievements — real data**

Fetch `prisma.achievement.findMany({ where: { userId } })`. Show earned badges. If empty, show "No achievements yet. Start learning to earn badges!"

- [ ] **Step 5: Commit**

```bash
git add app/student/courses/page.tsx app/student/tests/page.tsx app/student/progress/page.tsx app/student/achievements/page.tsx
git commit -m "feat: connect all student pages to real database"
```

---

## Task 14: Final Verification

- [ ] **Step 1: Run database seed** (to have test data)

```bash
cd /Users/devil/Study-ONE
npx prisma db push
npx prisma db seed
```

- [ ] **Step 2: Start dev server and verify all pages**

```bash
npm run dev
```

Test checklist:
- [ ] Login as `student@studyone.com` / `password123` → redirects to `/student/dashboard`
- [ ] Login as `admin@studyone.com` / `password123` → redirects to `/institute/dashboard`
- [ ] Student cannot access `/institute/*` (redirected to login)
- [ ] Institute admin cannot access `/student/*` (redirected to student dashboard)
- [ ] All API endpoints return 401 when not authenticated
- [ ] Institute dashboard shows real KPIs (zeros until data added)
- [ ] Students page search works
- [ ] No TypeScript errors: `npx tsc --noEmit`

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Option B complete — all pages connected to real database"
```

---

## Summary

| Module | Files | Status |
|--------|-------|--------|
| Types + Auth Utils | `types/index.ts`, `lib/auth-utils.ts` | Task 1-2 |
| API: Students | `app/api/students/` | Task 3 |
| API: Courses | `app/api/courses/` | Task 4 |
| API: Tests | `app/api/tests/` | Task 5 |
| API: Payments + Analytics | `app/api/payments/`, `app/api/analytics/` | Task 6 |
| API: Student (Enrollments, Results) | `app/api/enrollments/`, `app/api/test-results/` | Task 7 |
| Institute Dashboard | `app/institute/dashboard/page.tsx` | Task 8 |
| Institute Students | `app/institute/students/page.tsx` | Task 9 |
| Institute Courses/Tests/Payments | 3 pages | Task 10 |
| Institute Analytics (Recharts) | `app/institute/analytics/` | Task 11 |
| Student Dashboard | `app/student/dashboard/page.tsx` | Task 12 |
| Student All Pages | 4 pages | Task 13 |
| Final Verification | — | Task 14 |
