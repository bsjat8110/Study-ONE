'use client'
import { useI18n } from '@/lib/i18n/store'
import { Star } from 'lucide-react'

export default function Testimonials() {
  const { t } = useI18n()
  const d = t.landing

  return (
    <section id="testimonials" className="py-24 relative z-10 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-tertiary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-tertiary tracking-widest uppercase mb-3">{d.wallOfLove}</h2>
          <h3 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white max-w-3xl mx-auto">
            {d.testimonialsTitle}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {d.testimonials.map((testimonial, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl relative">
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-outline-variant text-[15px] leading-relaxed mb-8 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-surface-dim font-space-grotesk">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">{testimonial.name}</h5>
                  <p className="text-xs text-primary">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
