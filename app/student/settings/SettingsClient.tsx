'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Bell, ShieldCheck, Moon, Pencil, Check, Sparkles, Brain, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

type ProfileForm = { name: string; phone: string }

interface Props {
  initialName: string
  initialEmail: string
}

export default function SettingsClient({ initialName, initialEmail }: Props) {
  const [currentName, setCurrentName] = useState(initialName)
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const { t } = useI18n()

  const form = useForm<ProfileForm>({
    defaultValues: { name: initialName, phone: '' },
  })

  const handleEdit = () => {
    form.reset({ name: currentName, phone: '' })
    setIsEditing(true)
    setSaveSuccess(false)
    setSaveError('')
  }

  const handleSave = form.handleSubmit(async (data) => {
    setSaveError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setSaveError(json.error || 'Something went wrong'); return }
      setCurrentName(data.name.trim())
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('Network error — please try again')
    }
  })

  const initials = currentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const summaryCards = [
    {
      label: t.student.settingsProfileState,
      value: t.student.settingsStateValue,
      detail: t.student.settingsStateDetail,
      icon: User,
    },
    {
      label: t.student.settingsSecurity,
      value: t.student.settingsSecurityValue,
      detail: t.student.settingsSecurityDetail,
      icon: ShieldCheck,
    },
    {
      label: t.student.settingsCommunication,
      value: initialEmail || 'Email set',
      detail: t.student.settingsCommDetail,
      icon: Mail,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative flex flex-col gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary mb-4">{t.student.settingsCardTitle}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space-grotesk font-bold text-white leading-tight">{t.student.settingsHeroDesc}</h1>
            <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed">
              {t.student.settingsHeroSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 hover:bg-slate-900/80 transition-colors">
                <card.icon className="w-6 h-6 text-primary mb-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-xl font-space-grotesk font-bold text-white break-all">{card.value}</p>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Nav */}
        <div className="space-y-2">
          {[
            { label: t.student.settingsProfileNav, icon: User, active: true },
            { label: t.student.settingsNotifNav, icon: Bell, active: false },
            { label: t.student.settingsAppearanceNav, icon: Moon, active: false },
            { label: t.student.settingsSecurityNav, icon: ShieldCheck, active: false },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${item.active ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-sm' : 'text-outline hover:bg-surface-lowest hover:text-white'}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mt-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 text-primary text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                {t.student.settingsIntelligence}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {t.student.settingsIntellDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-space-grotesk font-bold text-white">{t.student.settingsProfileNav}</h2>
              {saveSuccess && (
                <span className="flex items-center gap-2 text-sm text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                  <Check className="w-4 h-4" /> {t.student.settingsSave.replace('Save Changes', 'Saved!')}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-primary bg-gradient-to-br from-primary/20 to-surface-lowest flex items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl font-space-grotesk font-bold text-white">{initials}</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{currentName}</h3>
                <p className="text-sm text-outline mt-1">{initialEmail}</p>
                <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Brain className="w-4 h-4" />
                  {t.student.settingsAccountReady}
                </div>
              </div>
            </div>

            {/* Inline expand pattern */}
            <div className={`overflow-hidden transition-all duration-300 ${isEditing ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'}`}>
              <div className="space-y-2 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">{t.student.settingsFullName}</p>
                    <p className="text-white font-bold text-lg">{currentName}</p>
                  </div>
                  <button onClick={handleEdit}
                    className="mt-4 sm:mt-0 p-3 rounded-xl border border-white/10 text-outline hover:text-white hover:bg-white/5 transition-all self-start sm:self-auto flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-bold sm:hidden">Edit</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">{t.student.settingsEmail}</p>
                  <p className="text-outline text-base">{initialEmail} <span className="text-xs text-outline-variant ml-2">{t.student.settingsCannotChange}</span></p>
                </div>
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${isEditing ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <form onSubmit={handleSave} className="space-y-6 pb-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 mt-4">
                {saveError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" />{saveError}</div>}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">{t.student.settingsFullName} <span className="text-primary">*</span></label>
                  <input
                    {...form.register('name', { required: t.student.settingsRequired })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-primary/50 focus:bg-slate-900 transition-all shadow-inner"
                  />
                  {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">{t.student.settingsPhone}</label>
                  <input
                    {...form.register('phone')}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-primary/50 focus:bg-slate-900 transition-all shadow-inner"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">{t.student.settingsEmail}</label>
                  <input type="email" value={initialEmail} disabled
                    className="w-full bg-surface-dim/30 border border-transparent rounded-xl px-4 py-3.5 text-base text-outline-variant cursor-not-allowed" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <button type="submit" disabled={form.formState.isSubmitting}
                    className="px-8 py-3 rounded-xl font-bold text-sm bg-primary text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center">
                    {form.formState.isSubmitting ? t.student.settingsSaving : t.student.settingsSave}
                  </button>
                  <button type="button" onClick={() => { setIsEditing(false); setSaveError('') }}
                    className="px-8 py-3 rounded-xl font-bold text-sm border border-white/10 text-outline hover:text-white hover:bg-white/5 transition-all flex items-center justify-center">
                    {t.student.settingsCancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
