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
    <div className="relative">
      {children}
    </div>
  );
};
