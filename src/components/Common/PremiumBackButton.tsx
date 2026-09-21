import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface PremiumBackButtonProps {
  to?: string;
  label?: string;
  variant?: 'pill' | 'outline' | 'glass' | 'floating' | 'subtle';
  showHome?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const PremiumBackButton: React.FC<PremiumBackButtonProps> = ({
  to,
  label = 'পেছনে যান',
  variant = 'pill',
  showHome = false,
  className = '',
  onClick,
  title = 'পূর্ববর্তী পেজ বা হোমপেজে ফিরে যান'
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    // If browser has history, go back, else fallback to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Base styling for different variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return 'fixed top-4 left-4 z-50 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg shadow-slate-900/20 border border-slate-700/80 hover:border-slate-500';
      case 'glass':
        return 'bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-slate-200/90 hover:border-slate-300';
      case 'outline':
        return 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400';
      case 'subtle':
        return 'bg-slate-100/80 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200';
      case 'pill':
      default:
        return 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-full shadow-xs border border-slate-200/90 hover:border-slate-300 active:bg-slate-100';
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={label}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`group inline-flex items-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none ${getVariantStyles()} ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shrink-0">
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
      </div>

      <span className="whitespace-nowrap tracking-normal">{label}</span>

      {showHome && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate('/');
          }}
          title="সরাসরি হোমপেজে যান"
          className="ml-1 pl-1.5 border-l border-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          <Home size={13} />
        </span>
      )}
    </motion.button>
  );
};

export default PremiumBackButton;
