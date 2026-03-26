'use client'
import { useI18n } from '@/lib/i18n/store'

export default function Stats() {
  const { t } = useI18n()
  const d = t.landing

  const stats = [
    { label: d.statsLabel1, value: d.statsVal1, detail: d.statsDetail1 },
    { label: d.statsLabel2, value: d.statsVal2, detail: d.statsDetail2 },
    { label: d.statsLabel3, value: d.statsVal3, detail: d.statsDetail3 },
    { label: d.statsLabel4, value: d.statsVal4, detail: d.statsDetail4 },
  ]

  return (
    <section className="py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-7">
              <div className="text-3xl md:text-4xl font-bold font-space-grotesk bg-gradient-primary bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-outline uppercase tracking-[0.22em]">
                {stat.label}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
