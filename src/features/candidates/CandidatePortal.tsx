import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Vote, MapPin, Award, TrendingUp, Search } from 'lucide-react';
import { CANDIDATES } from '../../constants';

export const CandidatePortal: React.FC = () => {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">বিভাগীয় প্রার্থী</h1>
          <p className="mt-1 text-slate-500">আসন্ন নির্বাচনের জন্য আপনার স্থানীয় প্রতিনিধিদের সমর্থন করুন।</p>
        </div>
        <Button variant="secondary" size="lg" className="gap-2">
          <Award size={20} />
          নির্বাচনের নিয়মাবলী
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="নাম বা বিভাগ দিয়ে প্রার্থী খুঁজুন..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none">
              <option>সব বিভাগ</option>
              <option>ঢাকা</option>
              <option>চট্টগ্রাম</option>
              <option>সিলেট</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {CANDIDATES.map((candidate) => (
              <Card key={candidate.id} className="relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                    <img
                      src={`https://picsum.photos/seed/${candidate.name}/100/100`}
                      alt={candidate.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      {candidate.division}
                    </div>
                    <p className="mt-1 text-sm font-medium text-emerald-600">{candidate.position}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-sm">
                    <span className="font-bold text-slate-900">{candidate.votes.toLocaleString('bn-BD')}</span>
                    <span className="ml-1 text-slate-500">ভোট</span>
                  </div>
                  <Button variant="primary" size="sm" className="gap-2">
                    <Vote size={16} />
                    ভোট দিন
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900">লাইভ পরিসংখ্যান</h2>
            <div className="space-y-4">
              {[
                { label: 'মোট প্রদত্ত ভোট', value: '৪৫,২৩০', trend: '+১২%' },
                { label: 'সক্রিয় প্রার্থী', value: '১২৪', trend: '+৫' },
                { label: 'আওতাভুক্ত বিভাগ', value: '৮/৮', trend: '১০০%' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-emerald-600 text-white">
            <h2 className="mb-2 text-xl font-bold">প্রার্থী হন</h2>
            <p className="mb-6 text-sm text-emerald-100">আপনার বিভাগের প্রতিনিধিত্ব করুন এবং শিক্ষা সম্প্রদায়ে পরিবর্তন আনুন।</p>
            <Button variant="secondary" className="w-full bg-white text-emerald-700 hover:bg-emerald-50">
              এখনই আবেদন করুন
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
