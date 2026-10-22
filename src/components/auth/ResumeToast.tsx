import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ResumeToastProps {
  isVisible: boolean;
  onClose: () => void;
  onResume: () => void;
  email: string;
}

export const ResumeToast: React.FC<ResumeToastProps> = ({ isVisible, onClose, onResume, email }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 left-8 z-[110] max-w-sm w-full"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">সেশন রিকভার করুন</h4>
                  <p className="text-xs text-slate-500">আপনার শেষ সেশনটি কি পূর্ণ করতে চান?</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-600 truncate">
                ইমেইল: <span className="text-emerald-600">{email}</span>
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={onResume} className="w-full py-3 rounded-xl">
              হ্যাঁ, শুরু করুন
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
