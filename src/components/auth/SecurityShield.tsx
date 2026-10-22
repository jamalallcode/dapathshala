import React, { useEffect } from 'react';
import { User } from '../../types';

interface SecurityShieldProps {
  children: React.ReactNode;
  user: User | null;
  isEnabled?: boolean;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({ children, user, isEnabled = true }) => {
  useEffect(() => {
    if (!isEnabled) return;

    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable Keyboard Shortcuts (Ctrl+C, Ctrl+V, Ctrl+P, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's' || e.key === 'u')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        alert('নিরাপত্তার স্বার্থে এই অ্যাকশনটি বন্ধ রাখা হয়েছে।');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled]);

  if (!isEnabled) return <>{children}</>;

  return (
    <div className="relative select-none">
      {/* Floating Watermark */}
      {user && (
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-3 gap-40 rotate-[-30deg] whitespace-nowrap">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-4xl font-black text-slate-900">
                {user.email} - {user.id.slice(0, 8)}
              </div>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
