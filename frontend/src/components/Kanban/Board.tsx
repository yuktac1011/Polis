import React, { useState } from 'react';
import { useStore, type Issue } from '../../store/useStore';
import { IssueCard } from './IssueCard';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { id: 'New', label: 'Pending Review', dot: '#6E6E73', accentBg: 'rgba(110,110,115,0.06)' },
  { id: 'In Progress', label: 'Active Resolution', dot: '#F59E0B', accentBg: 'rgba(245,158,11,0.06)' },
  { id: 'Resolved', label: 'Resolved', dot: '#10B981', accentBg: 'rgba(16,185,129,0.06)' },
];

export const KanbanBoard: React.FC = () => {
  const { issues, currentUser, updateIssueStatus, upvoteIssue, batchUpdateIssues, groupIssues, selectedConstituency, createIssue } = useStore();
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<Issue | null>(null);
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ title: '', description: '', category: 'INFRASTRUCTURE' });

  const isMLA = currentUser?.role === 'ROLE_MLA';
  
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

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBatchAction = async (status: string) => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    await batchUpdateIssues(selectedIds, status);
    setSelectedIds([]);
    setSubmitting(false);
  };

  const handleGroup = async () => {
    if (selectedIds.length < 2) return;
    setSubmitting(true);
    const [primary, ...others] = selectedIds;
    await groupIssues(primary, others);
    setSelectedIds([]);
    setSubmitting(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await createIssue({
      ...newTicketData,
      constituency_id: currentUser?.mla_id || '',
      x_coord: 19.07,
      y_coord: 72.87,
    });
    if (success) {
      setShowNewTicket(false);
      setNewTicketData({ title: '', description: '', category: 'INFRASTRUCTURE' });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex-1 p-8 w-full h-full overflow-x-auto flex flex-col" style={{ background: '#F5F5F7' }}>
      {/* Board Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Active Interventions</h2>
          <p className="text-sm text-[#6E6E73] mt-1">Drag cards between columns to update status. Issues auto-sync in real-time.</p>
        </div>
        {isMLA && (
          <motion.button 
            onClick={() => setShowNewTicket(true)}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 h-11 px-6 bg-[#1D1D1F] text-white text-sm font-bold rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Ticket
          </motion.button>
        )}
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-lg bg-surface-container-highest px-xl py-md rounded-2xl border border-primary/20 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-md pr-lg border-r border-outline-variant/30">
              <span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">{selectedIds.length}</span>
              <p className="font-body-md font-semibold text-on-surface">Issues Selected</p>
            </div>
            
            <div className="flex items-center gap-md">
              <button onClick={() => handleBatchAction('In Progress')} className="flex items-center gap-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px]">history</span>
                Start Resolution
              </button>
              <button onClick={() => handleBatchAction('Resolved')} className="flex items-center gap-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Batch Resolve
              </button>
              <button onClick={handleGroup} disabled={selectedIds.length < 2} className="flex items-center gap-sm px-4 py-2 hover:bg-surface-variant rounded-lg transition-colors text-sm font-bold text-on-surface disabled:opacity-30">
                <span className="material-symbols-outlined text-[20px]">layers</span>
                Group/Merge
              </button>
              <button onClick={() => setSelectedIds([])} className="flex items-center gap-sm px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors text-sm font-bold">
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-5 h-full items-start pb-8 overflow-y-hidden">
        {COLUMNS.map((col) => {
          const colIssues = displayIssues.filter((i) => i.status === col.id);
          const isDragTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[300px] max-w-[420px] h-full flex flex-col rounded-3xl overflow-hidden transition-all duration-200"
              style={{
                background: isDragTarget ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                border: isDragTarget ? '1.5px solid #1D1D1F' : '1px solid rgba(210,210,215,0.5)',
                boxShadow: isDragTarget ? '0 0 0 4px rgba(29,29,31,0.05)' : '0 2px 12px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(12px)',
                transform: isDragTarget ? 'scale(1.01)' : 'scale(1)',
              }}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ background: col.accentBg, borderBottom: '1px solid rgba(210,210,215,0.4)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                  <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-widest">{col.label}</h3>
                </div>
                <span className="text-xs font-bold text-[#6E6E73] bg-white/60 px-2.5 py-0.5 rounded-full border border-[#D2D2D7]/50">{colIssues.length}</span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3 pb-10" style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence>
                  {colIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      col={col as any}
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onUpvote={() => upvoteIssue(issue.id)}
                      isDraggable={isMLA}
                      isSelected={selectedIds.includes(issue.id)}
                      onSelect={toggleSelection}
                    />
                  ))}
                </AnimatePresence>

                {colIssues.length === 0 && (
                  <motion.div
                    animate={isDragTarget ? { borderColor: '#1D1D1F', backgroundColor: 'rgba(29,29,31,0.02)' } : {}}
                    className="h-24 rounded-2xl border-2 border-dashed border-[#D2D2D7] flex items-center justify-center transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                      {isDragTarget ? '↓ Drop here' : 'No issues'}
                    </p>
                  </motion.div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResolutionTarget(null)} className="absolute inset-0" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-bright rounded-2xl p-lg shadow-2xl border border-outline-variant/30 flex flex-col gap-md"
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
                autoFocus required value={summary} onChange={(e) => setSummary(e.target.value)} rows={5}
                className="w-full bg-surface border border-outline-variant rounded-xl p-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-1 focus:border-primary transition-colors resize-none shadow-sm"
                placeholder="What was done? E.g., 'Pothole filled by PWD crew on 25th April. Work order #2341.'"
              />
              <div className="flex gap-md pt-xs">
                <button onClick={() => setResolutionTarget(null)} className="flex-1 font-caption text-caption text-on-surface-variant hover:text-on-surface px-lg py-3 rounded-lg border border-transparent hover:border-outline-variant transition-all">Cancel</button>
                <button onClick={submitResolution} disabled={!summary.trim() || submitting} className="flex-[2] font-caption text-caption text-on-primary bg-primary px-lg py-3 rounded-lg hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-x-2 disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" /> : 'Mark as Resolved'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-scrim/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewTicket(false)} className="absolute inset-0" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface-bright rounded-2xl p-lg shadow-2xl border border-outline-variant/30 flex flex-col gap-md"
            >
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add_task</span>
                </div>
                <h2 className="font-h2 text-[20px] text-on-surface">Manually Log Issue</h2>
              </div>
              <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Title</label>
                  <input required value={newTicketData.title} onChange={e => setNewTicketData({...newTicketData, title: e.target.value})} className="bg-surface border border-outline-variant rounded-xl p-3 outline-none focus:border-primary transition-all" placeholder="Brief summary..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Category</label>
                  <select value={newTicketData.category} onChange={e => setNewTicketData({...newTicketData, category: e.target.value})} className="bg-surface border border-outline-variant rounded-xl p-3 outline-none focus:border-primary transition-all">
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="SANITATION">Sanitation</option>
                    <option value="SAFETY">Safety</option>
                    <option value="GREENERY">Greenery</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Detailed Description</label>
                  <textarea required value={newTicketData.description} onChange={e => setNewTicketData({...newTicketData, description: e.target.value})} className="bg-surface border border-outline-variant rounded-xl p-3 outline-none focus:border-primary transition-all h-24 resize-none" placeholder="Specific location or details..." />
                </div>
                <div className="flex gap-md pt-xs">
                  <button type="button" onClick={() => setShowNewTicket(false)} className="flex-1 font-caption text-caption text-on-surface-variant hover:text-on-surface px-lg py-3 rounded-lg border border-transparent hover:border-outline-variant transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-[2] font-caption text-caption text-on-primary bg-primary px-lg py-3 rounded-lg hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-x-2 disabled:opacity-50">
                    {submitting ? 'Logging...' : 'Log Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
