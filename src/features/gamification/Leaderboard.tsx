import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Search,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'friends'>('global');

  // Mock Data
  const topUsers: LeaderboardUser[] = [
    { id: '1', name: 'আরিফ আহমেদ', points: 12500, level: 45, rank: 1, trend: 'stable' },
    { id: '2', name: 'সাদিয়া সুলতানা', points: 11200, level: 42, rank: 2, trend: 'up' },
    { id: '3', name: 'তানভীর রহমান', points: 10800, level: 40, rank: 3, trend: 'down' },
    { id: '4', name: 'নুসরাত জাহান', points: 9500, level: 38, rank: 4, trend: 'up' },
    { id: '5', name: 'জুবায়ের হোসেন', points: 8900, level: 35, rank: 5, trend: 'stable' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-amber-400" size={24} />;
      case 2: return <Medal className="text-slate-400" size={24} />;
      case 3: return <Medal className="text-amber-700" size={24} />;
      default: return <span className="text-slate-400 font-bold">{rank}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Trophy size={24} />
            </div>
            লিডারবোর্ড <span className="text-amber-600">র‍্যাঙ্কিং</span>
          </h1>
          <p className="mt-1 text-slate-500">সেরা শিক্ষার্থীদের তালিকায় আপনার অবস্থান দেখুন।</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['global', 'weekly', 'friends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'global' ? 'গ্লোবাল' : tab === 'weekly' ? 'সাপ্তাহিক' : 'বন্ধুরা'}
            </button>
          ))}
        </div>
      </header>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-10">
        {/* Rank 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-2 sm:order-1"
        >
          <Card className="relative pt-12 pb-8 flex flex-col items-center text-center border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-10 w-20 h-20 rounded-full border-4 border-slate-200 bg-white overflow-hidden shadow-lg">
              <img src={`https://picsum.photos/seed/user2/200`} alt="User" />
            </div>
            <div className="absolute top-6 right-6 bg-slate-100 p-2 rounded-lg">
              <Medal className="text-slate-400" size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{topUsers[1].name}</h3>
            <div className="mt-2 flex items-center gap-2 text-slate-500 text-sm">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {topUsers[1].points.toLocaleString()} XP
            </div>
            <div className="mt-4 px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">
              Level {topUsers[1].level}
            </div>
          </Card>
        </motion.div>

        {/* Rank 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 sm:order-2"
        >
          <Card className="relative pt-16 pb-10 flex flex-col items-center text-center border-none shadow-2xl bg-gradient-to-b from-amber-50 to-white ring-2 ring-amber-200">
            <div className="absolute -top-12 w-24 h-24 rounded-full border-4 border-amber-400 bg-white overflow-hidden shadow-2xl">
              <img src={`https://picsum.photos/seed/user1/200`} alt="User" />
            </div>
            <div className="absolute top-8 right-8 bg-amber-100 p-2 rounded-lg animate-bounce">
              <Crown className="text-amber-500" size={24} />
            </div>
            <h3 className="font-black text-slate-900 text-xl">{topUsers[0].name}</h3>
            <div className="mt-2 flex items-center gap-2 text-amber-600 font-bold">
              <Zap size={16} className="fill-amber-500" />
              {topUsers[0].points.toLocaleString()} XP
            </div>
            <div className="mt-4 px-6 py-1.5 bg-amber-500 text-white rounded-full text-xs font-bold uppercase shadow-lg shadow-amber-200">
              Grand Master
            </div>
          </Card>
        </motion.div>

        {/* Rank 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-3"
        >
          <Card className="relative pt-12 pb-8 flex flex-col items-center text-center border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-10 w-20 h-20 rounded-full border-4 border-amber-700/20 bg-white overflow-hidden shadow-lg">
              <img src={`https://picsum.photos/seed/user3/200`} alt="User" />
            </div>
            <div className="absolute top-6 right-6 bg-amber-50 p-2 rounded-lg">
              <Medal className="text-amber-700" size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{topUsers[2].name}</h3>
            <div className="mt-2 flex items-center gap-2 text-slate-500 text-sm">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {topUsers[2].points.toLocaleString()} XP
            </div>
            <div className="mt-4 px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">
              Level {topUsers[2].level}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* List View */}
      <Card className="overflow-hidden border-none shadow-xl bg-white">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Users size={18} className="text-amber-500" />
            শীর্ষ তালিকা
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="খুঁজুন..." 
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {topUsers.map((user, i) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <img src={`https://picsum.photos/seed/${user.id}/100`} alt={user.name} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{user.name}</h4>
                  <p className="text-xs text-slate-500">Level {user.level} • {user.points.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  user.trend === 'up' ? 'text-emerald-500' : user.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <TrendingUp size={14} className={user.trend === 'down' ? 'rotate-180' : ''} />
                  {user.trend === 'up' ? '+2' : user.trend === 'down' ? '-1' : '0'}
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 bg-slate-50 text-center">
          <button className="text-sm font-bold text-amber-600 hover:underline">সম্পূর্ণ তালিকা দেখুন</button>
        </div>
      </Card>
    </div>
  );
};
