'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'
import Link from 'next/link'

export default function AiTutorWidget() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      router.push('/student/ai-tutor')
      return
    }
    // Encode the query and pass as search param so AI tutor page can pick it up
    router.push(`/student/ai-tutor?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="glass-card p-6 rounded-2xl border-tertiary/30 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-tertiary/20 blur-[50px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-tertiary to-secondary flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-space-grotesk font-bold text-white">AI Tutor</h3>
        </div>
        <p className="text-xs text-outline mb-4">Stuck somewhere? Ask your 24/7 personal tutor.</p>
        <form onSubmit={handleSubmit}>
          <div className="bg-surface-lowest border border-outline-variant/50 rounded-xl p-1 flex items-center focus-within:border-tertiary focus-within:shadow-[0_0_10px_rgba(168,85,247,0.15)] transition-all">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type your doubt here..."
              className="w-full bg-transparent border-none outline-none text-xs text-white px-3 py-2 placeholder:text-gray-600"
            />
            <button
              type="submit"
              className="bg-tertiary text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
            >
              ↑
            </button>
          </div>
        </form>
        <Link href="/student/ai-tutor" className="block text-center mt-3 text-[10px] text-outline hover:text-tertiary transition-colors">
          Open full AI Tutor →
        </Link>
      </div>
    </div>
  )
}
