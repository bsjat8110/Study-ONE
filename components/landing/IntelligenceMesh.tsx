'use client'
import { useI18n } from '@/lib/i18n/store'

export default function IntelligenceMesh() {
  const { t } = useI18n()
  const d = t.landing

  return (
    <section id="intelligence" className="relative z-10 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 mesh-bg opacity-60" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] p-8 md:p-12">
            <div>
              <p className="text-xs font-bold tracking-[0.35em] uppercase text-primary mb-4">{d.connectedIntelligence}</p>
              <h2 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white max-w-3xl leading-tight">
                {d.intelligenceTitle}
              </h2>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
                {d.intelligenceDesc}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {d.pillars.map((pillar, idx) => {
                  const accents = ['from-cyan-400/30 via-cyan-400/10 to-transparent', 'from-indigo-400/30 via-indigo-400/10 to-transparent', 'from-emerald-400/30 via-emerald-400/10 to-transparent']
                  return (
                    <article key={idx} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${accents[idx]}`} />
                      <div className="relative">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{pillar.eyebrow}</p>
                        <h3 className="mt-3 text-xl font-space-grotesk font-bold text-white">{pillar.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{pillar.description}</p>
                        <div className="mt-6 flex items-end justify-between gap-3">
                          <span className="text-2xl font-space-grotesk font-bold text-white">{pillar.metric}</span>
                          <span className="text-right text-xs text-slate-400">{pillar.detail}</span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.16),transparent_40%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{d.systemPulse}</p>
                    <h3 className="mt-2 text-2xl font-space-grotesk font-bold text-white">{d.automationGraph}</h3>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    {d.liveSync}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {d.connections.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{d.flowLabel} {index + 1}</p>
                        <p className="mt-2 text-sm md:text-base text-slate-200">{item}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{d.responseLoop}</p>
                    <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">&lt; 2s</p>
                    <p className="mt-2 text-sm text-slate-400">{d.responseLoopDetail}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{d.connectedSurfaces}</p>
                    <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">{d.connectedSurfacesVal}</p>
                    <p className="mt-2 text-sm text-slate-400">{d.connectedSurfacesDetail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
