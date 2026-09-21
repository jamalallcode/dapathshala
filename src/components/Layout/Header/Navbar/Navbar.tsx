import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Menu, 
  ShieldCheck, 
  LogOut, 
  FileText, 
  GraduationCap,
  PanelLeft
} from 'lucide-react';
import { checkIsAdmin, logoutAdminSession } from '../../../../utils/adminAuth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  highlight?: boolean;
  badge?: string;
  isAdminItem?: boolean;
}

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  sidebarPosition?: 'left' | 'right';
  onTogglePosition?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleCollapse,
  sidebarPosition = 'left',
  onTogglePosition
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateAuthStatus = () => {
      setIsAdmin(checkIsAdmin());
      try {
        const u = localStorage.getItem('ep_user') || localStorage.getItem('user');
        if (u) setCurrentUser(JSON.parse(u));
        else setCurrentUser(null);
      } catch (e) {
        setCurrentUser(null);
      }
    };

    updateAuthStatus();
    window.addEventListener('auth_state_changed', updateAuthStatus);
    window.addEventListener('storage', updateAuthStatus);

    return () => {
      window.removeEventListener('auth_state_changed', updateAuthStatus);
      window.removeEventListener('storage', updateAuthStatus);
    };
  }, []);

  const handleUserLogout = () => {
    try {
      localStorage.removeItem('ep_user');
      localStorage.removeItem('user');
    } catch (e) {}
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth_state_changed'));
    navigate('/');
  };

  const baseNavItems: NavItem[] = [
    { 
      name: 'পেপার মেকার', 
      path: '/paper-builder',
      icon: <FileText size={16} className="text-primary" />,
      highlight: true
    },
    { 
      name: 'পরীক্ষা সিস্টেম', 
      path: '/exams',
      icon: <GraduationCap size={16} />
    }
  ];

  const navItems: NavItem[] = isAdmin 
    ? [
        ...baseNavItems,
        { 
          name: 'কন্ট্রোল সেন্টার', 
          path: '/admin', 
          icon: <ShieldCheck size={16} className="text-amber-600" />,
          isAdminItem: true 
        }
      ]
    : baseNavItems;

  const handleAdminLogout = () => {
    logoutAdminSession();
    setIsAdmin(false);
  };

  return (
    <header 
      id="main-navbar" 
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all font-sans"
    >
      <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-5 md:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left Area: Clean, Minimal, Zero Unnecessary Clutter */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Toggle for AppSidebar */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 transition-colors shrink-0 shadow-2xs"
                title="সাইডবার মেনু খুলুন"
                aria-label="সাইডবার মেনু খুলুন"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Desktop Show Sidebar Button (Only visible if sidebar is collapsed) */}
            {isSidebarCollapsed && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs border border-slate-200"
                title="সাইডবার প্রদর্শন করুন"
              >
                <PanelLeft size={16} className="text-emerald-600" />
                <span>সাইডবার দেখান</span>
              </button>
            )}
          </div>

          {/* Right Action Area: Clean & Organized */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Navigation Links */}
            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-primary bg-primary/10 border border-primary/20' 
                        : item.highlight
                        ? 'text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-amber-300 text-xs hidden sm:inline">সুপার অ্যাডমিন</span>
                </div>
                <button
                  onClick={handleAdminLogout}
                  title="অ্যাডমিন সেশন বন্ধ করুন"
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span className="text-[10px]">লক</span>
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 max-w-[90px] sm:max-w-[130px] truncate">
                    {currentUser.name || 'শিক্ষক'}
                  </span>
                </div>
                <button
                  onClick={handleUserLogout}
                  title="লগআউট করে মূল পাতায় যান"
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link 
                  to="/login" 
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition"
                >
                  লগইন
                </Link>
                <Link 
                  to="/register" 
                  className="bg-slate-950 hover:bg-slate-800 text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                >
                  <Zap size={13} className="text-amber-300 shrink-0" />
                  <span>রেজিস্ট্রেশন</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
