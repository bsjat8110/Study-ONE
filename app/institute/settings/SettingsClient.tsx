'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, CheckCircle, Sparkles, ShieldCheck, Mail, Phone } from 'lucide-react'

type SettingsForm = {
  name: string
  phone?: string
}

interface Props {
  user: { name: string; email: string; phone?: string | null }
}

export default function SettingsClient({ user }: Props) {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const summaryCards = [
    {
      label: 'Profile state',
      value: 'Configured',
      detail: 'Core institute admin identity is present and editable.',
      icon: Sparkles,
    },
    {
      label: 'Security',
      value: 'Protected',
      detail: 'Admin profile is under authenticated access control.',
      icon: ShieldCheck,
    },
    {
      label: 'Contact line',
      value: user.phone || 'Not set',
      detail: 'Phone field used for institute-facing coordination.',
      icon: Phone,
    },
  ]
  
  const form = useForm<SettingsForm>({
    defaultValues: {
      name: user.name,
      phone: user.phone || ''
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/institute/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error || 'Failed to save settings')
        return
      }
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Network error — please try again')
    }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">Institute Control</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">Refine the admin profile your institute operates through.</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Keep identity, communication details, and operational profile data aligned so the rest of the institute system stays consistent.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
              <Mail className="w-4 h-4 text-primary" />
              {user.email}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <card.icon className="w-5 h-5 text-primary mb-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-xl font-space-grotesk font-bold text-white break-all">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400 leading-5">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glass-card p-8 rounded-3xl border border-outline-variant/30">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-surface-dim font-bold text-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-outline text-sm">{user.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Admin profile active
              </div>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4"/> {success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Institute / Admin Name *</label>
              <input
                {...form.register('name', { required: 'Name is required' })}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Email Address</label>
              <input
                value={user.email}
                disabled
                className="w-full bg-surface-lowest/50 border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-outline cursor-not-allowed"
              />
              <p className="text-xs text-outline-variant">Email cannot be changed directly.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-outline uppercase">Phone Number</label>
              <input
                {...form.register('phone')}
                placeholder="+91 9876543210"
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-8 py-3 rounded-full bg-gradient-primary text-surface-dim font-bold shadow-glow-primary hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {form.formState.isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
