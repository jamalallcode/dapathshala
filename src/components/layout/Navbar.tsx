import React from 'react';
import { BookOpen, Bell, User, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  onLogoClick?: () => void;
  isSidebarOpen: boolean;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onMenuClick, 
  onLogoClick, 
  isSidebarOpen, 
  userName = 'অতিথি',
  userAvatar,
  onLogout
}) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-bottom border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-2 text-emerald-600 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <BookOpen size={28} strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-slate-900">দ্য পাঠশালা</span>
            <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">LIVE</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
          </button>
          
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-1.5 pr-3 py-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden border border-emerald-200">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="hidden text-sm font-bold text-slate-700 sm:block max-w-[100px] truncate">{userName}</span>
          </div>

          {onLogout && (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors group"
              title="লগআউট"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-red-600 after:transition-all group-hover:after:w-full">লগআউট</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
