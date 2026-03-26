// app/institute/ai-trainer/page.tsx
'use client'

import { useState } from 'react'
import { Upload, FileText, Brain, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AITrainerPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = () => {
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
      }
    }, 300)
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-space-grotesk font-bold text-white">AI Knowledge Trainer</h2>
        <p className="text-outline">Upload your institute&apos;s specialized notes and PDFs to train your AI Tutor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`glass-card p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center
              ${isUploading ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-bright/30'}
            `}
            onClick={!isUploading ? handleUpload : undefined}
          >
            <div className="w-20 h-20 rounded-full bg-surface-highest flex items-center justify-center mb-6 border border-outline-variant/50">
              {isUploading ? (
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              ) : (
                <Upload className="w-10 h-10 text-outline" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isUploading ? 'Training AI...' : 'Drag & Drop PDF or Text Files'}
            </h3>
            <p className="text-outline text-sm max-w-sm mb-6">
              Supported formats: .pdf, .docx, .txt (Max 50MB per file)
            </p>
            
            {isUploading && (
              <div className="w-full max-w-md bg-surface-lowest rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Active Training Status */}
          <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 bg-surface-bright/20 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">Current AI Status: Elite Tutor Mode</h4>
              <p className="text-xs text-outline">Trained on 124 documents. Optimized for JEE/NEET curriculum.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>

        {/* Recent Knowledge Bits */}
        <div className="space-y-6">
          <h3 className="font-space-grotesk font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Recent Training
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Physics_HC_Verma_Vol1.pdf', status: 'ready', date: '2h ago' },
              { name: 'Chemistry_Organic_Mechanism.pdf', status: 'ready', date: '5h ago' },
              { name: 'Math_Calculus_Notes.txt', status: 'ready', date: '1d ago' },
            ].map((doc, i) => (
              <div key={i} className="glass-card p-4 rounded-xl border border-outline-variant/20 flex items-center justify-between group hover:bg-surface-bright transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-4 h-4 text-outline-variant group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-white truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-outline italic">{doc.date}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="glass-card p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">
              AI requires re-indexing after every 10 documents for maximum accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
