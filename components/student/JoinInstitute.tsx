'use client'
import { useState } from 'react'
import { Plus, X, Search, ShieldCheck, Sparkles, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/store'

export default function JoinInstitute() {
  const [instituteId, setInstituteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { t: d } = useI18n()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instituteId.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/student/join-institute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instituteId: instituteId.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || d.common.error)
      
      setSuccess(true)
      setTimeout(() => router.refresh(), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-8 rounded-2xl border-emerald-500/30 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{d.student.welcomeAboard}</h3>
        <p className="text-slate-400 font-medium font-space-grotesk">{d.student.joinedSuccessDesc}</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 rounded-3xl border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-space-grotesk font-bold text-white tracking-tight">{d.student.connectInstitute}</h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">{d.student.connectInstituteDesc}</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative group/input">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
            <input
              type="text"
              value={instituteId}
              onChange={(e) => setInstituteId(e.target.value)}
              placeholder={d.student.pasteInstituteId}
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-mono"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !instituteId.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-slate-950 font-bold text-lg hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                {d.student.joinInstituteBtn}
                <Sparkles className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-6 border-t border-white/5 pt-6">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-surface-highest overflow-hidden`} />
            ))}
          </div>
          <p 
            className="text-[11px] text-slate-500 uppercase tracking-widest font-bold"
            dangerouslySetInnerHTML={{ __html: d.student.joinedByScholars }}
          />
        </div>
      </div>
    </div>
  )
}
