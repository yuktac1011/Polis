import React, { useState } from 'react';
import { useStore, type Issue } from '../../store/useStore';
import { IssueCard } from './IssueCard';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS: { id: string; label: string; color: string; border: string; bg: string }[] = [
  { id: 'New', label: 'Pending Review', color: 'bg-secondary', border: 'border-l-secondary', bg: 'bg-surface-container-lowest' },
  { id: 'In Progress', label: 'Active Resolution', color: 'bg-tertiary-fixed-dim', border: 'border-l-tertiary-fixed-dim', bg: 'bg-surface-container-lowest' },
  { id: 'Resolved', label: 'Resolved', color: 'bg-outline', border: 'border-l-outline', bg: 'bg-surface-container-lowest opacity-75 hover:opacity-100' },
];

export const KanbanBoard: React.FC = () => {
  const { issues, currentUser, updateIssueStatus, upvoteIssue } = useStore();
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<Issue | null>(null);
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMLA = currentUser?.role === 'ROLE_MLA';
  const { selectedConstituency } = useStore();
  
  // MLAs see their own ward; Citizens see selected ward on map, or all if none selected
  const displayIssues = isMLA 
    ? issues.filter((i) => i.constituency_id === currentUser.mla_id)
    : selectedConstituency 
      ? issues.filter(i => i.constituency_id === selectedConstituency)
      : issues;

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.setData('text/plain', issue.id.toString());
  };
  
  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    if (isMLA) setDragOverCol(col);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (status: string) => {
    setDragOverCol(null);
    if (!isMLA || !draggedIssue || draggedIssue.status === status) { 
      setDraggedIssue(null); 
      return; 
    }
    
    if (status === 'Resolved') {
      setResolutionTarget(draggedIssue);
    } else {
      await updateIssueStatus(draggedIssue.id, status);
    }
    setDraggedIssue(null);
  };

  const submitResolution = async () => {
    if (!resolutionTarget || !summary.trim()) return;
    setSubmitting(true);
    await updateIssueStatus(resolutionTarget.id, 'Resolved', summary);
    setResolutionTarget(null);
    setSummary('');
    setSubmitting(false);
  };

  return (
    <div className="flex-1 p-xl w-full h-full overflow-x-auto flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-lg flex-shrink-0">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Active Interventions</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Tracking reported civic infrastructure issues and resolutions.</p>
        </div>
        {isMLA && (
          <button className="flex items-center gap-sm h-12 px-lg bg-primary text-on-primary font-caption text-caption rounded-xl hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Ticket
          </button>
        )}
      </div>

      {/* Kanban Columns Container */}
      <div className="flex gap-lg h-full items-start pb-xl overflow-y-hidden">
        {COLUMNS.map((col) => {
          const colIssues = displayIssues.filter((i) => i.status === col.id);
          const isDragTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className={`flex-1 min-w-[320px] max-w-[400px] h-full flex flex-col gap-md bg-surface-container-low/60 backdrop-blur-md rounded-xl p-md border border-outline-variant/50 transition-all duration-200 ${isDragTarget ? 'scale-[1.01] border-primary' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between px-xs pb-sm">
                <div className="flex items-center gap-sm">
                  <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                  <h3 className="font-caption text-caption text-on-surface uppercase tracking-wider">{col.label}</h3>
                </div>
                <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full font-label-caps text-label-caps">{colIssues.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto pb-10 pr-1" style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence>
                  {colIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      col={col}
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onUpvote={() => upvoteIssue(issue.id)}
                      isDraggable={isMLA}
                    />
                  ))}
                </AnimatePresence>

                {colIssues.length === 0 && (
                  <div className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                    isDragTarget ? 'border-primary bg-primary/5' : 'border-outline-variant'
                  }`}>
                    <p className="font-label-caps text-label-caps uppercase text-on-surface-variant/60">
                      {isDragTarget ? 'Drop here' : 'No issues'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolutionTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-scrim/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolutionTarget(null)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-bright rounded-2xl p-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex flex-col gap-md"
            >
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined fill">check_circle</span>
                </div>
                <h2 className="font-h2 text-[20px] text-on-surface">Resolution Ledger</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Provide a mandatory summary of work completed before closing this issue.</p>

              <div className="p-md bg-surface rounded-xl border border-outline-variant/50">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">Closing Issue</p>
                <p className="font-body-lg text-body-lg text-on-surface font-semibold">{resolutionTarget.title}</p>
                <p className="font-caption text-caption text-on-surface-variant">{resolutionTarget.category}</p>
              </div>

              <textarea
                autoFocus required value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
                className="w-full bg-surface border border-outline-variant rounded-xl p-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-1 focus:border-primary transition-colors resize-none shadow-sm"
                placeholder="What was done? E.g., 'Pothole filled by PWD crew on 25th April. Work order #2341.'"
              />

              <div className="flex gap-md pt-xs">
                <button
                  onClick={() => setResolutionTarget(null)}
                  className="flex-1 font-caption text-caption text-on-surface-variant hover:text-on-surface px-lg py-3 rounded-lg border border-transparent hover:border-outline-variant transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResolution}
                  disabled={!summary.trim() || submitting}
                  className="flex-[2] font-caption text-caption text-on-primary bg-primary px-lg py-3 rounded-lg hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-x-2 disabled:opacity-50"
                >
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                    : 'Mark as Resolved'
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
