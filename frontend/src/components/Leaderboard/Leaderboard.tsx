import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const { leaderboard, fetchLeaderboard } = useStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const sortedBoard = [...leaderboard].sort((a, b) => {
    const rateA = a.total_issues ? (a.resolved_issues / a.total_issues) : 0;
    const rateB = b.total_issues ? (b.resolved_issues / b.total_issues) : 0;
    return rateB - rateA;
  });

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="h-full bg-apple-surface border-l border-apple-border p-8 flex flex-col overflow-hidden">
      <div className="mb-10">
        <h2 className="text-[28pt] font-semibold tracking-tight text-apple-text leading-tight">Civic Efficiency</h2>
        <p className="text-[11pt] text-apple-secondary mt-1">Ranking MLAs by resolution velocity.</p>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10 scrollbar-hide">
        {sortedBoard.map((mla, index) => {
          const rate = mla.total_issues ? (mla.resolved_issues / mla.total_issues) * 100 : 0;
          const offset = circumference - (rate / 100) * circumference;
          const isTop = index === 0;

          return (
            <motion.div 
              key={mla.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
              className={`group relative p-6 rounded-[28px] border transition-all duration-500 ${
                isTop 
                ? 'border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/5 to-transparent shadow-[0_10px_30px_-10px_rgba(255,215,0,0.1)]' 
                : 'border-apple-border bg-apple-bg/50 hover:bg-apple-bg hover:border-apple-text/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    isTop ? 'bg-[#FFD700] text-black' : 'bg-apple-border text-apple-secondary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-[14pt] font-semibold text-apple-text group-hover:text-apple-new transition-colors">{mla.name}</h4>
                    <p className="text-[10pt] text-apple-secondary font-medium uppercase tracking-widest">{mla.constituency}</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle 
                      cx="32" cy="32" r={radius} 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      className="text-apple-border/30" 
                    />
                    <motion.circle 
                      cx="32" cy="32" r={radius} 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className={rate > 70 ? 'text-apple-resolved' : rate > 40 ? 'text-apple-progress' : 'text-apple-new'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10pt] font-bold tabular-nums text-apple-text">
                      {Math.round(rate)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <div className="flex-1 px-3 py-2 bg-apple-surface/50 rounded-xl border border-apple-border/50">
                  <span className="block text-[8pt] font-bold text-apple-secondary uppercase tracking-tighter">Total Issues</span>
                  <span className="text-sm font-semibold text-apple-text tabular-nums">{mla.total_issues}</span>
                </div>
                <div className="flex-1 px-3 py-2 bg-apple-surface/50 rounded-xl border border-apple-border/50">
                  <span className="block text-[8pt] font-bold text-apple-secondary uppercase tracking-tighter">Resolved</span>
                  <span className="text-sm font-semibold text-apple-resolved tabular-nums">{mla.resolved_issues}</span>
                </div>
              </div>

              {isTop && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <span className="text-[10px]">👑</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto p-6 bg-apple-text text-apple-surface rounded-[24px] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold tracking-tight mb-1">Weekly Pulse</h3>
          <p className="text-sm opacity-60">Civic resolution efficiency is up 12% across all wards this week.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-1000" />
      </div>
    </div>
  );
};
