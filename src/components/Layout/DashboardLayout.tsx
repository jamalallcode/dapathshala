import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Header/Navbar/Navbar';
import AppSidebar from './Sidebar/AppSidebar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dapathshala_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_sidebar_position');
      if (saved === 'left' || saved === 'right') return saved;
    } catch {}
    return 'left';
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dapathshala_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleTogglePosition = () => {
    setSidebarPosition(prev => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        localStorage.setItem('dapathshala_sidebar_position', next);
      } catch {}
      return next;
    });
  };

  const isRight = sidebarPosition === 'right';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased overflow-x-clip min-w-0 selection:bg-blue-100 selection:text-blue-900 print:bg-white print:overflow-visible">
      {/* Persistent Global Sidebar - fixed to viewport bottom */}
      <div className="print:hidden">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          position={sidebarPosition}
          onToggleCollapse={handleToggleCollapse}
          onTogglePosition={handleTogglePosition}
        />
      </div>

      {/* Main Content Column with dynamic padding when sidebar is visible */}
      <div 
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 overflow-x-clip print:m-0 print:p-0 print:min-h-0 print:overflow-visible ${
          !isSidebarCollapsed 
            ? (isRight ? 'lg:pr-72' : 'lg:pl-72') 
            : ''
        }`}
      >
        {/* Global Top Navbar - Fixed & Sticky to the top */}
        <div className="sticky top-0 z-40 w-full shrink-0 print:hidden">
          <Navbar 
            onToggleSidebar={() => setIsSidebarOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            sidebarPosition={sidebarPosition}
            onTogglePosition={handleTogglePosition}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 min-w-0 print:overflow-visible print:m-0 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
