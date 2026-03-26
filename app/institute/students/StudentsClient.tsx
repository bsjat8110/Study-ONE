'use client'
import React, { useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Search, ShieldCheck, Plus, Pencil, Trash2, X, Download, Loader2, Sparkles, Users, Trophy } from 'lucide-react'
import type { StudentListItem } from '@/types'

type AddForm = { name: string; email: string; password: string; phone?: string }
type EditForm = { name: string; phone?: string; isActive: boolean }

interface Props {
  initialStudents: StudentListItem[]
  total: number
}

// Separate component so each row has its own useForm instance
function EditRow({
  student,
  isOpen,
  onSave,
  onCancel,
}: {
  student: StudentListItem
  isOpen: boolean
  onSave: (id: string, data: EditForm) => Promise<string | null>
  onCancel: () => void
}) {
  const form = useForm<EditForm>({
    defaultValues: { name: student.name, phone: '', isActive: student.isActive },
  })
  const [error, setError] = useState('')

  const handleSubmit = form.handleSubmit(async (data) => {
    setError('')
    const err = await onSave(student.id, data)
    if (err) setError(err)
  })

  // Reset when opening
  React.useEffect(() => {
    if (isOpen) form.reset({ name: student.name, phone: '', isActive: student.isActive })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, student.id])

  return (
    <tr className="border-b border-outline-variant/20">
      <td colSpan={6} className="p-0">
        <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-3 bg-surface-highest/10">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              {error && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{error}</div>}
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase">Name</label>
                <input
                  {...form.register('name', { required: true })}
                  className="bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all w-48"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase">Phone</label>
                <input
                  {...form.register('phone')}
                  placeholder="Optional"
                  className="bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all w-40"
                />
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <input type="checkbox" {...form.register('isActive')} id={`active-${student.id}`} className="w-4 h-4 accent-primary" />
                <label htmlFor={`active-${student.id}`} className="text-sm text-white font-bold cursor-pointer">Active</label>
              </div>
              <button type="submit" disabled={form.formState.isSubmitting} className="px-4 py-2 rounded-lg bg-gradient-primary text-surface-dim font-bold text-xs disabled:opacity-50">
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={onCancel} className="p-2 rounded-lg border border-outline-variant/30 text-outline hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function StudentsClient({ initialStudents, total }: Props) {
  const [students, setStudents] = useState(initialStudents)
  const [totalCount, setTotalCount] = useState(total)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/institute/export?type=students')
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="(.+)"/)
      a.download = match ? match[1] : 'students.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()
  const addForm = useForm<AddForm>({
    defaultValues: { name: '', email: '', password: '', phone: '' }
  })
  const fetchStudents = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(q)}&limit=20`)
      if (!res.ok) return
      const json = await res.json()
      setStudents(json.data)
      setTotalCount(json.total)
    } catch {
      // network error — leave stale data, don't crash
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
    try {
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
    } catch {
      setAddError('Network error — please try again')
    }
  })

  // Returns error string on failure, null on success
  const handleSaveEdit = async (id: string, data: EditForm): Promise<string | null> => {
    try {
      const body: Record<string, unknown> = { name: data.name, isActive: data.isActive }
      if (data.phone !== undefined && data.phone !== '') body.phone = data.phone
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const j = await res.json(); return j.error || 'Error' }
      setStudents(prev => prev.map(s => s.id === id ? { ...s, name: data.name, isActive: data.isActive } : s))
      setEditingId(null)
      return null
    } catch {
      return 'Network error — please try again'
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? This is a soft delete.`)) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (!res.ok) { alert('Failed to deactivate student'); return }
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s))
    } catch {
      alert('Network error — please try again')
    }
  }

  const activeCount = students.filter(s => s.isActive).length
  const avgEnrollmentPerStudent = students.length > 0
    ? (students.reduce((sum, student) => sum + student.enrollmentCount, 0) / students.length).toFixed(1)
    : '0.0'
  const scoredStudents = students.filter(student => student.avgScore != null)
  const averageScore = scoredStudents.length > 0
    ? Math.round(scoredStudents.reduce((sum, student) => sum + (student.avgScore ?? 0), 0) / scoredStudents.length)
    : 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">Student Operations</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">Manage your student engine with clarity.</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Search faster, onboard cleanly, monitor performance, and keep your learner base active from one focused control surface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <Users className="w-5 h-5 text-primary mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Directory size</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{totalCount.toLocaleString()}</p>
              <p className="mt-2 text-xs text-slate-400">Students currently in your system</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Active now</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{activeCount}</p>
              <p className="mt-2 text-xs text-slate-400">Visible active students on this page</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <Trophy className="w-5 h-5 text-secondary mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avg score</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{averageScore}%</p>
              <p className="mt-2 text-xs text-slate-400">{avgEnrollmentPerStudent} average enrollments per student</p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 inline-flex items-center gap-2 w-fit">
            <Sparkles className="w-4 h-4 text-primary" />
            Track engagement, readiness, and growth without leaving this page.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/30 hover:border-white/30 text-outline hover:text-white font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={() => { setShowAdd(v => !v); addForm.reset(); setAddError('') }}
              className="px-5 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Student
            </button>
          </div>
        </div>
      </section>

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
              aria-label="Search students"
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
            <span className="text-primary flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {activeCount} Active (page)</span>
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
                <React.Fragment key={student.id}>
                  <tr className="border-b border-outline-variant/20 hover:bg-surface-highest/20 transition-colors">
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
                          onClick={() => setEditingId(id => id === student.id ? null : student.id)}
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
                  <EditRow
                    student={student}
                    isOpen={editingId === student.id}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                </React.Fragment>
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
