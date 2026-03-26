'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BrainCircuit, Send, Sparkles, Loader2, RotateCcw, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n/store'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-outline hover:text-white">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

function AITutorInner() {
  const { t, lang, setLanguage } = useI18n()
  const s = t.student
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Language-sensitive starters
  const STARTERS = [
    lang === 'hi' ? "Newton के तीसरे नियम को उदाहरण के साथ समझाएं" : "Explain Newton's Third Law with examples",
    lang === 'hi' ? "Quadratic equations को step-by-step कैसे हल करें?" : "How to solve quadratic equations step by step?",
    lang === 'hi' ? "Mitosis और meiosis में क्या अंतर है?" : "What is the difference between mitosis and meiosis?",
    lang === 'hi' ? "Ohm के नियम और उसके अनुप्रयोगों को समझाएं" : "Explain Ohm's Law and its applications",
  ]

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage')
      if (res.ok) {
        const data = await res.json()
        setUsage({ used: data.dailyTokensUsed, limit: data.limit })
      }
    } catch { /* skip */ }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchUsage()
    const q = searchParams.get('q')
    if (q && !autoSentRef.current) {
      autoSentRef.current = true
      sendMessage(q)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, lang }),
      })

      if (!res.ok) {
        let errorMsg = s.sorryError
        if (res.status === 429) {
          const data = await res.json()
          if (data.error === 'DAILY_LIMIT_REACHED') {
            errorMsg = lang === 'hi' 
              ? 'आपकी दैनिक सीमा समाप्त हो गई है (100k टोकन)। कृपया कल पुन: प्रयास करें।' 
              : 'Daily limit reached (100k tokens). Please try again tomorrow.'
          }
        }

        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: errorMsg }
          return copy
        })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                setMessages(prev => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + parsed.text }
                  return copy
                })
              }
            } catch { /* skip */ }
          }
        }
      }
      
      // Refresh usage after completion
      fetchUsage()

    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: s.connectionError }
        return copy
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, loading, s.sorryError, s.connectionError, lang])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-110px)] md:h-[calc(100vh-160px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-space-grotesk font-bold text-white flex items-center gap-3">
              {s.aiTutorTitle} <Sparkles className="w-5 h-5 text-tertiary" />
            </h1>
            <p className="text-outline text-sm mt-1">{s.aiTutorSubtitle}</p>
          </div>
          
          {usage && (
            <div className="hidden md:block glass-card border-white/10 px-4 py-2 rounded-2xl">
              <div className="flex items-center justify-between gap-8 mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Daily Usage</span>
                <span className="text-[10px] text-white font-mono">
                  {Math.round(usage.used / 1000)}k / {usage.limit / 1000}k
                </span>
              </div>
              <div className="w-32 h-1 bg-surface-highest rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    (usage.used / usage.limit) > 0.8 ? 'bg-red-500' : 'bg-tertiary'
                  }`}
                  style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-outline hover:text-white border border-outline-variant/30 hover:border-white/30 px-3 py-2 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {s.newChat}
          </button>
        )}
      </div>

      {messages.length === 0 && usage && (
        <div className="md:hidden glass-card border-white/10 px-4 py-3 rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Daily Usage</span>
            <span className="text-[10px] text-white">
              {Math.round(usage.used / 1000)}k / {usage.limit / 1000}k
            </span>
          </div>
          <div className="w-full h-1 bg-surface-highest rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                (usage.used / usage.limit) > 0.8 ? 'bg-red-500' : 'bg-tertiary'
              }`}
              style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 glass-card rounded-3xl border-tertiary/20 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-tertiary/5 to-transparent pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tertiary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-white font-bold text-lg mb-1">{s.howCanHelp}</h2>
                <p className="text-outline text-sm">{s.askAnyQuestion}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(starter)}
                    className="text-left text-sm text-outline hover:text-white border border-outline-variant/30 hover:border-tertiary/50 bg-surface-lowest hover:bg-surface-highest px-4 py-3 rounded-2xl transition-all"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <span className="bg-surface-lowest px-3 py-1 rounded-full border border-outline-variant/30 text-xs text-outline">
                  {s.conversationStarted}
                </span>
              </div>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tertiary to-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-1">
                        <BrainCircuit className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`group relative max-w-[92%] ${
                      msg.role === 'user'
                        ? 'bg-surface-highest text-white px-5 py-3 rounded-2xl rounded-tr-sm border border-outline-variant/30'
                        : 'glass-panel text-white px-5 py-4 rounded-2xl rounded-tl-sm border-tertiary/20 leading-relaxed'
                    } text-sm`}>
                      {msg.role === 'assistant' && msg.content === '' && loading ? (
                        <div className="flex items-center gap-2 text-outline py-1">
                          <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      ) : (
                        <div>
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                          {msg.role === 'assistant' && msg.content && <CopyButton text={msg.content} />}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <div className="p-3 md:p-4 border-t border-tertiary/20 bg-surface-dim/50 backdrop-blur-md relative z-10">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 md:gap-3 bg-surface-lowest border border-outline-variant/50 focus-within:border-tertiary focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)] rounded-2xl p-2 transition-all">
              {/* Language Switcher inside input box */}
              <div className="flex items-center gap-1 bg-surface-dim px-2 py-1 rounded-xl border border-outline-variant/30 shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    lang === 'hi' 
                    ? 'bg-tertiary text-white shadow-glow-sm' 
                    : 'text-outline hover:text-white'
                  }`}
                >
                  हिं
                </button>
                <div className="w-[1px] h-3 bg-outline-variant/30 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    lang === 'en' 
                    ? 'bg-primary text-white shadow-glow-sm' 
                    : 'text-outline hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={lang === 'hi' ? 'अपनी शंका यहाँ पूछें...' : s.askDoubt}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-white px-2 md:px-4 py-2 text-sm disabled:opacity-50 placeholder:text-gray-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-tertiary to-secondary text-white w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-glow-sm disabled:opacity-40 disabled:scale-100 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
          <div className="text-center mt-2 text-[10px] text-outline">{s.aiMistakes}</div>
        </div>
      </div>
    </div>
  )
}

export default function StudentAITutor() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-140px)]"><Loader2 className="w-6 h-6 text-tertiary animate-spin" /></div>}>
      <AITutorInner />
    </Suspense>
  )
}
