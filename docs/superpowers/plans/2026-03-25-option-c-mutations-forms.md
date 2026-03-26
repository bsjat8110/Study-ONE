# Option C — Mutations & Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** सभी dead CRUD buttons को functional बनाना — Institute side (Students/Courses/Tests) और Student side (Profile/Enrollment/Test Attempt) — inline expand UI, React Hook Form validation, existing REST API routes।

**Architecture:** Every page follows Server Component → Client Component pattern. Inline expand uses Tailwind `max-h-0` → `max-h-[600px]` CSS transition. Forms use `react-hook-form`, submit via `fetch` to existing API routes, update parent list state optimistically (no full page reload). react-hook-form + @hookform/resolvers + zod are already installed.

**Tech Stack:** Next.js 14 App Router, React Hook Form 7, TypeScript strict, Tailwind CSS, Prisma 5 + Neon PostgreSQL, NextAuth v5

---

## Context for All Subagents

- Project root: `/Users/devil/Study-ONE`
- Auth utilities: `lib/auth-utils.ts` — `requireSession()` (any logged-in user), `requireInstituteAdmin()` (INSTITUTE_ADMIN or SUPER_ADMIN only), `isNextResponse(val)`
- All API routes return `NextResponse.json({ data })` on success, `NextResponse.json({ error })` on failure
- Existing CSS classes (Tailwind-based design system):
  - `glass-card` — dark glass panel
  - `bg-gradient-primary` — blue-purple gradient
  - `text-outline` — muted gray text
  - `bg-surface-lowest`, `bg-surface-highest` — dark surface variants
  - `border-outline-variant/30` — subtle border
  - `shadow-glow-sm`, `shadow-glow-primary` — glow effects
  - `font-space-grotesk` — heading font
- TypeScript: run `npx tsc --noEmit` to verify after each task (zero errors expected)
- Inline expand pattern: `<div className={\`overflow-hidden transition-all duration-300 \${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}\`}>`

---

## Task 1: Extend Existing API Routes

**Files:**
- Modify: `app/api/students/route.ts` (POST: add phone)
- Modify: `app/api/students/[id]/route.ts` (PATCH: add name, phone to allowlist)
- Modify: `app/api/tests/[id]/route.ts` (PATCH: add scheduledAt to allowlist)

- [ ] **Step 1: Extend POST /api/students to accept phone**

In `app/api/students/route.ts`, replace the POST handler body:

```typescript
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
      select: { id: true, name: true, email: true, isActive: true, createdAt: true }
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

- [ ] **Step 2: Extend PATCH /api/students/[id] to accept name, phone**

Replace full file `app/api/students/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, isNextResponse } from '@/lib/auth-utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const body = await req.json()
  const { isActive, name, phone } = body
  const data: Record<string, unknown> = {}
  if (isActive !== undefined) data.isActive = isActive
  if (name !== undefined) data.name = name
  if (phone !== undefined) data.phone = phone

  const student = await prisma.user.updateMany({
    where: { id: params.id, instituteId: user.instituteId!, role: 'STUDENT' },
    data
  })
  if (student.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const updated = await prisma.user.updateMany({
    where: { id: params.id, instituteId: user.instituteId!, role: 'STUDENT' },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Add scheduledAt to PATCH and add GET to /api/tests/[id]**

Replace full file `app/api/tests/[id]/route.ts` (keep DELETE, extend PATCH, add GET):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireInstituteAdmin, requireSession, isNextResponse } from '@/lib/auth-utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const test = await prisma.test.findFirst({
    where: { id: params.id, isActive: true },
    select: { id: true, title: true, subject: true, duration: true, totalMarks: true, passingMarks: true, scheduledAt: true }
  })
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: { ...test, scheduledAt: test.scheduledAt.toISOString() } })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireInstituteAdmin()
  if (isNextResponse(user)) return user

  const body = await req.json()
  const { title, subject, duration, totalMarks, passingMarks, isActive, scheduledAt } = body
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (subject !== undefined) data.subject = subject
  if (duration !== undefined) data.duration = duration
  if (totalMarks !== undefined) data.totalMarks = totalMarks
  if (passingMarks !== undefined) data.passingMarks = passingMarks
  if (isActive !== undefined) data.isActive = isActive
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt)

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

  const updated = await prisma.test.updateMany({
    where: { id: params.id, instituteId: user.instituteId! },
    data: { isActive: false }
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 5: Commit**

```bash
git add app/api/students/route.ts app/api/students/[id]/route.ts app/api/tests/[id]/route.ts
git commit -m "fix: extend students PATCH/POST and tests PATCH to accept more fields"
```

---

## Task 2: New API Routes

**Files:**
- Modify: `app/api/enrollments/route.ts` (add POST handler)
- Create: `app/api/enrollments/[id]/route.ts` (DELETE)
- Modify: `app/api/test-results/route.ts` (add POST handler)
- Create: `app/api/profile/route.ts` (PATCH — student self-edit)

- [ ] **Step 1: Add POST to /api/enrollments**

Append to `app/api/enrollments/route.ts` (keep existing GET):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

export async function GET() {
  // ... existing GET code unchanged ...
}

export async function POST(req: NextRequest) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId },
      include: { course: { select: { id: true, title: true, subject: true, totalChapters: true } } }
    })
    return NextResponse.json({
      data: {
        id: enrollment.id,
        progress: enrollment.progress,
        lastStudied: enrollment.lastStudied.toISOString(),
        course: enrollment.course,
      }
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create DELETE /api/enrollments/[id]**

Create `app/api/enrollments/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const deleted = await prisma.enrollment.deleteMany({
    where: { id: params.id, userId: user.id }
  })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Add POST to /api/test-results**

Append to `app/api/test-results/route.ts` (keep existing GET):

```typescript
export async function POST(req: NextRequest) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const { testId, score, timeTaken } = await req.json()
  if (!testId || score === undefined || timeTaken === undefined) {
    return NextResponse.json({ error: 'testId, score, timeTaken required' }, { status: 400 })
  }

  try {
    const result = await prisma.testResult.create({
      data: { userId: user.id, testId, score: Number(score), timeTaken: Number(timeTaken) },
      select: { id: true, score: true, timeTaken: true, submittedAt: true }
    })
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create PATCH /api/profile**

Create `app/api/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-utils'

export async function PATCH(req: NextRequest) {
  const user = await requireSession()
  if (isNextResponse(user)) return user

  const body = await req.json()
  const { name, phone } = body
  const data: Record<string, unknown> = {}
  if (name !== undefined && name.trim()) data.name = name.trim()
  if (phone !== undefined) data.phone = phone || null

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 6: Commit**

```bash
git add app/api/enrollments/route.ts app/api/enrollments/[id]/route.ts app/api/test-results/route.ts app/api/profile/route.ts
git commit -m "feat: add POST enrollments, DELETE enrollment, POST test-results, PATCH profile"
```

---

## Task 3: Institute Students CRUD

**Files:**
- Modify: `app/institute/students/StudentsClient.tsx` (add inline add/edit/delete forms)

Replace entire `app/institute/students/StudentsClient.tsx`:

- [ ] **Step 1: Write StudentsClient with full CRUD**

```typescript
'use client'
import { useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Search, ShieldCheck, Plus, Pencil, Trash2, X } from 'lucide-react'
import type { StudentListItem } from '@/types'

type AddForm = { name: string; email: string; password: string; phone?: string }
type EditForm = { name: string; phone?: string; isActive: boolean }

interface Props {
  initialStudents: StudentListItem[]
  total: number
}

export default function StudentsClient({ initialStudents, total }: Props) {
  const [students, setStudents] = useState(initialStudents)
  const [totalCount, setTotalCount] = useState(total)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')
  const [editError, setEditError] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  const addForm = useForm<AddForm>()
  const editForm = useForm<EditForm>()

  const fetchStudents = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(q)}&limit=20`)
      const json = await res.json()
      setStudents(json.data)
      setTotalCount(json.total)
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

  const handleAdd = addForm.handleSubmit(async (data) => {
    setAddError('')
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) { setAddError(json.error || 'Something went wrong'); return }
    setStudents(prev => [{
      id: json.data.id, name: json.data.name, email: json.data.email,
      isActive: true, enrollmentCount: 0, avgScore: null,
      createdAt: new Date().toISOString(),
    }, ...prev])
    setTotalCount(c => c + 1)
    addForm.reset()
    setShowAdd(false)
  })

  const startEdit = (s: StudentListItem) => {
    setEditingId(s.id)
    editForm.reset({ name: s.name, phone: '', isActive: s.isActive })
    setEditError('')
  }

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editingId) return
    setEditError('')
    const res = await fetch(`/api/students/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { const j = await res.json(); setEditError(j.error || 'Error'); return }
    setStudents(prev => prev.map(s => s.id === editingId ? { ...s, name: data.name, isActive: data.isActive } : s))
    setEditingId(null)
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? This is a soft delete.`)) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s))
  }

  const activeCount = students.filter(s => s.isActive).length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">Student Directory</h1>
          <p className="text-outline">Manage enrollments, track performance, and filter student records.</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); addForm.reset(); setAddError('') }}
          className="px-5 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-primary/20 space-y-4">
          <h2 className="font-space-grotesk font-bold text-white text-lg">Add New Student</h2>
          {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">{addError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Full Name *</label>
              <input
                {...addForm.register('name', { required: 'Name is required' })}
                placeholder="Rahul Sharma"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {addForm.formState.errors.name && <p className="text-red-400 text-xs">{addForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Email *</label>
              <input
                {...addForm.register('email', { required: 'Email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                type="email"
                placeholder="student@example.com"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {addForm.formState.errors.email && <p className="text-red-400 text-xs">{addForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Password *</label>
              <input
                {...addForm.register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                type="password"
                placeholder="Min 6 characters"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {addForm.formState.errors.password && <p className="text-red-400 text-xs">{addForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Phone (optional)</label>
              <input
                {...addForm.register('phone')}
                placeholder="+91 9876543210"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={addForm.formState.isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm disabled:opacity-50 transition-all">
              {addForm.formState.isSubmitting ? 'Adding...' : 'Add Student'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-outline font-bold text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
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
            <span>Total: {totalCount.toLocaleString()}</span>
            <div className="w-px h-4 bg-outline-variant/50" />
            <span className="text-primary flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {activeCount} Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs uppercase tracking-wider text-outline-variant bg-surface-highest/30">
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Enrolled</th>
                <th className="p-4 font-bold">Avg Score</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/20">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-6 bg-surface-highest/50 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-outline">
                    {search ? `No students found for "${search}"` : 'No students yet.'}
                  </td>
                </tr>
              ) : students.map((student) => (
                <>
                  <tr key={student.id} className="border-b border-outline-variant/20 hover:bg-surface-highest/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface-highest to-surface-lowest border border-outline-variant/50 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                          {student.avgScore}%
                        </span>
                      ) : <span className="text-outline text-xs">No tests</span>}
                    </td>
                    <td className="p-4 text-outline text-xs">
                      {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {student.isActive
                        ? <span className="flex items-center gap-1.5 text-xs text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Active</span>
                        : <span className="flex items-center gap-1.5 text-xs text-outline"><span className="w-1.5 h-1.5 rounded-full bg-outline-variant" /> Inactive</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editingId === student.id ? setEditingId(null) : startEdit(student)}
                          className="p-2 rounded-lg bg-surface-lowest hover:bg-primary/10 hover:text-primary border border-outline-variant/30 text-outline transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-2 rounded-lg bg-surface-lowest hover:bg-red-500/10 hover:text-red-400 border border-outline-variant/30 text-outline transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Inline Edit Row */}
                  {editingId === student.id && (
                    <tr key={`edit-${student.id}`} className="border-b border-outline-variant/20 bg-surface-highest/10">
                      <td colSpan={6} className="px-4 py-3">
                        <form onSubmit={handleEdit} className="flex flex-wrap items-end gap-3">
                          {editError && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{editError}</div>}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-outline uppercase">Name</label>
                            <input
                              {...editForm.register('name', { required: true })}
                              className="bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all w-48"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-outline uppercase">Phone</label>
                            <input
                              {...editForm.register('phone')}
                              placeholder="Optional"
                              className="bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all w-40"
                            />
                          </div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <input type="checkbox" {...editForm.register('isActive')} id={`active-${student.id}`} className="w-4 h-4 accent-primary" />
                            <label htmlFor={`active-${student.id}`} className="text-sm text-white font-bold cursor-pointer">Active</label>
                          </div>
                          <button type="submit" disabled={editForm.formState.isSubmitting} className="px-4 py-2 rounded-lg bg-gradient-primary text-surface-dim font-bold text-xs disabled:opacity-50">
                            {editForm.formState.isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="p-2 rounded-lg border border-outline-variant/30 text-outline hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-outline">
          <div>Showing {students.length} of {totalCount.toLocaleString()} students</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add app/institute/students/StudentsClient.tsx
git commit -m "feat: institute students CRUD — add/edit/delete inline forms"
```

---

## Task 4: Institute Courses CRUD

**Files:**
- Create: `app/institute/courses/CoursesClient.tsx`
- Modify: `app/institute/courses/page.tsx` (pass data to CoursesClient)

- [ ] **Step 1: Create CoursesClient.tsx**

Create `app/institute/courses/CoursesClient.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BookOpen, Users, Clock, Settings, Plus, PlayCircle, Pencil, X, Trash2 } from 'lucide-react'

type CourseItem = {
  id: string; title: string; subject: string; description: string | null
  totalChapters: number; isActive: boolean; enrollmentCount: number
}
type CourseForm = { title: string; subject: string; description?: string; totalChapters: number; isActive: boolean }

interface Props { initialCourses: CourseItem[] }

export default function CoursesClient({ initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  const addForm = useForm<CourseForm>({ defaultValues: { isActive: true, totalChapters: 1 } })
  const editForm = useForm<CourseForm>()

  const handleAdd = addForm.handleSubmit(async (data) => {
    setAddError('')
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, totalChapters: Number(data.totalChapters) }),
    })
    const json = await res.json()
    if (!res.ok) { setAddError(json.error || 'Error'); return }
    setCourses(prev => [{ ...json.data, enrollmentCount: 0 }, ...prev])
    addForm.reset({ isActive: true, totalChapters: 1 })
    setShowAdd(false)
  })

  const startEdit = (c: CourseItem) => {
    setEditingId(c.id)
    editForm.reset({ title: c.title, subject: c.subject, description: c.description || '', totalChapters: c.totalChapters, isActive: c.isActive })
    setEditError('')
  }

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editingId) return
    setEditError('')
    const res = await fetch(`/api/courses/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, totalChapters: Number(data.totalChapters) }),
    })
    if (!res.ok) { const j = await res.json(); setEditError(j.error || 'Error'); return }
    setCourses(prev => prev.map(c => c.id === editingId ? { ...c, ...data, totalChapters: Number(data.totalChapters) } : c))
    setEditingId(null)
  })

  const handleDelete = async () => {
    if (!deleteConfirm || deleteInput !== deleteConfirm.title) return
    const res = await fetch(`/api/courses/${deleteConfirm.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setCourses(prev => prev.map(c => c.id === deleteConfirm.id ? { ...c, isActive: false } : c))
    setDeleteConfirm(null)
    setDeleteInput('')
  }

  const colors = ['primary', 'secondary', 'tertiary', 'outline']

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">Course Management</h1>
          <p className="text-outline">Create, edit, and monitor all active curriculum tracks.</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); addForm.reset({ isActive: true, totalChapters: 1 }); setAddError('') }}
          className="px-5 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Course
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-4 border border-red-500/20">
            <h2 className="font-space-grotesk font-bold text-white text-xl">Deactivate Course?</h2>
            <p className="text-outline text-sm">Type <span className="text-white font-bold">{deleteConfirm.title}</span> to confirm.</p>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type course name..."
              className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== deleteConfirm.title}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm disabled:opacity-30 hover:bg-red-500 hover:text-white transition-all"
              >
                Deactivate
              </button>
              <button onClick={() => { setDeleteConfirm(null); setDeleteInput('') }} className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-outline font-bold text-sm hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-primary/20 space-y-4">
          <h2 className="font-space-grotesk font-bold text-white text-lg">Create New Course</h2>
          {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">{addError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Title *</label>
              <input {...addForm.register('title', { required: 'Title required' })}
                placeholder="JEE Physics Masterclass"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all" />
              {addForm.formState.errors.title && <p className="text-red-400 text-xs">{addForm.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Subject *</label>
              <input {...addForm.register('subject', { required: 'Subject required' })}
                placeholder="Physics"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all" />
              {addForm.formState.errors.subject && <p className="text-red-400 text-xs">{addForm.formState.errors.subject.message}</p>}
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-outline uppercase">Description</label>
              <textarea {...addForm.register('description')}
                rows={2}
                placeholder="Brief description..."
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Total Chapters *</label>
              <input {...addForm.register('totalChapters', { required: true, min: { value: 1, message: 'Min 1' }, valueAsNumber: true })}
                type="number" min={1}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all" />
              {addForm.formState.errors.totalChapters && <p className="text-red-400 text-xs">{addForm.formState.errors.totalChapters.message}</p>}
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" {...addForm.register('isActive')} id="add-active" className="w-4 h-4 accent-primary" />
              <label htmlFor="add-active" className="text-sm text-white font-bold cursor-pointer">Publish immediately</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={addForm.formState.isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm disabled:opacity-50 transition-all">
              {addForm.formState.isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-outline font-bold text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-outline">No courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => {
            const color = colors[i % colors.length]
            const isEditing = editingId === course.id
            return (
              <div key={course.id} className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden">
                <div className="p-6 flex flex-col relative group">
                  {course.isActive && (
                    <div className={`absolute top-0 right-1/4 w-32 h-32 bg-${color}/10 blur-[50px] pointer-events-none`} />
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-lowest border border-outline-variant/30 text-outline`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {course.isActive
                        ? <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>
                        : <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-surface-lowest text-outline border border-outline-variant/50">Draft</span>
                      }
                      <button onClick={() => isEditing ? setEditingId(null) : startEdit(course)}
                        className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:text-primary hover:border-primary/30 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setDeleteConfirm({ id: course.id, title: course.title }); setDeleteInput('') }}
                        className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:text-red-400 hover:border-red-500/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-space-grotesk font-bold text-white mb-1">{course.title}</h3>
                  <div className="flex gap-4 text-xs text-outline font-bold">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrollmentCount}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.totalChapters} Chapters</span>
                  </div>
                </div>

                {/* Inline Edit Form */}
                <div className={`overflow-hidden transition-all duration-300 ${isEditing ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <form onSubmit={handleEdit} className="px-6 pb-6 border-t border-outline-variant/20 pt-4 space-y-3">
                    {editError && editingId === course.id && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{editError}</div>}
                    <input {...editForm.register('title', { required: true })} placeholder="Title"
                      className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
                    <input {...editForm.register('subject', { required: true })} placeholder="Subject"
                      className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
                    <div className="flex gap-3">
                      <input {...editForm.register('totalChapters', { valueAsNumber: true, min: 1 })} type="number" min={1} placeholder="Chapters"
                        className="flex-1 bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
                      <label className="flex items-center gap-2 text-sm text-white font-bold cursor-pointer">
                        <input type="checkbox" {...editForm.register('isActive')} className="w-4 h-4 accent-primary" /> Active
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={editForm.formState.isSubmitting}
                        className="flex-1 py-2 rounded-xl bg-gradient-primary text-surface-dim font-bold text-xs disabled:opacity-50">
                        {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="p-2 rounded-xl border border-outline-variant/30 text-outline hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update courses page to pass data to CoursesClient**

Replace `app/institute/courses/page.tsx`:

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import CoursesClient from './CoursesClient'

export default async function InstituteCourses() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.instituteId) redirect('/login')

  const courses = await prisma.course.findMany({
    where: { instituteId: user.instituteId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } }
  })

  const initialCourses = courses.map(c => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    description: c.description,
    totalChapters: c.totalChapters,
    isActive: c.isActive,
    enrollmentCount: c._count.enrollments,
  }))

  return <CoursesClient initialCourses={initialCourses} />
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/institute/courses/CoursesClient.tsx app/institute/courses/page.tsx
git commit -m "feat: institute courses CRUD — create/edit/delete with inline expand"
```

---

## Task 5: Institute Tests CRUD

**Files:**
- Create: `app/institute/tests/TestsClient.tsx`
- Modify: `app/institute/tests/page.tsx`

- [ ] **Step 1: Create TestsClient.tsx**

Create `app/institute/tests/TestsClient.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PenTool, Calendar, Users, BarChart, Bell, Plus, Pencil, X, Trash2 } from 'lucide-react'

type TestItem = {
  id: string; title: string; subject: string; duration: number
  totalMarks: number; passingMarks: number; scheduledAt: string
  isActive: boolean; resultCount: number
}
type TestForm = {
  title: string; subject: string; duration: number
  totalMarks: number; passingMarks: number; scheduledAt: string; isActive: boolean
}

interface Props { initialTests: TestItem[] }

// Format datetime-local input value from ISO string
function toDatetimeLocal(iso: string) {
  return iso.slice(0, 16) // "YYYY-MM-DDTHH:MM"
}

export default function TestsClient({ initialTests }: Props) {
  const [tests, setTests] = useState(initialTests)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')
  const [editError, setEditError] = useState('')
  const now = new Date()

  const defaultTestValues: Partial<TestForm> = { duration: 60, totalMarks: 100, passingMarks: 40, isActive: true }
  const addForm = useForm<TestForm>({ defaultValues: defaultTestValues })
  const editForm = useForm<TestForm>()

  const handleAdd = addForm.handleSubmit(async (data) => {
    setAddError('')
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        duration: Number(data.duration),
        totalMarks: Number(data.totalMarks),
        passingMarks: Number(data.passingMarks),
      }),
    })
    const json = await res.json()
    if (!res.ok) { setAddError(json.error || 'Error'); return }
    setTests(prev => [{ ...json.data, resultCount: 0 }, ...prev])
    addForm.reset(defaultTestValues)
    setShowAdd(false)
  })

  const startEdit = (t: TestItem) => {
    setEditingId(t.id)
    editForm.reset({
      title: t.title, subject: t.subject, duration: t.duration,
      totalMarks: t.totalMarks, passingMarks: t.passingMarks,
      scheduledAt: toDatetimeLocal(t.scheduledAt), isActive: t.isActive
    })
    setEditError('')
  }

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editingId) return
    setEditError('')
    const res = await fetch(`/api/tests/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        duration: Number(data.duration),
        totalMarks: Number(data.totalMarks),
        passingMarks: Number(data.passingMarks),
      }),
    })
    if (!res.ok) { const j = await res.json(); setEditError(j.error || 'Error'); return }
    setTests(prev => prev.map(t => t.id === editingId
      ? { ...t, ...data, duration: Number(data.duration), totalMarks: Number(data.totalMarks), passingMarks: Number(data.passingMarks) }
      : t))
    setEditingId(null)
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this test?')) return
    const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setTests(prev => prev.map(t => t.id === id ? { ...t, isActive: false } : t))
  }

  const formFields = (form: ReturnType<typeof useForm<TestForm>>) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Title *</label>
        <input {...form.register('title', { required: 'Title required' })} placeholder="Physics Mock Test 1"
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
        {form.formState.errors.title && <p className="text-red-400 text-xs">{form.formState.errors.title.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Subject *</label>
        <input {...form.register('subject', { required: 'Subject required' })} placeholder="Physics"
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Scheduled At *</label>
        <input {...form.register('scheduledAt', {
          required: 'Date required',
          validate: v => new Date(v) > new Date() || 'Must be a future date'
        })} type="datetime-local"
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all [color-scheme:dark]" />
        {form.formState.errors.scheduledAt && <p className="text-red-400 text-xs">{form.formState.errors.scheduledAt.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Duration (min)</label>
        <input {...form.register('duration', { valueAsNumber: true, min: 1 })} type="number" min={1}
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Total Marks</label>
        <input {...form.register('totalMarks', { valueAsNumber: true, min: 1 })} type="number" min={1}
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-outline uppercase">Passing Marks</label>
        <input {...form.register('passingMarks', {
          valueAsNumber: true, min: 1,
          validate: v => v < (form.getValues('totalMarks') || 100) || 'Must be less than total marks'
        })} type="number" min={1}
          className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
        {form.formState.errors.passingMarks && <p className="text-red-400 text-xs">{form.formState.errors.passingMarks.message}</p>}
      </div>
      <div className="flex items-center gap-2 pt-4">
        <input type="checkbox" {...form.register('isActive')} id="test-active" className="w-4 h-4 accent-orange-500" />
        <label htmlFor="test-active" className="text-sm text-white font-bold cursor-pointer">Active / Visible</label>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2 flex items-center gap-3">
            <PenTool className="w-8 h-8 text-orange-400" /> Assessment Center
          </h1>
          <p className="text-outline">Schedule mock tests, evaluate performance, and generate insights.</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); addForm.reset(defaultTestValues); setAddError('') }}
          className="px-6 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Mock Test
        </button>
      </div>

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-orange-500/20 space-y-4">
          <h2 className="font-space-grotesk font-bold text-white text-lg">Create New Test</h2>
          {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">{addError}</div>}
          {formFields(addForm)}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={addForm.formState.isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-sm disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-all">
              {addForm.formState.isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-outline font-bold text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-outline">No tests yet.</div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const isUpcoming = new Date(test.scheduledAt) > now
            const isEditing = editingId === test.id
            return (
              <div key={test.id} className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden">
                <div className="p-5 flex flex-wrap items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUpcoming ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-surface-lowest border border-outline-variant/30'}`}>
                      <PenTool className={`w-6 h-6 ${isUpcoming ? 'text-orange-400' : 'text-outline'}`} />
                    </div>
                    <div>
                      <h3 className="font-space-grotesk font-bold text-white">{test.title}</h3>
                      <p className="text-xs text-outline">{test.subject} • {test.duration} min • {test.totalMarks} marks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-outline flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(test.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-outline flex items-center gap-1 mt-0.5"><Users className="w-3.5 h-3.5" />{test.resultCount} attempted</div>
                    </div>
                    {isUpcoming
                      ? <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1"><Bell className="w-3 h-3" />Upcoming</span>
                      : <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-surface-lowest text-outline border border-outline-variant/50">Past</span>
                    }
                    <button onClick={() => isEditing ? setEditingId(null) : startEdit(test)}
                      className="p-2 rounded-lg border border-outline-variant/30 text-outline hover:text-orange-400 hover:border-orange-500/30 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(test.id)}
                      className="p-2 rounded-lg border border-outline-variant/30 text-outline hover:text-red-400 hover:border-red-500/30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Edit */}
                <div className={`overflow-hidden transition-all duration-300 ${isEditing ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <form onSubmit={handleEdit} className="px-6 pb-6 border-t border-outline-variant/20 pt-4 space-y-4">
                    {editError && editingId === test.id && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{editError}</div>}
                    {formFields(editForm)}
                    <div className="flex gap-2">
                      <button type="submit" disabled={editForm.formState.isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-sm disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-all">
                        {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="p-2 rounded-xl border border-outline-variant/30 text-outline hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update tests page**

Replace `app/institute/tests/page.tsx`:

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TestsClient from './TestsClient'

export default async function InstituteTests() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.instituteId) redirect('/login')

  const tests = await prisma.test.findMany({
    where: { instituteId: user.instituteId },
    orderBy: { scheduledAt: 'desc' },
    include: { _count: { select: { testResults: true } } }
  })

  const initialTests = tests.map(t => ({
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

  return <TestsClient initialTests={initialTests} />
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/institute/tests/TestsClient.tsx app/institute/tests/page.tsx
git commit -m "feat: institute tests CRUD — create/edit/delete with inline expand"
```

---

## Task 6: Student Settings (Profile Edit)

**Files:**
- Create: `app/student/settings/SettingsClient.tsx`
- Modify: `app/student/settings/page.tsx`

- [ ] **Step 1: Create SettingsClient.tsx**

Create `app/student/settings/SettingsClient.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Bell, Moon, ShieldCheck, Check } from 'lucide-react'

type ProfileForm = { name: string; phone: string }
interface Props { initialName: string; initialPhone: string; email: string }

export default function SettingsClient({ initialName, initialPhone, email }: Props) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ProfileForm>({
    defaultValues: { name: initialName, phone: initialPhone }
  })

  const onSubmit = handleSubmit(async (data) => {
    setError('')
    setSuccess(false)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, phone: data.phone || null }),
    })
    if (!res.ok) { const j = await res.json(); setError(j.error || 'Error'); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  })

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">Settings</h1>
        <p className="text-outline">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          {[
            { label: 'Profile Settings', icon: User, active: true },
            { label: 'Notifications', icon: Bell, active: false },
            { label: 'Appearance', icon: Moon, active: false },
            { label: 'Security & Auth', icon: ShieldCheck, active: false },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${item.active ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-sm' : 'text-outline hover:bg-surface-lowest hover:text-white'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 glass-card p-8 rounded-3xl border-outline-variant/30">
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6">Profile Settings</h2>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all"
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-surface-dim border border-transparent rounded-xl px-4 py-3 text-sm text-outline cursor-not-allowed"
              />
              <p className="text-xs text-outline">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Phone Number</label>
              <input
                {...register('phone')}
                placeholder="+91 9876543210"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button type="submit" disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-primary text-surface-dim hover:shadow-glow-primary hover:scale-105 transition-all disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update settings page**

Replace `app/student/settings/page.tsx`:

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export default async function StudentSettings() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = (session.user as any).id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true }
  })
  if (!user) redirect('/login')

  return (
    <SettingsClient
      initialName={user.name}
      initialPhone={user.phone || ''}
      email={user.email}
    />
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/student/settings/SettingsClient.tsx app/student/settings/page.tsx
git commit -m "feat: student profile settings — functional name/phone edit"
```

---

## Task 7: Student Course Enrollment

**Files:**
- Modify: `app/student/courses/page.tsx` (convert to Server + Client pattern)
- Create: `app/student/courses/StudentCoursesClient.tsx`

- [ ] **Step 1: Create StudentCoursesClient.tsx**

Create `app/student/courses/StudentCoursesClient.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { PlayCircle, Plus, X, BookOpen } from 'lucide-react'

type Enrollment = {
  id: string; progress: number; lastStudied: string
  course: { id: string; title: string; subject: string; totalChapters: number }
}
type AvailableCourse = { id: string; title: string; subject: string; totalChapters: number }

interface Props {
  initialEnrollments: Enrollment[]
  availableCourses: AvailableCourse[]
}

export default function StudentCoursesClient({ initialEnrollments, availableCourses }: Props) {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [available, setAvailable] = useState(availableCourses)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState('')

  const handleEnroll = async (courseId: string) => {
    setEnrollError('')
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const json = await res.json()
    if (!res.ok) { setEnrollError(json.error || 'Error'); return }
    setEnrollments(prev => [...prev, json.data])
    setAvailable(prev => prev.filter(c => c.id !== courseId))
    setEnrollingId(null)
  }

  const handleUnenroll = async (enrollmentId: string, courseId: string, courseTitle: string) => {
    if (!confirm(`Unenroll from "${courseTitle}"?`)) return
    const res = await fetch(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' })
    if (!res.ok) return
    const unenrolled = enrollments.find(e => e.id === enrollmentId)
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId))
    if (unenrolled) {
      setAvailable(prev => [...prev, { id: unenrolled.course.id, title: unenrolled.course.title, subject: unenrolled.course.subject, totalChapters: unenrolled.course.totalChapters }])
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">My Courses</h1>
        <p className="text-outline">Access your enrolled courses and track your progress.</p>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" /> Continue Learning
        </h2>
        {enrollments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center text-outline">
            You are not enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="glass-card p-6 rounded-2xl border-outline-variant/30 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{enrollment.course.title}</h3>
                    <p className="text-xs text-outline">{enrollment.course.subject} • {enrollment.course.totalChapters} Chapters</p>
                  </div>
                  <button
                    onClick={() => handleUnenroll(enrollment.id, enrollment.course.id, enrollment.course.title)}
                    className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:text-red-400 hover:border-red-500/30 transition-colors shrink-0"
                    title="Unenroll"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between text-xs text-outline mb-2 relative z-10">
                  <span>Progress</span>
                  <span className="text-primary font-bold">{enrollment.progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-lowest rounded-full overflow-hidden border border-outline-variant/30 relative z-10">
                  <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${enrollment.progress}%` }} />
                </div>
                <button className="mt-4 w-full py-2 rounded-xl border border-primary/50 text-primary hover:bg-primary hover:text-surface-dim hover:shadow-glow-sm transition-all text-sm font-bold relative z-10">
                  Resume
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      {available.length > 0 && (
        <div>
          <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" /> Available Courses
          </h2>
          {enrollError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm mb-4">{enrollError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((course) => (
              <div key={course.id} className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div>
                  <h3 className="font-bold text-white mb-1">{course.title}</h3>
                  <p className="text-xs text-outline">{course.subject} • {course.totalChapters} Chapters</p>
                </div>

                {/* Inline confirm expand */}
                <div className={`overflow-hidden transition-all duration-200 ${enrollingId === course.id ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleEnroll(course.id)}
                      className="flex-1 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs hover:bg-primary hover:text-surface-dim transition-all">
                      Confirm Enroll
                    </button>
                    <button onClick={() => setEnrollingId(null)}
                      className="p-2 rounded-xl border border-outline-variant/30 text-outline hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {enrollingId !== course.id && (
                  <button onClick={() => setEnrollingId(course.id)}
                    className="w-full py-2 rounded-xl border border-outline-variant/30 text-white font-bold text-xs hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Enroll
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update student courses page**

Replace `app/student/courses/page.tsx`:

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import StudentCoursesClient from './StudentCoursesClient'

export default async function StudentCourses() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  if (!user.id) redirect('/login')

  const [enrollments, allCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      orderBy: { lastStudied: 'desc' },
      include: { course: { select: { id: true, title: true, subject: true, totalChapters: true } } }
    }),
    prisma.course.findMany({
      where: { isActive: true, instituteId: user.instituteId ?? 'none' },
      select: { id: true, title: true, subject: true, totalChapters: true }
    })
  ])

  const enrolledIds = new Set(enrollments.map(e => e.courseId))
  const availableCourses = allCourses.filter(c => !enrolledIds.has(c.id))

  return (
    <StudentCoursesClient
      initialEnrollments={enrollments.map(e => ({
        id: e.id,
        progress: e.progress,
        lastStudied: e.lastStudied.toISOString(),
        course: e.course,
      }))}
      availableCourses={availableCourses}
    />
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/student/courses/StudentCoursesClient.tsx app/student/courses/page.tsx
git commit -m "feat: student course enrollment — enroll/unenroll with inline confirm"
```

---

## Task 8: Student Test Attempt Page

**Files:**
- Create: `app/student/tests/[id]/page.tsx`

- [ ] **Step 1: Create test attempt page**

Architecture: Server Component wrapper fetches test data via Prisma, passes to client component for timer/interaction. Create two files.

First create `app/student/tests/[id]/TestAttemptClient.tsx`:

```typescript
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, CheckCircle, AlertCircle } from 'lucide-react'

type TestData = {
  id: string; title: string; subject: string
  duration: number; totalMarks: number; passingMarks: number
}

export default function TestAttemptClient({ test }: { test: TestData }) {
  const router = useRouter()
  const [score, setScore] = useState('')
  const [timeLeft, setTimeLeft] = useState(test.duration * 60)
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const startTime = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const startTest = () => {
    setStarted(true)
    startTime.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async () => {
    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > test.totalMarks) {
      setSubmitError(`Score must be between 0 and ${test.totalMarks}`)
      return
    }
    clearInterval(timerRef.current)
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000)
    setSubmitError('')

    const res = await fetch('/api/test-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: test.id, score: scoreNum, timeTaken }),
    })
    const json = await res.json()
    if (!res.ok) { setSubmitError(json.error || 'Submission failed'); return }
    setSubmitted(true)
    setResult({ score: scoreNum, passed: scoreNum >= test.passingMarks })
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (submitted && result) return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="glass-card p-10 rounded-3xl text-center space-y-6">
        {result.passed
          ? <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
          : <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        }
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">
            {result.passed ? 'Congratulations!' : 'Better luck next time!'}
          </h1>
          <p className="text-outline">{test.title}</p>
        </div>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{result.score}</div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Score</div>
          </div>
          <div className="w-px bg-outline-variant/30" />
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{test.totalMarks}</div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Total</div>
          </div>
          <div className="w-px bg-outline-variant/30" />
          <div className="text-center">
            <div className={`text-4xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {Math.round((result.score / test.totalMarks) * 100)}%
            </div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Percentage</div>
          </div>
        </div>
        <button onClick={() => router.push('/student/tests')}
          className="px-8 py-3 rounded-xl bg-gradient-primary text-surface-dim font-bold shadow-glow-sm hover:scale-105 transition-all">
          Back to Tests
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold text-white mb-1">{test.title}</h1>
            <p className="text-outline text-sm">{test.subject} • {test.totalMarks} marks • {test.duration} min</p>
          </div>
          {started && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface-lowest text-white border border-outline-variant/30'}`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!started ? (
          <div className="space-y-6">
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-white">Before you begin:</h3>
              <ul className="text-sm text-outline space-y-1.5">
                <li>• Duration: <span className="text-white font-bold">{test.duration} minutes</span></li>
                <li>• Total Marks: <span className="text-white font-bold">{test.totalMarks}</span></li>
                <li>• Passing Marks: <span className="text-white font-bold">{test.passingMarks}</span></li>
                <li>• You can only submit once. Timer starts immediately.</li>
              </ul>
            </div>
            <button onClick={startTest}
              className="w-full py-4 rounded-2xl bg-gradient-primary text-surface-dim font-bold text-lg shadow-glow-sm hover:scale-105 transition-all">
              Start Test
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-lowest border border-outline-variant/30 rounded-2xl p-6 text-center text-outline">
              <p className="text-sm mb-2">Enter your score after completing the test paper.</p>
              <p className="text-xs">(Full question module coming soon)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Your Score (out of {test.totalMarks})</label>
              <input
                type="number"
                value={score}
                onChange={e => setScore(e.target.value)}
                min={0}
                max={test.totalMarks}
                placeholder={`0 – ${test.totalMarks}`}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-2xl font-bold text-white text-center focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all"
              />
              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-gradient-primary text-surface-dim font-bold text-lg shadow-glow-sm hover:scale-105 transition-all">
              Submit Test
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create server wrapper page `app/student/tests/[id]/page.tsx`**

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TestAttemptClient from './TestAttemptClient'

export default async function TestAttemptPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const test = await prisma.test.findFirst({
    where: { id: params.id, isActive: true },
    select: { id: true, title: true, subject: true, duration: true, totalMarks: true, passingMarks: true }
  })
  if (!test) notFound()

  return <TestAttemptClient test={test} />
}
```

- [ ] **Step 3: Update student tests page to add attempt links**

In `app/student/tests/page.tsx`:
1. Add `import Link from 'next/link'` at the top (after existing imports)
2. Inside the `upcoming.map((test) => ...)` callback, after the closing `</div>` of `<div className="flex justify-between items-center text-xs">` (the duration/date row, currently line ~58-61), insert this `<Link>` element before the outer card's closing `</div>`:

```tsx
<Link
  href={`/student/tests/${test.id}`}
  className="mt-3 block w-full text-center py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all"
>
  Attempt Test
</Link>
```

The card structure becomes:
```tsx
<div key={test.id} className="p-4 rounded-xl border border-outline-variant/30 hover:border-orange-500/30 transition-colors bg-surface-lowest">
  <h3 className="font-bold text-white mb-1">{test.title}</h3>
  <p className="text-xs text-outline mb-4">{test.subject}</p>
  <div className="flex justify-between items-center text-xs">
    <span className="bg-surface-highest px-3 py-1 rounded-full text-outline-variant">{test.duration} mins</span>
    <span className="text-orange-400 font-bold">{new Date(test.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
  </div>
  {/* ADD THIS: */}
  <Link href={`/student/tests/${test.id}`}
    className="mt-3 block w-full text-center py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all">
    Attempt Test
  </Link>
</div>
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/student/tests/[id]/TestAttemptClient.tsx app/student/tests/[id]/page.tsx app/student/tests/page.tsx
git commit -m "feat: student test attempt page with timer and score submission"
```

---

## Final Verification

- [ ] **Run TypeScript check**

```bash
cd /Users/devil/Study-ONE && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Manual smoke test checklist**

```
Start dev server: npm run dev
Login as admin@studyone.com / password123

Institute side:
☐ /institute/students — click "Add New Student", fill form, submit
☐ Click pencil on a student row, edit name, save
☐ Click trash on a student, confirm deactivation

☐ /institute/courses — click "Create New Course", fill form, submit
☐ Click pencil on a course card, edit, save
☐ Click trash on a course, type name to confirm

☐ /institute/tests — click "Create Mock Test", fill form with future date, submit
☐ Click pencil on a test, edit scheduledAt, save

Login as student@studyone.com / password123

Student side:
☐ /student/settings — change name, save, see success message
☐ /student/courses — click Enroll on an available course, confirm
☐ /student/courses — click X to unenroll
☐ /student/tests — click "Attempt Test" on an upcoming test
☐ Test attempt page — click Start, enter score, Submit
☐ See result screen with pass/fail
```

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: Option C complete — full CRUD mutations and forms"
```
