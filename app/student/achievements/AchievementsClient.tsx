'use client'
import { useI18n } from '@/lib/i18n/store'
import { Trophy, Star, Sparkles, ShieldCheck, Crown } from 'lucide-react'

type Achievement = {
  id: string
  title: string
  description: string | null
  earnedAt: Date
}

export default function AchievementsClient({ achievements }: { achievements: Achievement[] }) {
  const { t } = useI18n()
  const s = t.student
  const latestAchievement = achievements[0]

  const overviewCards = [
    {
      label: s.totalEarnedLabel,
      value: achievements.length.toString(),
      detail: s.badgesUnlocked,
      icon: Trophy,
      accent: 'text-yellow-400',
    },
    {
      label: s.latestSignal,
      value: latestAchievement ? latestAchievement.title : s.noUnlockYet,
      detail: latestAchievement ? s.mostRecentMarker : s.startLearningBadge,
      icon: Sparkles,
      accent: 'text-primary',
    },
    {
      label: s.consistencyTier,
      value: achievements.length >= 8 ? s.elite : achievements.length >= 4 ? s.rising : s.starting,
      detail: s.progressStacking,
      icon: Crown,
      accent: 'text-secondary',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section className="glass-card rounded-[2rem] border border-white/10 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_35%)]" />
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-400 mb-4">{s.achievementVault}</p>
            <h1 className="text-4xl md:text-6xl font-space-grotesk font-bold text-white leading-tight">{s.achievementHeroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">{s.achievementHeroDesc}</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {s.achievementHistoryNote}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {overviewCards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                <card.icon className={`w-5 h-5 ${card.accent} mb-4`} />
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-xl font-space-grotesk font-bold text-white break-words">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400 leading-5">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {achievements.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center">
          <Star className="w-16 h-16 text-outline mx-auto mb-4 opacity-30" />
          <h3 className="font-space-grotesk font-bold text-white text-xl mb-2">{s.noAchievementsYet}</h3>
          <p className="text-outline text-sm">{s.startLearningEarn}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="glass-panel p-6 rounded-2xl border border-outline-variant text-center relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white font-space-grotesk mb-2">{achievement.title}</h3>
              <p className="text-xs text-outline">{achievement.description}</p>
              <p className="text-[10px] text-outline/60 mt-2">
                {new Date(achievement.earnedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                {achievement === achievements[0] ? s.latestUnlock : s.verifiedStep}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
