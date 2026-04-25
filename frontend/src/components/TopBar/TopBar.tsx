
import { useStore } from '../../store/useStore';

interface TopBarProps {
  onLiveToggle: () => void;
  isLiveMode: boolean;
}

export function TopBar({ onLiveToggle, isLiveMode }: TopBarProps) {
  const { currentUser, logout } = useStore();
  if (!currentUser) return null;

  const isMLA = currentUser.role === 'ROLE_MLA';

  return (
    <header className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 text-slate-900 dark:text-slate-50 font-['Public_Sans'] antialiased docked full-width top-0 sticky z-50 border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between px-8 h-16 w-full max-w-container-max mx-auto">
        {/* Brand / Left Side */}
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">CivicPulse</h1>
            {isLiveMode && (
              <span className="text-[10px] font-mono text-error border border-error/30 bg-error/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                LIVE
              </span>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative hidden lg:block w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Search data..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-50 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-md">
          {/* Live Pulse Toggle (Adding it here for functionality) */}
          <button
            onClick={onLiveToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
              isLiveMode 
                ? 'bg-error/10 text-error border-error/30' 
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-variant'
            }`}
          >
            {isLiveMode ? 'Pulse Active' : 'Start Pulse'}
          </button>

          {/* Trailing Icons */}
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-all active:scale-95 duration-200 ease-in-out relative">
            <span className="material-symbols-outlined">notifications</span>
            {isMLA && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>}
          </button>
          
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-all active:scale-95 duration-200 ease-in-out">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-xs"></div>
          
          {/* Profile */}
          <div 
            onClick={logout}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 ring-slate-900 dark:ring-slate-50 transition-all bg-primary flex items-center justify-center text-on-primary font-bold text-xs"
            title="Click to logout"
          >
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
