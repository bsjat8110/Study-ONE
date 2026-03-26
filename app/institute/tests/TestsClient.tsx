'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PenTool, Calendar, Users, BarChart, Plus, X, Pencil, Trash2, Sparkles, ShieldCheck, TimerReset } from 'lucide-react'

type TestListItem = {
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

type TestForm = {
  title: string
  subject: string
  duration: number
  totalMarks: number
  passingMarks: number
  scheduledAt: string
}

interface Props {
  initialTests: TestListItem[]
}

function EditRow({
  test,
  isOpen,
  onSave,
  onCancel,
}: {
  test: TestListItem
  isOpen: boolean
  onSave: (id: string, data: TestForm) => Promise<string | null>
  onCancel: () => void
}) {
  const form = useForm<TestForm>({
    defaultValues: {
      title: test.title,
      subject: test.subject,
      duration: test.duration,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      scheduledAt: test.scheduledAt.slice(0, 16), // "YYYY-MM-DDTHH:mm"
    },
  })
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: test.title,
        subject: test.subject,
        duration: test.duration,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        scheduledAt: test.scheduledAt.slice(0, 16),
      })
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, test.id])

  const handleSubmit = form.handleSubmit(async (data) => {
    setError('')
    const err = await onSave(test.id, data)
    if (err) setError(err)
  })

  return (
    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="px-6 py-4 bg-surface-highest/10 border-t border-outline-variant/20">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Title *</label>
              <input {...form.register('title', { required: 'Title required' })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Subject *</label>
              <input {...form.register('subject', { required: true })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Duration (mins)</label>
              <input type="number" min={1} {...form.register('duration', { valueAsNumber: true, min: 1 })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Total Marks</label>
              <input type="number" min={1} {...form.register('totalMarks', { valueAsNumber: true, min: 1 })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Passing Marks</label>
              <input type="number" min={0} {...form.register('passingMarks', {
                valueAsNumber: true,
                validate: v => v < (form.getValues('totalMarks') ?? 0) || 'Must be less than total marks'
              })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
              {form.formState.errors.passingMarks && <p className="text-red-400 text-xs">{form.formState.errors.passingMarks.message}</p>}
            </div>
            <div className="sm:col-span-2 md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Scheduled At</label>
              <input type="datetime-local" {...form.register('scheduledAt', { required: true })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={form.formState.isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-primary text-surface-dim font-bold text-xs disabled:opacity-50">
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onCancel}
              className="p-2 rounded-xl border border-outline-variant/30 text-outline hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TestsClient({ initialTests }: Props) {
  const [tests, setTests] = useState(initialTests)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')

  const addForm = useForm<TestForm>({
    defaultValues: { title: '', subject: '', duration: 60, totalMarks: 100, passingMarks: 40, scheduledAt: '' },
  })

  const now = new Date()
  const upcomingTests = tests.filter(test => new Date(test.scheduledAt) > now).length
  const liveTests = tests.filter(test => test.isActive).length
  const totalResponses = tests.reduce((sum, test) => sum + test.resultCount, 0)

  const handleAdd = addForm.handleSubmit(async (data) => {
    setAddError('')
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setAddError(json.error || 'Something went wrong'); return }
      setTests(prev => [{
        id: json.data.id,
        title: data.title,
        subject: data.subject,
        duration: Number(data.duration),
        totalMarks: Number(data.totalMarks),
        passingMarks: Number(data.passingMarks),
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        isActive: true,
        resultCount: 0,
      }, ...prev])
      addForm.reset({ title: '', subject: '', duration: 60, totalMarks: 100, passingMarks: 40, scheduledAt: '' })
      setShowAdd(false)
    } catch {
      setAddError('Network error — please try again')
    }
  })

  const handleSaveEdit = async (id: string, data: TestForm): Promise<string | null> => {
    try {
      const res = await fetch(`/api/tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const j = await res.json(); return j.error || 'Error' }
      setTests(prev => prev.map(t => t.id === id ? {
        ...t,
        title: data.title,
        subject: data.subject,
        duration: Number(data.duration),
        totalMarks: Number(data.totalMarks),
        passingMarks: Number(data.passingMarks),
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      } : t))
      setEditingId(null)
      return null
    } catch {
      return 'Network error — please try again'
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete test "${title}"? This is a soft delete.`)) return
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' })
      if (!res.ok) { alert('Failed to delete test'); return }
      setTests(prev => prev.filter(t => t.id !== id))
    } catch {
      alert('Network error — please try again')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-400 mb-4">Assessment Center</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">Run assessments like a serious performance system.</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Schedule mock tests, tune timing and marks, and turn every attempt into insight for your institute.
            </p>
            <div className="mt-8">
              <button
                onClick={() => { setShowAdd(v => !v); addForm.reset({ title: '', subject: '', duration: 60, totalMarks: 100, passingMarks: 40, scheduledAt: '' }); setAddError('') }}
                className="px-6 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Mock Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <PenTool className="w-5 h-5 text-orange-400 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total tests</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{tests.length}</p>
              <p className="mt-2 text-xs text-slate-400">Assessment objects in your system</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Upcoming</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{upcomingTests}</p>
              <p className="mt-2 text-xs text-slate-400">{liveTests} marked active and visible</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <TimerReset className="w-5 h-5 text-primary mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Responses</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{totalResponses}</p>
              <p className="mt-2 text-xs text-slate-400">Total submitted result records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-orange-500/20 space-y-4">
          <h2 className="font-space-grotesk font-bold text-white text-lg">Create Mock Test</h2>
          {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">{addError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Test Title *</label>
              <input {...addForm.register('title', { required: 'Title is required' })}
                placeholder="JEE Mains — Full Syllabus Mock"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
              {addForm.formState.errors.title && <p className="text-red-400 text-xs">{addForm.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Subject *</label>
              <input {...addForm.register('subject', { required: true })}
                placeholder="Physics"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Duration (mins)</label>
              <input type="number" min={1}
                {...addForm.register('duration', { valueAsNumber: true, min: { value: 1, message: 'Min 1 min' } })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Total Marks</label>
              <input type="number" min={1}
                {...addForm.register('totalMarks', { valueAsNumber: true, min: 1 })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Passing Marks</label>
              <input type="number" min={0}
                {...addForm.register('passingMarks', {
                  valueAsNumber: true,
                  validate: v => v < (addForm.getValues('totalMarks') ?? 0) || 'Must be < total marks'
                })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
              {addForm.formState.errors.passingMarks && <p className="text-red-400 text-xs">{addForm.formState.errors.passingMarks.message}</p>}
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Scheduled At *</label>
              <input type="datetime-local"
                {...addForm.register('scheduledAt', {
                  required: 'Date required',
                  validate: v => new Date(v) > new Date() || 'Must be a future date'
                })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-all" />
              {addForm.formState.errors.scheduledAt && <p className="text-red-400 text-xs">{addForm.formState.errors.scheduledAt.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={addForm.formState.isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white font-bold text-sm disabled:opacity-50 transition-all">
              {addForm.formState.isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-outline font-bold text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {tests.length === 0 && !showAdd ? (
        <div className="glass-card p-12 rounded-3xl text-center text-outline">
          No tests scheduled yet. Create your first mock test.
        </div>
      ) : (
        <div className="space-y-2">
          {tests.map((test) => {
            const isUpcoming = new Date(test.scheduledAt) > now
            const isCompleted = !isUpcoming && test.resultCount > 0
            const status = isCompleted ? 'Completed' : isUpcoming ? 'Scheduled' : 'Draft'
            const isEditing = editingId === test.id

            return (
              <div key={test.id} className={`glass-card rounded-2xl border ${status === 'Scheduled' ? 'border-orange-500/30 shadow-[inset_4px_0_0_#f97316]' : 'border-outline-variant/20'} overflow-hidden`}>
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-space-grotesk font-bold text-white">{test.title}</h3>
                      {status === 'Scheduled' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/20">Scheduled</span>}
                      {status === 'Draft' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-lowest text-outline border border-outline-variant/50">Draft</span>}
                      {status === 'Completed' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-outline">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(test.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-outline-variant">•</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {test.resultCount} Results</span>
                      <span className="text-outline-variant">•</span>
                      <span className="px-2 py-1 rounded bg-surface-lowest border border-outline-variant/30 text-white">{test.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3">
                      {status === 'Completed'
                        ? 'This assessment already generated measurable learner data.'
                        : status === 'Scheduled'
                          ? 'Ready to capture fresh performance signals on schedule.'
                          : 'Inactive test object available for edits or relaunch.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'Completed' ? (
                      <button className="px-4 py-2 rounded-xl bg-surface-highest text-white text-sm font-bold border border-outline-variant/30 hover:border-emerald-500/50 hover:text-emerald-400 flex items-center gap-2 transition-all">
                        <BarChart className="w-4 h-4" /> View Report
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(id => id === test.id ? null : test.id)}
                          className={`p-2 rounded-xl border transition-colors ${isEditing ? 'border-primary/50 text-primary bg-primary/10' : 'border-outline-variant/30 text-outline hover:text-white'}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id, test.title)}
                          className="p-2 rounded-xl border border-outline-variant/30 text-outline hover:text-red-400 hover:border-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <EditRow
                  test={test}
                  isOpen={isEditing}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
