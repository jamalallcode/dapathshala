import React, { useState } from 'react';
import { X, ClipboardEdit, Star, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'question' | 'praise'>('suggestion');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComment('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#0c1e33] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <ClipboardEdit size={19} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">মতামত ও পরামর্শ</h3>
              <p className="text-xs text-slate-300">দা পাঠশালাকে আরও সমৃদ্ধ করতে আপনার মূল্যবান মতামত দিন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">ধন্যবাদ! আপনার মতামত গৃহীত হয়েছে</h4>
            <p className="text-xs text-slate-500">আপনার মূল্যবান পরামর্শের ভিত্তিতে আমরা প্ল্যাটফর্মকে আরও উন্নত করব।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">আপনার সন্তুষ্টির মাত্রা</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      size={24}
                      fill={star <= rating ? '#fbbf24' : 'none'}
                      stroke="#fbbf24"
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {rating === 5 ? 'অসাধারণ' : rating === 4 ? 'খুব ভালো' : rating === 3 ? 'মোটামুটি' : 'উন্নতি প্রয়োজন'}
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">মতামতের ধরন</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'suggestion', label: 'পরামর্শ' },
                  { id: 'bug', label: 'সমস্যা/বাগ' },
                  { id: 'question', label: 'প্রশ্নব্যাংক' },
                  { id: 'praise', label: 'প্রশংসা' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      category === item.id
                        ? 'bg-[#0c1e33] text-white border-[#0c1e33]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিস্তারিত মতামত লিখুন</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="আপনার পরামর্শ বা কোনো অসুবিধা থাকলে বিস্তারিত লিখুন..."
                rows={4}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c1e33]/20 focus:border-[#0c1e33] transition"
              />
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0c1e33] text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
              >
                <Send size={14} />
                <span>জমা দিন</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
