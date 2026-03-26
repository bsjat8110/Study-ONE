'use client'
import { useI18n } from '@/lib/i18n/store'
import { BarChart3, BookOpen, Brain, Shield, Users, Trophy } from 'lucide-react'

const icons = [BookOpen, Users, BarChart3, Shield, Brain, Trophy]
const colors = [
  'from-cyan-400 to-blue-500',
  'from-purple-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-500',
  'from-yellow-400 to-amber-500',
]

export default function Features() {
  const { t } = useI18n()
  const d = t.landing

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-[0.35em] uppercase mb-3">{d.featuresEyebrow}</h2>
          <h3 className="text-4xl md:text-5xl font-space-grotesk font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {d.featuresTitle}
          </h3>
          <p className="mt-5 max-w-3xl mx-auto text-slate-300 leading-relaxed">
            {d.featuresDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {d.features.map((feature, idx) => {
            const Icon = icons[idx]
            return (
              <div
                key={idx}
                className="glass-card p-8 rounded-[1.75rem] group hover:bg-surface-bright/50 transition-all duration-300 relative overflow-hidden border border-white/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors[idx]} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="w-12 h-12 rounded-xl bg-surface-highest flex items-center justify-center mb-6 shadow-glow-sm relative z-10">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold font-space-grotesk mb-3 text-white relative z-10">{feature.title}</h4>
                <p className="text-outline text-sm leading-relaxed relative z-10">{feature.description}</p>
                <div className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-slate-500 relative z-10">
                  {d.connectedByDesign}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
