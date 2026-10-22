import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ShoppingCart, 
  Star, 
  Download, 
  Search, 
  Filter, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NOTES } from '../../constants';

export const NoteStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');

  const categories = ['সব', 'বিজ্ঞান', 'গণিত', 'ইংরেজি', 'বাংলা', 'ইতিহাস'];

  const filteredNotes = NOTES.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'সব' || note.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
              <BookOpen size={28} />
            </div>
            নোট <span className="text-emerald-600">মার্কেটপ্লেস</span>
          </h1>
          <p className="mt-2 text-slate-500 text-lg">সেরা শিক্ষকদের তৈরি প্রিমিয়াম অধ্যয়ন সামগ্রী এখন আপনার হাতের মুঠোয়।</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2 rounded-2xl border-slate-200">
            <Sparkles size={20} className="text-amber-500" />
            আমার লাইব্রেরি
          </Button>
          <Button variant="primary" size="lg" className="gap-2 rounded-2xl shadow-xl shadow-emerald-200">
            <ShoppingCart size={20} />
            কার্ট (০)
          </Button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <Card className="border-none shadow-xl shadow-slate-200/50 p-4 bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বিষয়, টপিক বা লেখকের নাম দিয়ে খুঁজুন..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pr-4 pl-12 text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              key={note.id}
            >
              <Card className="group overflow-hidden p-0 border-none shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full bg-white">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={note.previewUrl}
                    alt={note.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-black text-emerald-700 backdrop-blur-sm shadow-xl">
                    ৳{note.price.toFixed(0)}
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                    <Button variant="primary" className="w-full rounded-xl gap-2 shadow-xl">
                      <Zap size={16} />
                      দ্রুত প্রিভিউ
                    </Button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      {note.subject}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black text-slate-700">{note.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {note.author.charAt(0)}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">লেখক: {note.author}</p>
                    <CheckCircle2 size={14} className="text-blue-500" />
                  </div>

                  <div className="mt-auto flex gap-3">
                    <Button variant="primary" className="flex-1 gap-2 rounded-xl py-5 shadow-lg shadow-emerald-100">
                      <ShoppingCart size={18} />
                      কিনুন
                    </Button>
                    <Button variant="outline" className="px-4 rounded-xl border-slate-200 hover:bg-slate-50">
                      <Download size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-400 mb-4">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">দুঃখিত, কোনো নোট পাওয়া যায়নি</h3>
          <p className="text-slate-500 mt-2">অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করে দেখুন।</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => {setSearchQuery(''); setSelectedCategory('সব');}}>
            সব নোট দেখুন
          </Button>
        </div>
      )}

      {/* Promotional Banner */}
      <Card className="mt-12 bg-slate-900 border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-4">আপনার নিজস্ব নোট বিক্রি করতে চান?</h2>
            <p className="text-slate-400 text-lg max-w-xl">
              আমাদের প্ল্যাটফর্মে শিক্ষক হিসেবে যোগ দিন এবং আপনার তৈরি করা নোট বিক্রি করে আয় শুরু করুন।
            </p>
          </div>
          <Button variant="primary" size="lg" className="rounded-2xl px-10 py-7 text-lg gap-3 shadow-2xl shadow-emerald-500/20">
            শিক্ষক হিসেবে যোগ দিন
            <ArrowRight size={20} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

