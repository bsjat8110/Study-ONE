'use client'
import { useI18n } from '@/lib/i18n/store'
import { Check } from 'lucide-react'
import Link from 'next/link'

const planHrefs = ['/register', '/register', 'mailto:hello@studyone.live']
const popularIndex = 1

export default function Pricing() {
  const { t } = useI18n()
  const d = t.landing

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-secondary tracking-[0.35em] uppercase mb-3">{d.pricingEyebrow}</h2>
          <h3 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white">
            {d.pricingTitle}
          </h3>
          <p className="mt-5 max-w-3xl mx-auto text-slate-300 leading-relaxed">
            {d.pricingDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {d.plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card p-8 rounded-3xl border ${idx === popularIndex ? 'border-primary/50 shadow-glow-primary relative transform md:-translate-y-4' : 'border-outline-variant/30'} flex flex-col`}
            >
              {idx === popularIndex && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary text-surface-dim text-xs font-bold rounded-full">
                  {d.mostPopular}
                </div>
              )}
              <h4 className="text-xl font-bold font-space-grotesk text-white mb-2">{plan.name}</h4>
              <p className="text-outline text-sm mb-6 min-h-[40px]">{plan.description}</p>
              <div className="mb-8">
                <span className="text-4xl font-space-grotesk font-bold text-white">{plan.price}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-outline-variant">
                    <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={planHrefs[idx]} className={`w-full py-3 rounded-xl font-bold transition-all text-center block ${
                idx === popularIndex
                  ? 'bg-gradient-primary text-surface-dim hover:shadow-glow-primary'
                  : 'glass-panel text-white hover:bg-surface-bright'
              }`}>
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
