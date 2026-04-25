import type { Issue } from '../../store/useStore';
import { motion } from 'framer-motion';

interface IssueCardProps {
  issue: Issue;
  col: { color: string; border: string; bg: string };
  onDragStart: () => void;
  onUpvote?: () => void;
  currentUserHash?: string;
}



// Generate a pseudo-ID like INF-204 based on issue.id and category
const getTicketId = (issue: Issue) => {
  const prefix = issue.category.substring(0, 3).toUpperCase();
  const num = issue.id % 1000;
  return `${prefix}-${num.toString().padStart(3, '0')}`;
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, col, onDragStart, onUpvote }) => {
  const isResolved = issue.status === 'Resolved';

  return (
    <motion.div
      layout
      layoutId={`issue-${issue.id}`}
      draggable
      onDragStart={onDragStart}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.04, rotate: 1.5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', cursor: 'grabbing' }}
      className={`rounded-xl border border-outline-variant border-l-[4px] p-md shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),0_2px_4px_-2px_rgba(15,23,42,0.03)] transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden ${col.border} ${col.bg}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-sm">
        <div className="flex items-center gap-xs text-outline opacity-0 group-hover:opacity-100 transition-opacity absolute top-md right-md">
          <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
        </div>
        <span className={`font-label-caps text-label-caps px-2 py-1 rounded-md ${
          isResolved ? 'text-on-surface-variant bg-surface-container line-through' :
          issue.status === 'In Progress' ? 'text-on-tertiary-container bg-tertiary-fixed/20' :
          'text-on-surface-variant bg-surface-container'
        }`}>
          {getTicketId(issue)}
        </span>
      </div>

      {/* Title */}
      <h4 className={`font-body-lg text-body-lg text-on-surface mb-xs pr-6 ${isResolved ? 'line-through text-outline' : ''}`}>
        {issue.title}
      </h4>

      {/* Description */}
      <p className="font-caption text-caption text-on-surface-variant line-clamp-2 mb-md">
        {issue.description}
      </p>

      {/* Resolution summary */}
      {isResolved && issue.resolution_summary && (
        <div className="mb-md">
          <p className="font-caption text-caption text-on-surface-variant line-clamp-2 italic">
            "{issue.resolution_summary}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-sm mt-auto">
        <div className="flex -space-x-2">
          {/* Mock Assignee Avatar */}
          <div className="w-7 h-7 rounded-full bg-surface-container border-2 border-surface-container-lowest flex items-center justify-center text-xs font-bold text-on-surface">
            {issue.reporter_hash.substring(0, 1).toUpperCase()}
          </div>
        </div>
        
        {isResolved ? (
          <div className="flex items-center gap-xs text-outline font-caption text-caption">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Closed</span>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onUpvote?.(); }}
            className={`flex items-center gap-xs font-caption text-caption hover:opacity-80 transition-opacity ${
              issue.status === 'In Progress' ? 'text-on-surface-variant' : 'text-on-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${
              issue.status === 'In Progress' ? 'text-tertiary-fixed' : 'text-tertiary-fixed'
            }`}>thumb_up</span>
            <span className="text-on-surface font-semibold">{issue.upvotes}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
