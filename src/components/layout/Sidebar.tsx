import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  ShoppingBag, 
  Vote, 
  Settings,
  HelpCircle,
  Sparkles,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  userRole?: UserRole;
  onLogout?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, roles: ['admin', 'general_student', 'madrasah_student', 'guardian', 'coaching_manager', 'university_candidate', 'departmental_examinee', 'parent', 'child'] },
  { id: 'students', label: 'শিক্ষার্থী ভর্তি', icon: GraduationCap, roles: ['admin', 'coaching_manager'] },
  { id: 'coaching', label: 'ব্যাচ ম্যানেজমেন্ট', icon: Users, roles: ['admin', 'coaching_manager'] },
  { id: 'exams', label: 'পরীক্ষা ও সিলেবাস', icon: FileText, roles: ['admin', 'general_student', 'madrasah_student', 'university_candidate', 'departmental_examinee', 'child'] },
  { id: 'ai-gen', label: 'এআই প্রশ্ন তৈরি', icon: Sparkles, roles: ['admin', 'general_student', 'madrasah_student', 'coaching_manager', 'university_candidate', 'departmental_examinee', 'parent'] },
  { id: 'notes', label: 'নোট স্টোর', icon: ShoppingBag, roles: ['admin', 'general_student', 'madrasah_student'] },
  { id: 'candidates', label: 'প্রার্থী', icon: Vote, roles: ['admin'] },
  { id: 'settings', label: 'সেটিংস', icon: Settings, roles: ['admin', 'general_student', 'madrasah_student', 'guardian', 'coaching_manager', 'university_candidate', 'departmental_examinee', 'parent', 'child'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, userRole = 'general_student', onLogout }) => {
  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col px-4 py-6">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`relative py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-emerald-600 after:transition-all group-hover:after:w-full ${isActive ? 'after:w-full' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto space-y-1 pt-6 border-t border-slate-100">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <HelpCircle size={20} />
            সহায়তা কেন্দ্র
          </button>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              লগআউট
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
