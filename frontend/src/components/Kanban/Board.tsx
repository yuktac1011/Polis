import React, { useState } from 'react';
import { useStore, type Issue } from '../../store/useStore';
import { IssueCard } from './IssueCard';
import { motion, AnimatePresence } from 'framer-motion';

const columns = ['New', 'In Progress', 'Resolved'];

export const KanbanBoard: React.FC = () => {
  const { issues, currentUser, updateIssueStatus } = useStore();
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<Issue | null>(null);
  const [summary, setSummary] = useState('');
  
  if (currentUser?.role !== 'ROLE_MLA') return (
    <div className="w-full h-full flex items-center justify-center bg-apple-bg text-apple-secondary">
      <p className="text-lg font-medium">Access Restricted: MLA Credentials Required</p>
    </div>
  );

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!draggedIssue) return;

    if (status === 'Resolved') {
      setResolutionTarget(draggedIssue);
    } else {
      await updateIssueStatus(draggedIssue.id, status);
    }
    setDraggedIssue(null);
  };

  const submitResolution = async () => {
    if (resolutionTarget && summary) {
      await updateIssueStatus(resolutionTarget.id, 'Resolved', summary);
      setResolutionTarget(null);
      setSummary('');
    }
  };

  const mlaIssues = issues.filter(i => i.constituency_id === currentUser?.mla_id);

  return (
    <div className="flex h-full gap-8 p-10 bg-apple-bg overflow-x-auto relative">
      {columns.map(col => (
        <div 
          key={col} 
          className="flex-1 min-w-[340px] max-w-[400px] flex flex-col group"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(col)}
        >
          <div className="flex justify-between items-baseline mb-6 px-2">
            <h3 className="text-2xl font-semibold tracking-tight text-apple-text">{col}</h3>
            <span className="text-sm font-bold text-apple-secondary/50 tabular-nums">
              {mlaIssues.filter(i => i.status === col).length}
            </span>
          </div>
          
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto pb-10 scrollbar-hide">
            {mlaIssues.filter(i => i.status === col).map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onDragStart={() => handleDragStart(issue)} 
              />
            ))}
            
            {/* Drop Zone Placeholder */}
            <div className="h-24 rounded-2xl border-2 border-dashed border-apple-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-apple-secondary text-xs font-bold uppercase tracking-widest">
              Drop here to move
            </div>
          </div>
        </div>
      ))}

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolutionTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolutionTarget(null)}
              className="absolute inset-0 bg-apple-text/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-apple-surface rounded-[32px] p-10 shadow-2xl border border-white/20"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-apple-text mb-2">Resolution Ledger</h2>
              <p className="text-[11pt] text-apple-secondary mb-8">Please provide a mandatory summary of the work completed to close this issue.</p>
              
              <div className="p-4 bg-apple-bg rounded-2xl border border-apple-border mb-6">
                <p className="text-[10pt] font-bold text-apple-secondary uppercase tracking-widest mb-1">Closing Issue</p>
                <p className="text-sm font-medium text-apple-text line-clamp-1">{resolutionTarget.title}</p>
              </div>

              <textarea 
                autoFocus
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={5}
                className="w-full p-4 bg-apple-bg border border-apple-border rounded-2xl text-sm focus:outline-none focus:border-apple-text transition-all resize-none mb-8"
                placeholder="What actions were taken? (e.g., Pothole filled by PWD team on 25th April)"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setResolutionTarget(null)}
                  className="flex-1 py-4 bg-apple-bg text-apple-text rounded-2xl font-semibold hover:bg-apple-border transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitResolution}
                  disabled={!summary}
                  className="flex-1 py-4 bg-apple-text text-apple-surface rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  Confirm Closure
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
