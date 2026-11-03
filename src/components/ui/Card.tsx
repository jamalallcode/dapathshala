import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all",
        hoverEffect && "hover:-translate-y-1 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};
