'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
          Request a new reset link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
        <p className="text-gray-400 text-sm">Redirecting you to login...</p>
      </motion.div>
    )
  }

  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center"
        >
          {error}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
            New Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="min. 6 characters"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
        </button>
      </form>
      <p className="text-center mt-6">
        <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
          Back to Sign In
        </Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Study-ONE</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">Set New Password</h1>
          <p className="text-gray-400">Choose a strong password for your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <Suspense fallback={<Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />}>
            <ResetForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
