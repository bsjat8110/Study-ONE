'use client';
import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500">Loading Leaderboard...</div>;

  return (
    <div className="glass-card p-6 rounded-[1.75rem] border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-space-grotesk font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real-time global rankings</p>
        </div>
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
           <p className="text-sm text-slate-500 text-center py-8">Be the first to climb the ranks!</p>
        ) : (
          data.map((entry, idx) => {
            const isTop3 = idx < 3;
            const rankIcons = [
              <Medal key="1" className="w-5 h-5 text-yellow-400" />,
              <Medal key="2" className="w-5 h-5 text-slate-300" />,
              <Medal key="3" className="w-5 h-5 text-orange-400" />,
            ];

            return (
              <div 
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isTop3 
                    ? 'bg-primary/5 border-primary/20 shadow-glow-sm' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center font-bold text-lg text-slate-500">
                    {isTop3 ? rankIcons[idx] : idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{entry.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{entry.points.toLocaleString()} points</p>
                  </div>
                </div>
                {isTop3 && (
                  <div className="px-2 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                    PRO
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
