import { useStore } from '../../store/useStore';
import type { View } from '../../App';

interface SidebarProps {
  currentView: View | any;
  onNavigate: (view: View) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { currentUser } = useStore();
  const isMLA = currentUser?.role === 'ROLE_MLA';
  // We'll map the UI design links to our functional views
  const navItems = [
    {
      id: 'LEADERBOARD',
      label: 'Dashboard',
      icon: 'dashboard',
      show: true,
    },
    {
      id: 'ANALYTICS',
      label: 'Analytics',
      icon: 'monitoring',
      show: true,
    },
    {
      id: 'KANBAN',
      label: isMLA ? 'Manage Issues' : 'Civic Issues',
      icon: 'report_problem',
      show: true,
    },
    {
      id: 'MY_ISSUES',
      label: 'My Contributions',
      icon: 'person',
      show: !isMLA,
    },
    {
      id: 'MAP',
      label: 'Department Map',
      icon: 'map',
      show: true,
    },
    {
      id: 'ARCHIVE',
      label: 'Project Archive',
      icon: 'inventory_2',
      show: true,
    },
  ];

  return (
    <aside className="h-screen w-64 border-r fixed left-0 top-0 z-40 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-['Public_Sans'] text-sm font-medium text-slate-900 dark:text-slate-50 flex flex-col p-6 gap-y-8">
      {/* Header */}
      <div className="flex items-center gap-md">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">account_balance</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-slate-50 leading-tight">Project Polis</h1>
          <p className="font-caption text-caption text-on-surface-variant">Civic Infrastructure</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-xs">
        {navItems.filter((i) => i.show).map((item) => {
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className={`flex items-center gap-sm px-3 py-2 rounded-lg transition-all duration-200 active:translate-x-1 ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
