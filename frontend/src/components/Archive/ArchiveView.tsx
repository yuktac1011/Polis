import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export const ArchiveView = () => {
  const { issues } = useStore();
  const resolvedIssues = issues.filter(i => i.status === 'Resolved');

  return (
    <div className="p-xl max-w-container-max mx-auto w-full flex flex-col gap-xxl pb-xxl animate-in fade-in duration-700">
      <div className="flex flex-col gap-sm">
        <h1 className="font-h1 text-[32px] text-on-background">Project Archive</h1>
        <p className="font-body-lg text-apple-secondary max-w-2xl">
          A verifiable ledger of completed infrastructure projects and successful civic interventions.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {resolvedIssues.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-apple-border rounded-3xl opacity-50">
            <span className="material-symbols-outlined text-[48px] mb-4">inventory_2</span>
            <p className="font-semibold">No resolved projects in current ledger.</p>
          </div>
        ) : (
          resolvedIssues.map((issue, idx) => (
            <motion.div 
              key={issue.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-apple-border rounded-2xl p-6 flex items-center gap-6 group hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-apple-resolved/10 flex items-center justify-center text-apple-resolved shrink-0">
                <span className="material-symbols-outlined fill">check_circle</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-widest">{issue.category}</span>
                  <span className="w-1 h-1 rounded-full bg-apple-border"></span>
                  <span className="text-[10px] font-mono text-apple-secondary">POLIS-ID: {issue.id}</span>
                </div>
                <h3 className="text-lg font-bold text-apple-text">{issue.title}</h3>
                <p className="text-sm text-apple-secondary line-clamp-1">{issue.description}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-apple-text uppercase">RESOLVED</p>
                <p className="text-[11px] text-apple-secondary">{new Date(issue.created_at).toLocaleDateString()}</p>
              </div>

              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-apple-bg text-apple-secondary group-hover:bg-apple-new group-hover:text-white transition-all">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
