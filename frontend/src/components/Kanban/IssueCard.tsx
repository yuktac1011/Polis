import React from 'react';
import type { Issue } from '../../store/useStore';
import { motion } from 'framer-motion';

export const IssueCard: React.FC<{ issue: Issue, onDragStart: () => void }> = ({ issue, onDragStart }) => {
  return (
    <motion.div
      layoutId={`issue-${issue.id}`}
      draggable
      onDragStart={onDragStart}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 1, 
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
        cursor: 'grabbing'
      }}
      className="bg-apple-surface p-6 rounded-[24px] border border-apple-border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-apple-text/10 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase font-bold text-apple-secondary tracking-widest">
          {issue.category}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          issue.status === 'New' ? 'bg-apple-new' :
          issue.status === 'In Progress' ? 'bg-apple-progress' :
          'bg-apple-resolved'
        }`} />
      </div>
      
      <h4 className="text-[14pt] font-semibold tracking-tight text-apple-text leading-tight mb-2 group-hover:text-apple-new transition-colors">
        {issue.title}
      </h4>
      
      <p className="text-[11pt] text-apple-secondary line-clamp-2 mb-6 leading-normal font-normal">
        {issue.description}
      </p>
      
      <div className="flex justify-between items-center pt-4 border-t border-apple-border/50">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-apple-secondary uppercase tracking-tighter opacity-50">Reporter Hash</span>
          <span className="text-[10px] text-apple-text font-mono font-medium">{issue.reporter_hash}</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-apple-bg rounded-full border border-apple-border shadow-inner">
          <svg className="w-3 h-3 text-apple-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs font-bold tabular-nums text-apple-text">{issue.upvotes}</span>
        </div>
      </div>

      {issue.status === 'Resolved' && issue.resolution_summary && (
        <div className="mt-4 p-3 bg-apple-resolved/5 rounded-xl border border-apple-resolved/10">
          <p className="text-[9px] font-bold text-apple-resolved uppercase tracking-widest mb-1">Resolution Summary</p>
          <p className="text-[10pt] text-apple-resolved/80 italic line-clamp-2">"{issue.resolution_summary}"</p>
        </div>
      )}
    </motion.div>
  );
};
