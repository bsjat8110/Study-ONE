'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BookOpen, Users, Clock, Plus, X, Trash2, Settings, PlayCircle, Sparkles, Layers3, ShieldCheck } from 'lucide-react'

type CourseListItem = {
  id: string
  title: string
  subject: string
  totalChapters: number
  isActive: boolean
  enrollmentCount: number
  createdAt: string
}

type CourseForm = {
  title: string
  subject: string
  description?: string
  totalChapters: number
  isActive: boolean
}

interface Props {
  initialCourses: CourseListItem[]
}

const COURSE_THEME = [
  {
    glow: 'bg-primary/10 group-hover:bg-primary/20',
    badge: 'bg-primary/10 border-primary/30 text-primary',
  },
  {
    glow: 'bg-secondary/10 group-hover:bg-secondary/20',
    badge: 'bg-secondary/10 border-secondary/30 text-secondary',
  },
  {
    glow: 'bg-tertiary/10 group-hover:bg-tertiary/20',
    badge: 'bg-tertiary/10 border-tertiary/30 text-tertiary',
  },
  {
    glow: 'bg-white/10 group-hover:bg-white/15',
    badge: 'bg-surface-lowest border-outline-variant/40 text-white',
  },
] as const

function CourseCard({
  course,
  colorIdx,
  onUpdate,
  onDelete,
}: {
  course: CourseListItem
  colorIdx: number
  onUpdate: (id: string, data: CourseForm) => Promise<string | null>
  onDelete: (id: string, title: string) => Promise<string | null>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [error, setError] = useState('')
  const form = useForm<CourseForm>({
    defaultValues: {
      title: course.title,
      subject: course.subject,
      description: '',
      totalChapters: course.totalChapters,
      isActive: course.isActive,
    },
  })

  const theme = COURSE_THEME[colorIdx % COURSE_THEME.length]

  const handleEdit = form.handleSubmit(async (data) => {
    setError('')
    const err = await onUpdate(course.id, data)
    if (err) { setError(err); return }
    setIsEditing(false)
  })

  const handleDelete = async () => {
    if (deleteInput !== course.title) return
    setError('')
    const err = await onDelete(course.id, course.title)
    if (err) setError(err)
  }

  if (isEditing) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-primary/20 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-space-grotesk font-bold text-white">Edit Course</h3>
          <button onClick={() => { setIsEditing(false); setError('') }} className="p-1.5 rounded-lg text-outline hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{error}</div>}
        <form onSubmit={handleEdit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Title *</label>
              <input {...form.register('title', { required: 'Title required' })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
              {form.formState.errors.title && <p className="text-red-400 text-xs">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Subject *</label>
              <input {...form.register('subject', { required: 'Subject required' })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Chapters</label>
              <input type="number" min={0} {...form.register('totalChapters', { min: 0, valueAsNumber: true })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Description</label>
              <textarea {...form.register('description')} rows={2}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" {...form.register('isActive')} id={`active-${course.id}`} className="w-4 h-4 accent-primary" />
              <label htmlFor={`active-${course.id}`} className="text-sm text-white font-bold cursor-pointer">Published (Live)</label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={form.formState.isSubmitting}
              className="flex-1 py-2 rounded-xl bg-gradient-primary text-surface-dim font-bold text-xs disabled:opacity-50 transition-all">
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => { setDeleteMode(true); setIsEditing(false) }}
              className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (deleteMode) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-red-500/30 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-space-grotesk font-bold text-red-400">Delete Course</h3>
          <button onClick={() => { setDeleteMode(false); setDeleteInput(''); setError('') }}
            className="p-1.5 rounded-lg text-outline hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-outline">Type <span className="text-white font-bold">{course.title}</span> to confirm deletion.</p>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">{error}</div>}
        <input
          value={deleteInput}
          onChange={e => setDeleteInput(e.target.value)}
          placeholder="Type course name..."
          className="w-full bg-surface-lowest border border-red-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
        />
        <button
          onClick={handleDelete}
          disabled={deleteInput !== course.title}
          className="py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs disabled:opacity-40 hover:bg-red-500/30 transition-all"
        >
          Delete Course
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-3xl border border-outline-variant/30 flex flex-col group relative overflow-hidden">
      {course.isActive && (
        <div className={`absolute top-0 right-1/4 w-32 h-32 blur-[50px] pointer-events-none transition-all ${theme.glow}`} />
      )}
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.badge}`}>
          <BookOpen className="w-6 h-6" />
        </div>
        {course.isActive ? (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-lowest text-outline border border-outline-variant/50">
            Draft
          </span>
        )}
      </div>
      <h3 className="text-xl font-space-grotesk font-bold text-white mb-2 leading-tight">{course.title}</h3>
      <p className="text-xs text-outline mb-2">{course.subject}</p>
      <div className="flex flex-wrap gap-4 text-xs text-outline font-bold mb-6">
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount} Enrolled</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.totalChapters} Chapters</span>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-outline-variant/20">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 px-4 py-2 rounded-xl bg-surface-lowest hover:bg-surface-highest transition-colors text-white text-xs font-bold border border-outline-variant/30 flex items-center justify-center gap-2"
        >
          <Settings className="w-3.5 h-3.5" /> Manage
        </button>
        {course.isActive && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.badge}`}>
            <PlayCircle className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function CoursesClient({ initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses)
  const [showAdd, setShowAdd] = useState(false)
  const [addError, setAddError] = useState('')
  const addForm = useForm<CourseForm>({
    defaultValues: { title: '', subject: '', description: '', totalChapters: 0, isActive: true },
  })
  const liveCourses = courses.filter(course => course.isActive).length
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0)
  const averageChapters = courses.length > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.totalChapters, 0) / courses.length)
    : 0

  const handleAdd = addForm.handleSubmit(async (data) => {
    setAddError('')
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setAddError(json.error || 'Something went wrong'); return }
      setCourses(prev => [{
        id: json.data.id,
        title: data.title,
        subject: data.subject,
        totalChapters: Number(data.totalChapters),
        isActive: data.isActive,
        enrollmentCount: 0,
        createdAt: new Date().toISOString(),
      }, ...prev])
      addForm.reset({ title: '', subject: '', description: '', totalChapters: 0, isActive: true })
      setShowAdd(false)
    } catch {
      setAddError('Network error — please try again')
    }
  })

  const handleUpdate = async (id: string, data: CourseForm): Promise<string | null> => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const j = await res.json(); return j.error || 'Error' }
      setCourses(prev => prev.map(c => c.id === id ? {
        ...c,
        title: data.title,
        subject: data.subject,
        totalChapters: Number(data.totalChapters),
        isActive: data.isActive,
      } : c))
      return null
    } catch {
      return 'Network error — please try again'
    }
  }

  const handleDelete = async (id: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); return j.error || 'Error' }
      setCourses(prev => prev.filter(c => c.id !== id))
      return null
    } catch {
      return 'Network error — please try again'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">Course Operations</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">Design the curriculum engine your institute runs on.</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Create, publish, and refine course tracks that turn enrollments into measurable academic progression.
            </p>
            <div className="mt-8">
              <button
                onClick={() => { setShowAdd(v => !v); addForm.reset({ title: '', subject: '', description: '', totalChapters: 0, isActive: true }); setAddError('') }}
                className="px-5 py-2.5 rounded-xl bg-gradient-primary text-surface-dim font-bold text-sm shadow-glow-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Course
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <BookOpen className="w-5 h-5 text-primary mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Course count</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{courses.length}</p>
              <p className="mt-2 text-xs text-slate-400">Total curriculum tracks available</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live now</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{liveCourses}</p>
              <p className="mt-2 text-xs text-slate-400">Published tracks visible to students</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <Layers3 className="w-5 h-5 text-secondary mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avg chapters</p>
              <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{averageChapters}</p>
              <p className="mt-2 text-xs text-slate-400">{totalEnrollments} total enrollments across tracks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Add Form */}
      <div className={`overflow-hidden transition-all duration-300 ${showAdd ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-primary/20 space-y-4">
          <h2 className="font-space-grotesk font-bold text-white text-lg">Create New Course</h2>
          {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">{addError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Course Title *</label>
              <input
                {...addForm.register('title', { required: 'Title is required' })}
                placeholder="JEE Physics — Mechanics"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {addForm.formState.errors.title && <p className="text-red-400 text-xs">{addForm.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Subject *</label>
              <input
                {...addForm.register('subject', { required: 'Subject is required' })}
                placeholder="Physics"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {addForm.formState.errors.subject && <p className="text-red-400 text-xs">{addForm.formState.errors.subject.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Total Chapters</label>
              <input
                type="number" min={1}
                {...addForm.register('totalChapters', { min: 1, valueAsNumber: true })}
                placeholder="24"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline uppercase">Description</label>
              <textarea
                {...addForm.register('description')} rows={2}
                placeholder="Brief description of the course..."
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" {...addForm.register('isActive')} id="add-course-active" className="w-4 h-4 accent-primary" />
              <label htmlFor="add-course-active" className="text-sm text-white font-bold cursor-pointer">Publish immediately (Live)</label>
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

      {courses.length === 0 && !showAdd ? (
        <div className="glass-card p-12 rounded-3xl text-center text-outline">
          No courses yet. Create your first course to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              colorIdx={i}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          {/* Create placeholder */}
          <button
            onClick={() => { setShowAdd(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="glass-panel p-6 rounded-3xl border border-dashed border-outline-variant hover:border-primary/50 flex flex-col items-center justify-center gap-4 group transition-colors min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-lowest flex items-center justify-center border border-outline-variant group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
              <Plus className="w-8 h-8 text-outline group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-space-grotesk font-bold text-white group-hover:text-primary transition-colors">Create New Course</h3>
            <p className="text-xs text-outline text-center max-w-[200px]">Design a new curriculum track, add materials, and publish to students.</p>
          </button>
        </div>
      )}
    </div>
  )
}
