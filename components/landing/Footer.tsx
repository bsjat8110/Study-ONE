'use client'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n/store'

export default function Footer() {
  const { t } = useI18n()
  const d = t.landing

  return (
    <footer className="w-full bg-surface border-t border-outline-variant/30 pt-20 pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-space-grotesk font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 inline-block">
              Study-ONE
            </Link>
            <p className="text-outline text-sm leading-relaxed mb-6">{d.footerTagline}</p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-outline hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-outline hover:text-primary transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-outline hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-space-grotesk font-bold text-white mb-6">{d.footerProduct}</h4>
            <ul className="space-y-3 text-sm text-outline">
              <li><Link href="#features" className="hover:text-primary transition-colors">{d.footerFeatures}</Link></li>
              <li><Link href="#intelligence" className="hover:text-primary transition-colors">{d.footerIntelligence}</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">{d.footerPricing}</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">{t.common.login}</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">{t.common.getStarted}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-space-grotesk font-bold text-white mb-6">{d.footerCompany}</h4>
            <ul className="space-y-3 text-sm text-outline">
              <li><Link href="/" className="hover:text-primary transition-colors">{d.footerAbout}</Link></li>
              <li><a href="mailto:hello@studyone.live" className="hover:text-primary transition-colors">{d.footerCareers}</a></li>
              <li><Link href="#testimonials" className="hover:text-primary transition-colors">{d.footerStories}</Link></li>
              <li><a href="mailto:hello@studyone.live" className="hover:text-primary transition-colors">{d.footerContact}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-space-grotesk font-bold text-white mb-6">{d.footerLegal}</h4>
            <ul className="space-y-3 text-sm text-outline">
              <li><a href="mailto:hello@studyone.live?subject=Terms%20Request" className="hover:text-primary transition-colors">{d.footerTerms}</a></li>
              <li><a href="mailto:hello@studyone.live?subject=Privacy%20Policy%20Request" className="hover:text-primary transition-colors">{d.footerPrivacy}</a></li>
              <li><a href="mailto:hello@studyone.live?subject=Refund%20Policy%20Request" className="hover:text-primary transition-colors">{d.footerRefund}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-outline text-xs">
            © {new Date().getFullYear()} {d.footerCopyright}
          </p>
          <div className="flex items-center gap-2 text-outline text-xs">
            <Mail className="w-3 h-3" />
            hello@studyone.live
          </div>
        </div>
      </div>
    </footer>
  )
}
