import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Payments' }

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { TrendingUp, ArrowUpRight, CheckCircle2, Wallet, ShieldCheck, Sparkles } from 'lucide-react'
import ExportButton from './ExportButton'

export default async function InstitutePayments() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as import('@/types').SessionUser
  if (!user.instituteId) redirect('/login')

  const payments = await prisma.payment.findMany({
    where: { instituteId: user.instituteId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } } }
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const completedPayments = payments.filter(p => p.status === 'COMPLETED')
  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const monthPayments = completedPayments.filter(p => new Date(p.createdAt) >= startOfMonth)

  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const collectionRate = payments.length > 0
    ? Math.round((completedPayments.length / payments.length) * 100)
    : 0
  const overviewCards = [
    {
      label: 'This month revenue',
      value: `₹${(monthRevenue / 1000).toFixed(1)}K`,
      detail: `${monthPayments.length} completed transactions in the current month`,
      icon: TrendingUp,
      accent: 'text-emerald-400',
    },
    {
      label: 'Pending dues',
      value: `₹${(pendingAmount / 1000).toFixed(1)}K`,
      detail: `${pendingPayments.length} open payment record${pendingPayments.length === 1 ? '' : 's'} waiting to clear`,
      icon: Wallet,
      accent: 'text-orange-400',
    },
    {
      label: 'Collection rate',
      value: `${collectionRate}%`,
      detail: 'Completion ratio across visible payment records',
      icon: ShieldCheck,
      accent: 'text-primary',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-400 mb-4">Revenue Operations</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">Keep collections visible, clean, and under control.</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
              Track completed revenue, pending dues, and transaction quality from one surface designed for decision speed.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
              <Sparkles className="w-4 h-4 text-primary" />
              ₹{Math.round(totalRevenue).toLocaleString('en-IN')} total completed collections processed
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {overviewCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <card.icon className={`w-5 h-5 ${card.accent} mb-4`} />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-space-grotesk font-bold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400 leading-5">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border-emerald-500/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 blur-[40px] pointer-events-none" />
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> This Month Revenue
          </p>
          <h2 className="text-4xl font-space-grotesk font-bold text-white mb-1">₹{(monthRevenue / 1000).toFixed(1)}K</h2>
          <p className="text-xs text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {monthPayments.length} transactions</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Pending Dues</p>
          <h2 className="text-4xl font-space-grotesk font-bold text-white mb-1">₹{(pendingAmount / 1000).toFixed(1)}K</h2>
          <p className="text-xs text-orange-400">From {pendingPayments.length} payments</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 flex flex-col justify-center gap-3">
          <ExportButton />
          <a
            href="https://razorpay.me/@bhojaramchoudhary"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 rounded-xl bg-surface-lowest text-outline hover:text-white font-bold text-sm transition-all text-center"
          >
            Manage UPI & Bank
          </a>
        </div>
      </div>

        <div className="glass-card rounded-3xl border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-space-grotesk font-bold text-white text-lg">Recent Transactions</h3>
            <span className="text-xs text-outline">{payments.length} total</span>
          </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-outline">No transactions yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-lowest/50 text-xs uppercase font-bold text-outline border-b border-outline-variant/30">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {payments.map(trx => (
                <tr key={trx.id} className="border-b border-outline-variant/10 hover:bg-surface-highest/20 transition-colors">
                  <td className="p-4 text-xs font-mono text-outline-variant">{trx.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-bold text-white">{trx.user.name}</td>
                  <td className="p-4 text-outline">{trx.description || trx.method || '—'}</td>
                  <td className="p-4 text-outline text-xs">{new Date(trx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4 font-space-grotesk font-bold text-white">₹{trx.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    {trx.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : trx.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {trx.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
