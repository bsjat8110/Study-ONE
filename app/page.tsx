'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'
import Features from '@/components/landing/Features'
import Stats from '@/components/landing/Stats'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import IntelligenceMesh from '@/components/landing/IntelligenceMesh'
import Footer from '@/components/landing/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home() {
  const { t } = useI18n()
  const d = t.landing

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="relative min-h-screen bg-surface-dim overflow-x-hidden selection:bg-primary selection:text-surface-dim">
      {/* Background glow effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[150px] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 glass-static rounded-full px-5 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-glass">
        <div className="text-xl md:text-2xl font-space-grotesk font-bold bg-gradient-primary bg-clip-text text-transparent relative z-50">
          Study-ONE
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-outline hover:text-white transition-colors">
          <Link href="#intelligence" className="hover:text-primary transition-colors">{d.navIntelligence}</Link>
          <Link href="#features" className="hover:text-primary transition-colors">{d.navFeatures}</Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">{d.navReviews}</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">{d.navPricing}</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          <LanguageSwitcher />
          <Link href="/login" className="px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold border border-outline-variant hover:bg-surface-bright transition-all text-white">
            {t.common.login}
          </Link>
          <Link href="/register" className="px-5 py-2 rounded-full text-sm font-bold bg-gradient-primary text-surface-dim hover:shadow-glow-primary hover:scale-105 transition-all">
            {t.common.getStarted}
          </Link>
        </div>

        {/* Mobile Menu Toggle & Lang Switcher */}
        <div className="flex md:hidden items-center gap-4 relative z-50">
          <LanguageSwitcher />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-1 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-4 p-5 rounded-3xl glass-card flex flex-col gap-4 border border-outline-variant shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 md:hidden z-40">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#intelligence" className="text-lg font-medium text-white hover:text-primary transition-colors">{d.navIntelligence}</Link>
            <div className="h-px w-full bg-outline-variant/30" />
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#features" className="text-lg font-medium text-white hover:text-primary transition-colors">{d.navFeatures}</Link>
            <div className="h-px w-full bg-outline-variant/30" />
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#testimonials" className="text-lg font-medium text-white hover:text-primary transition-colors">{d.navReviews}</Link>
            <div className="h-px w-full bg-outline-variant/30" />
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#pricing" className="text-lg font-medium text-white hover:text-primary transition-colors">{d.navPricing}</Link>
            
            <div className="flex flex-col gap-3 mt-4">
              <Link href="/login" className="w-full text-center px-5 py-3 rounded-full text-base font-bold flex-1 border border-outline-variant hover:bg-surface-bright transition-all text-white">
                {t.common.login}
              </Link>
              <Link href="/register" className="w-full text-center px-5 py-3 rounded-full text-base font-bold flex-1 bg-gradient-primary text-surface-dim shadow-glow-primary transition-all">
                {t.common.getStarted}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 md:pt-44 pb-20 px-6 max-w-7xl mx-auto min-h-[92vh] z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 mb-8 animate-float shadow-[0_0_30px_rgba(74,222,128,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_18px_rgba(74,222,128,0.8)]"></span>
              </span>
              <span className="text-xs md:text-sm font-black bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent tracking-[0.3em] uppercase drop-shadow-sm">
                {d.enterprise} <span className="font-light tracking-[0.2em] text-slate-300">{d.platform}</span>
              </span>
            </div>

            <div className="flex items-center justify-center lg:justify-start mb-8">
              <h1 className="flex items-center font-space-grotesk font-black text-6xl sm:text-7xl md:text-8xl lg:text-[120px] leading-none tracking-tight">
                <span className="text-white drop-shadow-xl tracking-normal">Study</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 drop-shadow-2xl ml-3 sm:ml-4 lg:ml-6 relative">
                  ONE
                  {/* Premium Sparkle/Dot Accent */}
                  <span className="absolute -top-1 -right-6 md:-top-3 md:-right-8 animate-pulse">
                    <span className="block w-3 h-3 md:w-5 md:h-5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
                  </span>
                </span>
              </h1>
            </div>

            <div className="mb-10 max-w-3xl">
              <p className="text-lg md:text-xl text-primary font-medium tracking-wide leading-relaxed">
                {d.heroDescription}
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="px-8 py-5 rounded-2xl font-bold text-lg bg-gradient-primary text-surface-dim hover:shadow-glow-primary hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                {d.launchAsStudent}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link href="/login" className="px-8 py-5 rounded-2xl font-bold text-lg glass-card text-white hover:bg-surface-bright hover:border-outline transition-all text-center">
                {d.openInstituteDashboard}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
              {d.trustSignals.map((signal) => (
                <span key={signal} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 blur-2xl" />
            <div className="relative scan-glow rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 md:p-6 backdrop-blur-2xl overflow-hidden">
              <div className="absolute inset-0 mesh-bg opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{d.commandCenter}</p>
                    <h2 className="mt-2 text-2xl md:text-3xl font-space-grotesk font-bold text-white">{d.connectedAcademicIntelligence}</h2>
                  </div>
                  <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {d.autoSync}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {d.signalCards.map((card) => (
                    <div key={card.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                      <p className="mt-3 text-3xl font-space-grotesk font-bold text-white">{card.value}</p>
                      <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{d.flowMap}</p>
                        <p className="mt-2 text-lg font-bold text-white">{d.studentActivityBecomesAction}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{d.automationScore}</p>
                        <p className="text-2xl font-space-grotesk font-bold text-primary">92%</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {d.flowSteps.map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200">
                          <span>{item}</span>
                          <span className="text-primary">Connected</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{d.operationalPulse}</p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <p className="text-xs text-emerald-300">{d.studentsOnline}</p>
                        <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">1,284</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                          <p className="text-xs text-slate-400">{d.testsRunning}</p>
                          <p className="mt-2 text-2xl font-space-grotesk font-bold text-white">48</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                          <p className="text-xs text-slate-400">{d.doubtsResolved}</p>
                          <p className="mt-2 text-2xl font-space-grotesk font-bold text-white">9.4k</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-xs text-slate-400">{d.premiumFeel}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{d.premiumFeelDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Components */}
      <Stats />
      <IntelligenceMesh />
      <Features />
      <Testimonials />
      <Pricing />

      {/* Final CTA Strip */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-panel p-12 md:p-16 rounded-[2.5rem] text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
            <h2 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white mb-6 relative z-10">
              {d.ctaTitle}
            </h2>
            <p className="text-outline-variant text-lg mb-10 max-w-2xl relative z-10">
              {d.ctaDesc}
            </p>
            <Link href="/register" className="px-10 py-5 rounded-full font-bold text-xl bg-white text-surface-dim hover:scale-105 transition-transform z-10 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              {d.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
