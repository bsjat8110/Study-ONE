'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Building2, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

export default function LoginPage() {
  const { t } = useI18n()
  const a = t.auth
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(a.invalidAuth)
      } else {
        // Fetch the session to read the user's role
        const session = await getSession()
        const role = (session?.user as any)?.role

        if (role === 'INSTITUTE_ADMIN' || role === 'SUPER_ADMIN') {
          router.push('/institute/dashboard')
        } else {
          router.push('/student/dashboard')
        }
        router.refresh()
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
      
      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-50" />
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 group transition-all duration-500 hover:border-primary/50">
              <Sparkles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">{a.welcomeBack}</h1>
            <p className="text-slate-400 text-sm">{a.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{a.email}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{a.password}</label>
                <Link href="#" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                  {a.forgotPassword}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t.common.login}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            {a.noAccount}{' '}
            <Link href="/register" className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
              {a.createAccount}
            </Link>
          </p>
        </div>

        {/* Branding Subtitle */}
        <p className="mt-8 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          Study-ONE <span className="w-1 h-1 rounded-full bg-slate-700" /> Enterprise OS
        </p>
      </div>
    </div>
  )
}
