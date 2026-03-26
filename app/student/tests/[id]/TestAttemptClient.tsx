'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, CheckCircle, AlertCircle } from 'lucide-react'

type TestData = {
  id: string; title: string; subject: string
  duration: number; totalMarks: number; passingMarks: number
}

export default function TestAttemptClient({ test }: { test: TestData }) {
  const router = useRouter()
  const [score, setScore] = useState('')
  const [timeLeft, setTimeLeft] = useState(test.duration * 60)
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const startTime = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const startTest = () => {
    setStarted(true)
    startTime.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async () => {
    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > test.totalMarks) {
      setSubmitError(`Score must be between 0 and ${test.totalMarks}`)
      return
    }
    clearInterval(timerRef.current)
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000)
    setSubmitError('')

    try {
      const res = await fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: test.id, score: scoreNum, timeTaken }),
      })
      const json = await res.json()
      if (!res.ok) { setSubmitError(json.error || 'Submission failed'); return }
      setSubmitted(true)
      setResult({ score: scoreNum, passed: scoreNum >= test.passingMarks })
    } catch {
      setSubmitError('Network error — please try again')
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (submitted && result) return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="glass-card p-10 rounded-3xl text-center space-y-6">
        {result.passed
          ? <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
          : <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        }
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-2">
            {result.passed ? 'Congratulations!' : 'Better luck next time!'}
          </h1>
          <p className="text-outline">{test.title}</p>
        </div>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{result.score}</div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Score</div>
          </div>
          <div className="w-px bg-outline-variant/30" />
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{test.totalMarks}</div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Total</div>
          </div>
          <div className="w-px bg-outline-variant/30" />
          <div className="text-center">
            <div className={`text-4xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {Math.round((result.score / test.totalMarks) * 100)}%
            </div>
            <div className="text-xs text-outline uppercase font-bold mt-1">Percentage</div>
          </div>
        </div>
        <button onClick={() => router.push('/student/tests')}
          className="px-8 py-3 rounded-xl bg-gradient-primary text-surface-dim font-bold shadow-glow-sm hover:scale-105 transition-all">
          Back to Tests
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold text-white mb-1">{test.title}</h1>
            <p className="text-outline text-sm">{test.subject} • {test.totalMarks} marks • {test.duration} min</p>
          </div>
          {started && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface-lowest text-white border border-outline-variant/30'}`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!started ? (
          <div className="space-y-6">
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-white">Before you begin:</h3>
              <ul className="text-sm text-outline space-y-1.5">
                <li>• Duration: <span className="text-white font-bold">{test.duration} minutes</span></li>
                <li>• Total Marks: <span className="text-white font-bold">{test.totalMarks}</span></li>
                <li>• Passing Marks: <span className="text-white font-bold">{test.passingMarks}</span></li>
                <li>• You can only submit once. Timer starts immediately.</li>
              </ul>
            </div>
            <button onClick={startTest}
              className="w-full py-4 rounded-2xl bg-gradient-primary text-surface-dim font-bold text-lg shadow-glow-sm hover:scale-105 transition-all">
              Start Test
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-lowest border border-outline-variant/30 rounded-2xl p-6 text-center text-outline">
              <p className="text-sm mb-2">Enter your score after completing the test paper.</p>
              <p className="text-xs">(Full question module coming soon)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-outline uppercase">Your Score (out of {test.totalMarks})</label>
              <input
                type="number"
                value={score}
                onChange={e => setScore(e.target.value)}
                min={0}
                max={test.totalMarks}
                placeholder={`0 – ${test.totalMarks}`}
                className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-2xl font-bold text-white text-center focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all"
              />
              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-gradient-primary text-surface-dim font-bold text-lg shadow-glow-sm hover:scale-105 transition-all">
              Submit Test
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
