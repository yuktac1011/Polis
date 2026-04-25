import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { View } from '../../App';

interface SidebarProps {
  currentView: View | any;
  onNavigate: (view: View) => void;
}

const navItems = [
  { id: 'LEADERBOARD', icon: 'dashboard', label: 'Dashboard', citizenOnly: false, mlaOnly: false },
  { id: 'MAP', icon: 'map', label: 'City Map', citizenOnly: false, mlaOnly: false },
  { id: 'KANBAN', icon: 'view_kanban', label: 'Issues', citizenOnly: false, mlaOnly: false },
  { id: 'ANALYTICS', icon: 'monitoring', label: 'Analytics', citizenOnly: false, mlaOnly: false },
  { id: 'MY_ISSUES', icon: 'person_pin', label: 'My Reports', citizenOnly: true, mlaOnly: false },
  { id: 'ARCHIVE', icon: 'inventory_2', label: 'Archive', citizenOnly: false, mlaOnly: false },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { currentUser, logout } = useStore();
  const isMLA = currentUser?.role === 'ROLE_MLA';

  const visibleItems = navItems.filter(item => {
    if (item.citizenOnly && isMLA) return false;
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] z-40 flex flex-col items-center py-5 gap-2"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(210,210,215,0.5)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center mb-4">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-[#1D1D1F] flex items-center justify-center cursor-pointer shadow-lg"
        >
          <span className="material-symbols-outlined text-white text-[18px]">account_balance</span>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-[#D2D2D7]/60 mb-2" />

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {visibleItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <div key={item.id} className="relative group">
              <motion.button
                onClick={() => onNavigate(item.id as View)}
                whileTap={{ scale: 0.92 }}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200"
                style={{
                  background: isActive ? '#1D1D1F' : 'transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-[#1D1D1F]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span
                  className="relative z-10 material-symbols-outlined text-[22px] transition-colors"
                  style={{
                    color: isActive ? '#FFFFFF' : '#6E6E73',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
              </motion.button>

              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50">
                <div className="bg-[#1D1D1F] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1D1D1F]" />
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px bg-[#D2D2D7]/60 mb-2" />

      {/* User Avatar */}
      {currentUser && (
        <div className="relative group">
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            title="Click to logout"
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-md relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {currentUser.username.charAt(0).toUpperCase()}
            {isMLA && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </motion.button>
          {/* Logout tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50">
            <div className="bg-[#1D1D1F] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              {currentUser.username} · Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1D1D1F]" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
