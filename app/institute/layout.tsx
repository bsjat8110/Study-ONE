'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, BookOpen, FileText, CreditCard,
  BarChart2, Settings, LogOut, Menu, X,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/lib/i18n/store'

export default function InstituteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useI18n()

  const navItems = [
    { icon: LayoutDashboard, label: t.common.dashboard,         href: '/institute/dashboard' },
    { icon: Users,           label: t.admin.totalStudents,      href: '/institute/students' },
    { icon: BookOpen,        label: t.admin.activeCourses,      href: '/institute/courses' },
    { icon: FileText,        label: t.admin.tests,              href: '/institute/tests' },
    { icon: CreditCard,      label: t.admin.monitorRevenue,     href: '/institute/payments' },
    { icon: BarChart2,       label: t.admin.analytics,          href: '/institute/analytics' },
    { icon: LayoutDashboard, label: t.admin.aiTrainer,          href: '/institute/ai-trainer' },
  ]

  const pageTitle = navItems.find(item => item.href === pathname)?.label ?? t.common.settings
  const initials = session?.user?.name?.substring(0, 2).toUpperCase() || 'AD'

  const closeSidebar = () => setSidebarOpen(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-outline-variant/30 shrink-0">
        <Link href="/" className="text-xl font-space-grotesk font-bold bg-gradient-primary bg-clip-text text-transparent">
          Study-ONE <span className="text-xs text-outline">Pro</span>
        </Link>
        <button
          onClick={closeSidebar}
          className="md:hidden p-1.5 rounded-lg text-outline hover:text-white hover:bg-surface-bright transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-surface-highest text-primary shadow-[inset_2px_0_0_#22d3ee] font-bold'
                  : 'text-outline hover:text-white hover:bg-surface-bright/50'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-outline-variant'}`} />
              {item.label}
            </Link>
          )
        })}

        <button
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent mt-4"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {t.common.logout}
        </button>
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-outline-variant/30 shrink-0">
        <Link
          href="/institute/settings"
          onClick={closeSidebar}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/institute/settings'
              ? 'bg-surface-highest text-primary font-bold'
              : 'text-outline hover:text-white hover:bg-surface-bright/50'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0 text-outline-variant" />
          {t.common.settings}
        </Link>

        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-surface-dim text-sm shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden text-sm min-w-0">
            <p className="font-bold text-white truncate">{session?.user?.name || 'Loading...'}</p>
            <p className="text-primary text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary selection:text-surface-dim">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-outline-variant/30 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-20
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] pointer-events-none rounded-bl-full z-0" />

        {/* Header */}
        <header className="h-16 md:h-20 flex-shrink-0 backdrop-blur-md bg-surface-dim/80 border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 relative z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-outline hover:text-white hover:bg-surface-bright transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-space-grotesk font-bold text-white">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <LanguageSwitcher />
            {/* Avatar — click to go settings */}
            <Link href="/institute/settings" title="Settings">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-surface-dim text-xs hover:scale-105 transition-transform">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative z-10 p-4 md:p-8 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
