'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/institute/export?type=payments')
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="(.+)"/)
      a.download = match ? match[1] : 'payments.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full px-4 py-3 rounded-xl bg-surface-highest border border-outline-variant/30 hover:border-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? 'Exporting...' : 'Download Statement'}
    </button>
  )
}
