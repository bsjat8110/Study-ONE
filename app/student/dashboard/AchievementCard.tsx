'use client';
import { Award, Star, Zap, Shield } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
}

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarities: Record<string, { color: string, bg: string, border: string, glow: string }> = {
    COMMON: { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: '' },
    RARE: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'shadow-glow-sm' },
    EPIC: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
    LEGENDARY: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]' },
  };

  const style = rarities[achievement.rarity] || rarities.COMMON;

  return (
    <div className={`p-4 rounded-2xl border ${style.bg} ${style.border} ${style.glow} group hover:scale-[1.02] transition-all`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${style.bg}`}>
          {achievement.icon}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${style.color}`}>{achievement.title}</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{achievement.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
         <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>
           {achievement.rarity}
         </span>
         <Award className={`w-3 h-3 ${style.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </div>
  );
}
