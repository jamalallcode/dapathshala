import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : {}}
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
