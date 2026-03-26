'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Building2, Mail, Lock, User, UserCircle, ArrowRight, Loader2, PlayCircle, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

export default function RegisterPage() {
  const { t } = useI18n()
  const a = t.auth
  
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTE_ADMIN'>('STUDENT')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    instituteName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.message || a.genericError)
      }
    } catch (err) {
      setError(a.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-[#020617]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.12),transparent_40%)]" />
      <div className="fixed inset-0 mesh-bg opacity-30" />
      
      <div className="relative w-full max-w-lg">
        <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-50" />

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-space-grotesk font-bold text-white mb-3">{a.createAccount}</h1>
            <p className="text-slate-400 text-sm">{a.registerSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                  role === 'STUDENT'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl border ${role === 'STUDENT' ? 'border-primary/30' : 'border-white/10'}`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{a.student}</span>
                {role === 'STUDENT' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow-glow-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('INSTITUTE_ADMIN')}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                  role === 'INSTITUTE_ADMIN'
                    ? 'bg-secondary/10 border-secondary text-secondary'
                    : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl border ${role === 'INSTITUTE_ADMIN' ? 'border-secondary/30' : 'border-white/10'}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{a.institute}</span>
                {role === 'INSTITUTE_ADMIN' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full shadow-glow-secondary" />}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{role === 'STUDENT' ? a.fullName : a.instituteName}</label>
                <div className="relative group">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                    placeholder={role === 'STUDENT' ? "Aaryan Sharma" : "Elite Academy"}
                    value={role === 'STUDENT' ? formData.name : formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, [role === 'STUDENT' ? 'name' : 'instituteName']: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{a.email}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                    placeholder="name@institute.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{a.password}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary via-secondary to-tertiary text-slate-950 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4 overflow-hidden relative"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 group-hover:h-full transition-all duration-500 opacity-20" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">{t.common.getStarted}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            {a.haveAccount}{' '}
            <Link href="/login" className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
              {t.common.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
