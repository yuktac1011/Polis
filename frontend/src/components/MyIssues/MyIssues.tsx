
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export function MyIssues() {
  const { issues, currentUser, reopenIssue } = useStore();
  
  if (!currentUser) return null;

  const myIssues = issues.filter(i => i.reporter_hash === currentUser.citizenHash);

  return (
    <div className="p-xl max-w-4xl mx-auto">
      <header className="mb-lg">
        <h1 className="text-display font-display text-on-surface">My Contributions</h1>
        <p className="text-on-surface-variant">Track and manage the issues you've reported to the city.</p>
      </header>

      <div className="grid gap-md">
        {myIssues.length === 0 ? (
          <div className="p-xl border-2 border-dashed border-outline-variant rounded-2xl text-center text-on-surface-variant">
            You haven't reported any issues yet. Use the map to drop a pin!
          </div>
        ) : (
          myIssues.map(issue => (
            <motion.div 
              key={issue.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    issue.status === 'Resolved' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 
                    issue.status === 'In Progress' ? 'bg-primary-fixed text-on-primary-fixed' : 
                    'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">#{issue.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface">{issue.title}</h3>
                <p className="text-sm text-on-surface-variant">{issue.category} • Reported on {new Date(issue.created_at).toLocaleDateString()}</p>
                {issue.resolution_summary && (
                  <div className="mt-2 p-2 bg-surface-container rounded-lg text-xs italic text-on-surface-variant border-l-2 border-tertiary">
                    " {issue.resolution_summary} "
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {issue.status === 'Resolved' && (
                  <button 
                    onClick={() => reopenIssue(issue.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-xl text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    Not Fixed? Reopen
                  </button>
                )}
                <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
