import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const ArchiveView = () => {
  const { issues, projects, fetchProjects, createProject, currentUser } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', budget: '' });

  const isMLA = currentUser?.role === 'ROLE_MLA';
  const resolvedIssues = issues.filter(i => i.status === 'Resolved');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.mla_id) return;
    const success = await createProject({
      ...newProject,
      mla_id: currentUser.mla_id,
      status: 'Planning'
    });
    if (success) {
      setShowCreate(false);
      setNewProject({ title: '', description: '', budget: '' });
    }
  };

  return (
    <div className="p-xl max-w-container-max mx-auto w-full flex flex-col gap-xxl pb-xxl animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-sm">
          <h1 className="font-h1 text-[32px] text-on-background">Civic Infrastructure Ledger</h1>
          <p className="font-body-lg text-apple-secondary max-w-2xl">
            A verifiable ledger of large-scale projects and completed civic interventions.
          </p>
        </div>
        {isMLA && (
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-apple-new text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">add</span>
            New Project
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-apple-border rounded-3xl p-xl shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6">Initialize New Project</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-apple-secondary uppercase tracking-widest">Project Title</label>
                <input 
                  required
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                  className="bg-apple-bg border border-apple-border rounded-xl p-4 outline-none focus:border-apple-new transition-all"
                  placeholder="e.g. Ward-7 Sanitation Drive"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-apple-secondary uppercase tracking-widest">Estimated Budget</label>
                <input 
                  value={newProject.budget}
                  onChange={e => setNewProject({...newProject, budget: e.target.value})}
                  className="bg-apple-bg border border-apple-border rounded-xl p-4 outline-none focus:border-apple-new transition-all"
                  placeholder="e.g. ₹50 Lakhs"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-apple-secondary uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="bg-apple-bg border border-apple-border rounded-xl p-4 outline-none focus:border-apple-new transition-all h-32 resize-none"
                  placeholder="Detail the scope of work and intended outcome..."
                />
              </div>
              <div className="flex items-center gap-4 md:col-span-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 font-bold text-apple-secondary">Cancel</button>
                <button type="submit" className="bg-apple-text text-white px-8 py-3 rounded-xl font-bold">Create Project</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <h2 className="text-sm font-bold text-apple-secondary uppercase tracking-widest mb-6">Active & Planned Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="md:col-span-2 py-12 flex flex-col items-center justify-center border-2 border-dashed border-apple-border rounded-3xl opacity-50 italic">
              No managed projects found.
            </div>
          ) : (
            projects.map((project) => (
              <motion.div 
                key={project.id}
                layout
                className="bg-white border border-apple-border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col gap-6"
              >
                <div className="flex items-start justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    project.status === 'Completed' ? 'bg-apple-resolved/10 text-apple-resolved' : 
                    project.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {project.status}
                  </div>
                  <span className="font-mono text-[10px] text-apple-secondary">PROJ-{project.id}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-apple-text mb-2">{project.title}</h3>
                  <p className="text-sm text-apple-secondary leading-relaxed line-clamp-3">{project.description}</p>
                </div>
                <div className="mt-auto pt-6 border-t border-apple-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-apple-secondary uppercase mb-1">Budget Allocation</p>
                    <p className="text-sm font-bold text-apple-text">{project.budget || 'Pending'}</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-apple-bg flex items-center justify-center text-apple-secondary hover:bg-apple-text hover:text-white transition-all">
                    <span className="material-symbols-outlined">analytics</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-apple-secondary uppercase tracking-widest mb-6">Historical Resolutions (Direct Action)</h2>
        <div className="flex flex-col gap-4">
          {resolvedIssues.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-apple-border rounded-3xl opacity-50">
              <span className="material-symbols-outlined text-[48px] mb-4">inventory_2</span>
              <p className="font-semibold">No direct resolutions in current ledger.</p>
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
      </section>
    </div>
  );
};
