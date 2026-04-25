import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const { leaderboard, fetchLeaderboard } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const sorted = [...leaderboard].sort((a, b) => {
    const rateA = a.total_issues > 0 ? a.resolved_issues / a.total_issues : 0;
    const rateB = b.total_issues > 0 ? b.resolved_issues / b.total_issues : 0;
    return rateB - rateA || b.resolved_issues - a.resolved_issues;
  });

  const filtered = sorted.filter(mla => 
    mla.constituency.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mla.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResolved = sorted.reduce((s, m) => s + (m.resolved_issues || 0), 0);
  const totalIssues = sorted.reduce((s, m) => s + (m.total_issues || 0), 0);
  const overallResolution = totalIssues > 0 ? (totalResolved / totalIssues) * 100 : 0;
  
  // Calculate a mock "critical backlog" as the number of new issues
  const criticalBacklog = sorted.reduce((s, m) => s + ((m.total_issues || 0) - (m.resolved_issues || 0) - (m.in_progress_issues || 0)), 0);

  return (
    <div className="flex-1 p-xl max-w-container-max mx-auto w-full flex flex-col gap-xxl pb-xxl">
      {/* Page Header */}
      <div className="flex flex-col gap-sm">
        <h1 className="font-h1 text-[32px] text-on-background">Accountability Leaderboard</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Tracking resolution metrics and operational efficiency across all civic constituencies in real-time.
        </p>
      </div>

      {/* Hero Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Metric Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),_0_2px_4px_-2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Overall Resolution</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface text-sm">check_circle</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <span className="font-display text-[48px] font-bold text-on-background">{overallResolution.toFixed(1)}%</span>
            <span className="font-caption text-caption text-tertiary-fixed-dim pb-2 flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_upward</span> 2.1%
            </span>
          </div>
          {/* Decorative Sparkline */}
          <div className="w-full h-1 bg-surface-container-high rounded-full mt-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${overallResolution}%` }}></div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),_0_2px_4px_-2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Avg Response Time</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface text-sm">timer</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <span className="font-display text-[48px] font-bold text-on-background">14h</span>
            <span className="font-caption text-caption text-tertiary-fixed-dim pb-2 flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_downward</span> 3h
            </span>
          </div>
          {/* Decorative Sparkline Area */}
          <div className="w-full h-8 mt-auto flex items-end gap-1 opacity-60">
            <div className="w-1/6 h-full bg-outline-variant rounded-t-sm"></div>
            <div className="w-1/6 h-4/5 bg-outline-variant rounded-t-sm"></div>
            <div className="w-1/6 h-3/5 bg-outline-variant rounded-t-sm"></div>
            <div className="w-1/6 h-2/5 bg-outline-variant rounded-t-sm"></div>
            <div className="w-1/6 h-1/5 bg-primary rounded-t-sm"></div>
            <div className="w-1/6 h-1/6 bg-primary rounded-t-sm"></div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),_0_2px_4px_-2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Critical Backlog</span>
            <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error-container text-sm">warning</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <span className="font-display text-[48px] font-bold text-on-background">{criticalBacklog}</span>
            <span className="font-caption text-caption text-error pb-2 flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_upward</span> 12
            </span>
          </div>
          {/* Decorative Sparkline Area */}
          <div className="w-full h-8 mt-auto flex flex-col justify-center">
            <div className="w-full border-b-2 border-dashed border-error opacity-50 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-error animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-lg">
        {/* Controls */}
        <div className="flex items-center justify-between bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-[0_2px_4px_-2px_rgba(15,23,42,0.03)]">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-12 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant" 
              placeholder="Search constituencies..." 
            />
          </div>
          <div className="flex items-center gap-sm">
            <button className="flex items-center gap-xs h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg font-caption text-caption text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-xs h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg font-caption text-caption text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-sm">sort</span>
              Sort: Rank
            </button>
          </div>
        </div>

        {/* The Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),_0_2px_4px_-2px_rgba(15,23,42,0.03)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant">
                <th className="p-lg font-label-caps text-label-caps text-on-surface-variant uppercase w-24">Rank</th>
                <th className="p-lg font-label-caps text-label-caps text-on-surface-variant uppercase">Constituency</th>
                <th className="p-lg font-label-caps text-label-caps text-on-surface-variant uppercase">Representative</th>
                <th className="p-lg font-label-caps text-label-caps text-on-surface-variant uppercase w-1/3">Resolution Index</th>
                <th className="p-lg font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-xl text-center text-on-surface-variant">
                    No matching constituencies found.
                  </td>
                </tr>
              ) : (
                filtered.map((mla, index) => {
                  const rate = mla.total_issues > 0 ? (mla.resolved_issues / mla.total_issues) * 100 : 0;
                  
                  // Mock trend logic
                  let trendIcon = "trending_flat";
                  let trendColor = "text-on-surface-variant bg-surface-container";
                  if (rate > 80) {
                    trendIcon = "trending_up";
                    trendColor = "text-tertiary-fixed-dim bg-surface-container";
                  } else if (rate < 40) {
                    trendIcon = "trending_down";
                    trendColor = "text-error bg-error-container";
                  }

                  return (
                    <motion.tr 
                      key={mla.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-surface-container-high hover:bg-surface-bright transition-colors h-[72px]"
                    >
                      <td className="px-lg py-md">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                          index === 0 ? 'bg-[#F5C842] text-black' : 
                          index === 1 ? 'bg-[#C0C0C0] text-black' : 
                          index === 2 ? 'bg-[#CD7F32] text-white' : 
                          'bg-surface-container text-on-surface'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-lg py-md font-h2 text-[18px] text-on-background">
                        {mla.constituency}
                        <span className="ml-2 text-xs font-body-md text-on-surface-variant">({mla.ward})</span>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        <div className="flex items-center gap-sm">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${index === 0 ? 'bg-[#F5C842]/20 text-[#D4AF37] ring-1 ring-[#F5C842]' : 'bg-surface-container text-on-surface-variant'}`}>
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                            </div>
                            {index === 0 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#D4AF37] text-[12px] fill">verified</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface flex items-center gap-1">
                              {mla.name}
                              {rate >= 80 && <span className="text-[12px]" title="Fast Resolver">⚡</span>}
                              {(mla.resolved_issues * 50 + mla.in_progress_issues * 10) > 200 && <span className="text-[12px]" title="City Hero">🎖️</span>}
                            </span>
                            <span className="font-caption text-[11px] text-primary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">toll</span>
                              {mla.resolved_issues * 50 + mla.in_progress_issues * 10} pts
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                rate >= 70 ? 'bg-primary' : rate >= 40 ? 'bg-secondary' : 'bg-error'
                              }`} 
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <span className="font-caption text-caption text-on-surface font-semibold w-12 text-right">
                            {Math.round(rate)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-right">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${trendColor}`}>
                          <span className="material-symbols-outlined text-sm">{trendIcon}</span>
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
