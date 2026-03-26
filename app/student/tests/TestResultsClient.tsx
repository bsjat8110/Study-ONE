'use client'
import { useState } from 'react'
import { BarChart2, X, Clock, Target, Sparkles } from 'lucide-react'

interface ResultItem {
  id: string
  score: number
  timeTaken: number
  submittedAt: string
  test: {
    title: string
    subject: string
    totalMarks: number
    passingMarks: number
  }
}

export default function TestResultsClient({ results }: { results: ResultItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (results.length === 0) {
    return <p className="text-outline text-sm text-center py-8">No test results yet.</p>
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const pct = result.test.totalMarks > 0
          ? Math.round((result.score / result.test.totalMarks) * 100)
          : result.score
        const passed = result.score >= result.test.passingMarks
        const isOpen = openId === result.id
        const mins = Math.floor(result.timeTaken / 60)
        const secs = result.timeTaken % 60
        const date = new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

        return (
          <div key={result.id} className="rounded-xl border border-outline-variant/20 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-surface-bright/50 transition-colors">
              <div>
                <h3 className="font-bold text-white mb-1 text-sm">{result.test.title}</h3>
                <div className="flex gap-3 text-xs">
                  <span className={passed ? 'text-emerald-400' : 'text-rose-400'}>{passed ? 'Passed' : 'Failed'}</span>
                  <span className="text-outline">{result.test.subject}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Use analysis to refine your next attempt strategy.</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-3 sm:pt-0 sm:pl-4">
                <div className="text-center">
                  <p className="text-2xl font-space-grotesk font-bold text-white leading-none">{result.score}/{result.test.totalMarks}</p>
                  <p className="text-[10px] text-outline mt-1">{pct}%</p>
                </div>
                <button
                  onClick={() => setOpenId(isOpen ? null : result.id)}
                  className="bg-surface-lowest hover:bg-white hover:text-surface-dim transition-all text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  {isOpen ? <X className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
                  {isOpen ? 'Close' : 'Analysis'}
                </button>
              </div>
            </div>

            {/* Inline analysis panel */}
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 bg-surface-lowest border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                  <p className={`text-2xl font-bold font-space-grotesk ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{pct}%</p>
                  <p className="text-[10px] text-outline uppercase mt-1">Percentage</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                  <p className="text-2xl font-bold font-space-grotesk text-white">{result.score}</p>
                  <p className="text-[10px] text-outline uppercase mt-1">Score</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-outline" />
                    <p className="text-lg font-bold font-space-grotesk text-white">{mins}m {secs}s</p>
                  </div>
                  <p className="text-[10px] text-outline uppercase">Time Taken</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-outline" />
                    <p className="text-lg font-bold font-space-grotesk text-white">{result.test.passingMarks}</p>
                  </div>
                  <p className="text-[10px] text-outline uppercase">Pass Mark</p>
                </div>
                <div className="text-center p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-outline" />
                    <p className={`text-lg font-bold font-space-grotesk ${passed ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {passed ? 'Strong' : 'Recover'}
                    </p>
                  </div>
                  <p className="text-[10px] text-outline uppercase">Signal</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <div className="flex justify-between text-xs text-outline mb-1">
                    <span>Score</span>
                    <span>{result.score} / {result.test.totalMarks}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passed ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-outline mt-2">Submitted on {date}</p>
                  <p className="text-[11px] text-slate-400 mt-3">
                    {passed
                      ? 'This attempt crossed the pass threshold. Push now for cleaner accuracy and faster completion.'
                      : 'This attempt is below threshold. Review weak areas before your next scheduled test.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
