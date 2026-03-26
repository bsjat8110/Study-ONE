'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Home, BookOpen, PenTool, TrendingUp, Trophy,
  MessageSquare, Calendar, LogOut, Settings, Menu, X,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/lib/i18n/store'

function InitialsAvatar({ name, size = 'md' }: { name?: string | null; size?: 'sm' | 'md' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'
  const sizeClass = size === 'sm'
    ? 'w-8 h-8 text-xs'
    : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-surface-dim shrink-0 border-2 border-primary/50 shadow-glow-sm`}>
      {initials}
    </div>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useI18n()

  const navItems = [
    { icon: Home,          label: t.common.dashboard,      href: '/student/dashboard' },
    { icon: BookOpen,      label: t.student.myCourses,     href: '/student/courses' },
    { icon: PenTool,       label: t.student.upcomingTests, href: '/student/tests' },
    { icon: TrendingUp,    label: t.student.progress,      href: '/student/progress' },
    { icon: Trophy,        label: t.student.achievements,  href: '/student/achievements' },
    { icon: MessageSquare, label: t.student.aiTutor,       href: '/student/ai-tutor' },
    { icon: Calendar,      label: t.student.schedule,      href: '/student/schedule' },
  ]

  const displayName = session?.user?.name?.split(' ')[0] || 'Student'
  const closeSidebar = () => setSidebarOpen(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-outline-variant/30 shrink-0">
        <Link href="/" className="text-xl font-space-grotesk font-bold bg-gradient-primary bg-clip-text text-transparent">
          Study-ONE <span className="text-xs text-outline">Learn</span>
        </Link>
        <button
          onClick={closeSidebar}
          className="md:hidden p-1.5 rounded-lg text-outline hover:text-white hover:bg-surface-bright transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-sm font-bold'
                  : 'text-outline hover:text-white hover:bg-surface-bright/50 border border-transparent'
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

      {/* Profile Card */}
      <div className="p-4 m-4 rounded-xl glass-card border-primary/20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <InitialsAvatar name={session?.user?.name} />
            <div className="overflow-hidden min-w-0">
              <p className="font-bold text-white text-sm truncate">{session?.user?.name || 'Loading...'}</p>
              <p className="text-[10px] text-outline truncate">{session?.user?.email}</p>
            </div>
          </div>
          <Link
            href="/student/settings"
            onClick={closeSidebar}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-highest text-xs text-outline hover:text-white hover:bg-surface-bright transition-colors border border-outline-variant/30"
          >
            <Settings className="w-3 h-3" /> {t.student.manageProfile}
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-surface-dim overflow-hidden selection:bg-primary selection:text-surface-dim">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
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
        <div className="absolute top-0 left-0 w-[60%] h-[40%] bg-secondary/5 blur-[150px] pointer-events-none rounded-br-full z-0" />

        {/* Header */}
        <header className="h-16 md:h-20 flex-shrink-0 backdrop-blur-md bg-surface-dim/80 border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 relative z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-outline hover:text-white hover:bg-surface-bright transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-space-grotesk font-bold text-white">
              {pathname === '/student/dashboard'
                ? <>{t.common.welcome}, {displayName}! <span className="text-xl">⚡</span></>
                : navItems.find(item => item.href === pathname)?.label ?? t.common.dashboard
              }
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="w-px h-6 bg-outline-variant/30" />
            <Link href="/student/settings" title="Profile Settings" className="hover:opacity-80 transition-opacity">
              <InitialsAvatar name={session?.user?.name} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative z-10 no-scrollbar ${pathname === '/student/ai-tutor' ? 'p-2 md:p-4' : 'p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
