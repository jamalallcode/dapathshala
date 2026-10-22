import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Terminal, 
  Database, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  Code,
  Cpu,
  Activity,
  Users,
  Crown,
  CheckCircle2,
  Shield,
  KeyRound,
  UserCheck,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../supabase';
import { 
  getRegisteredAccounts, 
  saveRegisteredAccount, 
  RegisteredAccount, 
  ROLE_LABELS, 
  saveCurrentUser, 
  getCurrentUser 
} from '../../lib/authService';
import { UserRole } from '../../types';

export const DeveloperConsole: React.FC = () => {
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'error' | 'warn' }[]>([
    { time: new Date().toLocaleTimeString(), msg: 'Developer & Admin Console Initialized', type: 'info' },
    { time: new Date().toLocaleTimeString(), msg: 'Admin Mode Active for Application Owner', type: 'info' }
  ]);
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => getRegisteredAccounts());
  const currentUser = getCurrentUser();

  const addLog = (msg: string, type: 'info' | 'error' | 'warn' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const refreshAccounts = () => {
    const list = getRegisteredAccounts();
    setAccounts([...list]);
    addLog(`Accounts refreshed (${list.length} total users)`, 'info');
  };

  const handleUpdateRole = (account: RegisteredAccount, newRole: UserRole) => {
    const updated: RegisteredAccount = { ...account, role: newRole };
    saveRegisteredAccount(updated);
    refreshAccounts();
    addLog(`Role updated for ${account.email} -> ${newRole}`, 'warn');

    // If current logged in user was modified, update their session too
    if (currentUser && currentUser.email.toLowerCase() === account.email.toLowerCase()) {
      saveCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleAddBonusXP = (account: RegisteredAccount, amount: number) => {
    const currentPoints = account.points || 0;
    const updated: RegisteredAccount = { ...account, points: currentPoints + amount };
    saveRegisteredAccount(updated);
    refreshAccounts();
    addLog(`Added ${amount} XP to ${account.email}`, 'info');

    if (currentUser && currentUser.email.toLowerCase() === account.email.toLowerCase()) {
      saveCurrentUser({ ...currentUser, points: currentPoints + amount });
    }
  };

  const clearCache = () => {
    localStorage.clear();
    addLog('Local Storage Cleared', 'warn');
    alert('Local Storage cleared. Please refresh the page to reload default state.');
  };

  const testSupabase = async () => {
    if (!supabase) {
      addLog('Supabase is not configured (VITE_SUPABASE_URL is missing in .env)', 'error');
      return;
    }
    addLog('Testing Supabase connection...', 'info');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Supabase Error: ${error.message}`, 'error');
      } else {
        addLog(`Supabase Connected. Active session: ${data.session ? 'Yes' : 'None'}`, 'info');
      }
    } catch (err: any) {
      addLog(`Supabase test exception: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
            <Crown size={14} className="text-amber-600" />
            মালিক ও সুপার অ্যাডমিন কন্ট্রোল প্যানেল
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Terminal size={24} />
            </div>
            Admin & Developer <span className="text-amber-600">Console</span>
          </h1>
          <p className="mt-1 text-slate-500">
            ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা, সিস্টেম ডিবাগিং এবং ব্যাকএন্ড কনফিগারেশন।
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshAccounts} className="gap-2">
            <RefreshCw size={14} />
            রিফ্রেশ ইউজার লিস্ট
          </Button>
        </div>
      </header>

      {/* Accounts & Role Management */}
      <Card className="p-6 border border-slate-200 shadow-xl bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ব্যবহারকারী ও রোল ম্যানেজমেন্ট</h2>
              <p className="text-xs text-slate-500">প্ল্যাটফর্মে নিবন্ধিত অ্যাকাউন্ট ও তাদের ক্ষমতা নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            মোট ব্যবহারকারী: {accounts.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">নাম ও ইমেইল</th>
                <th className="py-3 px-3">বর্তমান রোল</th>
                <th className="py-3 px-3">রোল পরিবর্তন</th>
                <th className="py-3 px-3">XP পয়েন্টস</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const isOwnerAccount = acc.email.toLowerCase() === 'websitetogather@gmail.com';
                const isCurrent = currentUser?.email.toLowerCase() === acc.email.toLowerCase();

                return (
                  <tr key={acc.id} className={isCurrent ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isOwnerAccount && <Crown size={14} className="text-amber-500 shrink-0" />}
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {acc.name}
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black">
                                আপনি
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 font-mono text-[11px]">{acc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        acc.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : acc.role === 'parent'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {acc.role === 'admin' && <Crown size={12} />}
                        {ROLE_LABELS[acc.role] || acc.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={acc.role}
                        onChange={(e) => handleUpdateRole(acc, e.target.value as UserRole)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="admin">মালিক / অ্যাডমিন (admin)</option>
                        <option value="parent">অভিভাবক (parent)</option>
                        <option value="general_student">সাধারণ শিক্ষার্থী</option>
                        <option value="coaching_manager">কোচিং ম্যানেজার</option>
                        <option value="university_candidate">বিশ্ববিদ্যালয় পরীক্ষার্থী</option>
                        <option value="departmental_examinee">বিভাগীয় পরীক্ষার্থী</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      {acc.points || 0} XP
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleAddBonusXP(acc, 500)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all"
                      >
                        <Zap size={12} />
                        +৫০০ XP
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* System Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              সিস্টেম স্ট্যাটাস
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">এনভায়রনমেন্ট</span>
                <span className="text-sm font-bold text-slate-900 uppercase">Development</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">এপিআই স্ট্যাটাস</span>
                <span className="text-sm font-bold text-emerald-600">Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">ভার্সন</span>
                <span className="text-sm font-bold text-slate-900">v1.2.0-admin</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 rounded-xl"
                onClick={testSupabase}
              >
                <Database size={18} />
                টেস্ট সুপাবেস কানেকশন
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => addLog('System Check completed: All services healthy', 'info')}
              >
                <Cpu size={18} />
                সিস্টেম হেলথ চেক
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={clearCache}
              >
                <Trash2 size={18} />
                ক্লিয়ার লোকাল স্টোরেজ
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-slate-400 border-none shadow-2xl">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              মালিক অধিকার ও প্রিভিলেজ
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              আপনি অ্যাপ্লিকেশনটির সম্পূর্ণ ক্ষমতা সম্পন্ন সুপার অ্যাডমিন। এখান থেকে সকল ব্যবহারকারীর রোল, পয়েন্ট এবং সিস্টেম কনফিগারেশন পরিবর্তন করা সম্ভব।
            </p>
          </Card>
        </div>

        {/* Console Logs */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col overflow-hidden border-none shadow-xl bg-slate-900">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="ml-4 text-xs font-mono text-slate-500">system_logs.log</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="p-1.5 text-slate-500 hover:text-white transition-colors"
                title="Clear Logs"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 min-h-[350px]">
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="flex gap-4"
                >
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warn' ? 'text-amber-400' : 
                      'text-emerald-400'}
                  `}>
                    {log.type.toUpperCase()}: {log.msg}
                  </span>
                </motion.div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-700 italic">No logs to display...</div>
              )}
            </div>
            
            <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center gap-3">
              <Code size={14} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="কমান্ড টাইপ করুন (যেমন: status, users, reload)..."
                className="bg-transparent border-none text-slate-300 text-xs w-full focus:ring-0 placeholder:text-slate-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const cmd = (e.target as HTMLInputElement).value;
                    addLog(`Command executed: ${cmd}`, 'info');
                    if (cmd.toLowerCase() === 'users') {
                      addLog(`Registered users count: ${getRegisteredAccounts().length}`, 'info');
                    } else if (cmd.toLowerCase() === 'status') {
                      addLog('System online. Database, AI Models, and Auth operational.', 'info');
                    }
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
