'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity, Sparkles } from 'lucide-react'

interface Props {
  monthlyRevenue: { month: string; revenue: number }[]
  avgScore: number
  topStudents: { name: string; avgScore: number }[]
}

export default function AnalyticsCharts({ monthlyRevenue, avgScore, topStudents }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 h-[400px] flex flex-col">
          <h3 className="font-space-grotesk font-bold text-white text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue Growth (6M)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <Bar dataKey="revenue" fill="url(#grad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Score Visual */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 h-[400px] flex flex-col">
          <h3 className="font-space-grotesk font-bold text-white text-lg mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" /> Average Test Score
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-[16px] border-surface-lowest relative flex items-center justify-center">
              <div
                className="absolute inset-[-16px] rounded-full border-[16px] border-secondary/80 border-t-transparent border-l-transparent"
                style={{ transform: `rotate(${(avgScore / 100) * 360}deg)` }}
              />
              <div className="text-center">
                <div className="text-3xl font-space-grotesk font-bold text-white">{avgScore}%</div>
                <div className="text-[10px] text-outline font-bold uppercase tracking-wider">Avg Score</div>
                <div className="mt-3 text-xs text-slate-400 max-w-[180px]">A quick signal for how healthy your current test ecosystem looks.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className="glass-card p-6 rounded-2xl border-outline-variant/30">
        <h3 className="font-space-grotesk font-bold text-white text-lg mb-6">Top Performing Students</h3>
        {topStudents.length === 0 ? (
          <p className="text-outline text-center py-8">No test data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topStudents.map((student, i) => (
              <div key={i} className="bg-surface-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  #{i + 1}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{student.name}</div>
                  <div className="text-xs text-outline">{student.avgScore}% Avg</div>
                  <div className="text-[10px] text-slate-500 mt-1 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    performance leader
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
