import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Bell, 
  Search, 
  BookOpen, 
  Clock, 
  Layers, 
  FileText,
  Send,
  UserCheck,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CoachingProfile, SubscriptionState, Invoice } from './types';
import { DEFAULT_COACHING_PROFILE, INITIAL_SUBSCRIPTION_STATE, INITIAL_INVOICES, SAAS_PLANS } from './coachingConstants';
import { SubscriptionAlertBanner } from './SubscriptionAlertBanner';
import { CoachingRegistrationModal } from './CoachingRegistrationModal';
import { CoachingProfileView } from './CoachingProfileView';
import { CoachingSubscriptionManager } from './CoachingSubscriptionManager';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { StudentLeadsManager } from './StudentLeadsManager';
import { AdmissionLead } from './marketplaceTypes';
import { INITIAL_ADMISSION_LEADS } from './marketplaceData';

interface Student {
  id: string;
  name: string;
  roll: string;
  phone: string;
  batch: string;
  attendanceToday: 'present' | 'absent' | 'unmarked';
  feeStatus: 'paid' | 'pending';
  feeAmount: number;
}

interface Notice {
  id: string;
  title: string;
  category: 'পরীক্ষা' | 'ছুটি' | 'ক্লাস' | 'জরুরি';
  date: string;
  description: string;
}

interface CoachingDashboardProps {
  onOpenMarketplace?: () => void;
}

export const CoachingDashboard: React.FC<CoachingDashboardProps> = ({
  onOpenMarketplace
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'batches' | 'attendance' | 'fees' | 'notices' | 'subscription' | 'branding'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showQuickPayModal, setShowQuickPayModal] = useState(false);

  // Admission Leads state
  const [leads, setLeads] = useState<AdmissionLead[]>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_coaching_leads');
      return saved ? JSON.parse(saved) : INITIAL_ADMISSION_LEADS;
    } catch {
      return INITIAL_ADMISSION_LEADS;
    }
  });

  // Keep leads in sync with localStorage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('dapathshala_coaching_leads');
        if (saved) setLeads(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Coaching Profile State (saved to localStorage)
  const [coachingProfile, setCoachingProfile] = useState<CoachingProfile>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_coaching_profile');
      return saved ? JSON.parse(saved) : DEFAULT_COACHING_PROFILE;
    } catch {
      return DEFAULT_COACHING_PROFILE;
    }
  });

  // Subscription State (saved to localStorage)
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_coaching_subscription');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_STATE;
    } catch {
      return INITIAL_SUBSCRIPTION_STATE;
    }
  });

  // Invoices State (saved to localStorage)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_coaching_invoices');
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_coaching_profile', JSON.stringify(coachingProfile));
    } catch {}
  }, [coachingProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_coaching_subscription', JSON.stringify(subscription));
    } catch {}
  }, [subscription]);

  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_coaching_invoices', JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  const handleSaveProfile = (newProfile: CoachingProfile) => {
    setCoachingProfile(newProfile);
  };

  const handleUpdateSubscription = (newSub: SubscriptionState) => {
    setSubscription(newSub);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    setInvoices([newInv, ...invoices]);
  };

  const handleToggleAutoRenew = () => {
    setSubscription(prev => ({ ...prev, autoRenew: !prev.autoRenew }));
  };

  // Batches state
  const [batches, setBatches] = useState([
    { id: 'b1', name: 'এইচএসসি বিজ্ঞান ব্যাচ-১', teacher: 'ডাঃ স্মিথ', students: 45, time: 'সোম, বুধ সকাল ১০:০০', room: 'রুম ২০২' },
    { id: 'b2', name: 'জৈব রসায়ন স্পেশাল', teacher: 'অধ্যাপক জেন', students: 32, time: 'মঙ্গল, বৃহস্পতি দুপুর ০২:০০', room: 'ল্যাব ৩' },
    { id: 'b3', name: 'এসএসসি উচ্চতর গণিত', teacher: 'জনাব আহমেদ', students: 58, time: 'সোম, শুক্র সকাল ০৯:০০', room: 'রুম ১০১' },
    { id: 'b4', name: 'ইংরেজি ভার্সন ব্যাচ', teacher: 'মিস বেগম', students: 28, time: 'বুধ, শনি সকাল ১১:৩০', room: 'রুম ২০৫' },
  ]);

  // Students state
  const [students, setStudents] = useState<Student[]>([
    { id: 's1', name: 'তানভীর আহমেদ', roll: '১০১', phone: '01711223344', batch: 'এইচএসসি বিজ্ঞান ব্যাচ-১', attendanceToday: 'present', feeStatus: 'paid', feeAmount: 2000 },
    { id: 's2', name: 'সাদিয়া জাহান', roll: '১০২', phone: '01811998877', batch: 'এইচএসসি বিজ্ঞান ব্যাচ-১', attendanceToday: 'present', feeStatus: 'pending', feeAmount: 2000 },
    { id: 's3', name: 'রাকিবুল হাসান', roll: '১০৩', phone: '01911445566', batch: 'জৈব রসায়ন স্পেশাল', attendanceToday: 'absent', feeStatus: 'paid', feeAmount: 2500 },
    { id: 's4', name: 'মেহজাবিন চৌধুরী', roll: '১০৪', phone: '01611334455', batch: 'এসএসসি উচ্চতর গণিত', attendanceToday: 'present', feeStatus: 'pending', feeAmount: 1800 },
    { id: 's5', name: 'আবরার নাদিম', roll: '১০৫', phone: '01511667788', batch: 'ইংরেজি ভার্সন ব্যাচ', attendanceToday: 'unmarked', feeStatus: 'paid', feeAmount: 2200 },
  ]);

  // Notices state
  const [notices, setNotices] = useState<Notice[]>([
    { id: 'n1', title: 'আসন্ন প্রথম সাময়িক মডেল টেস্ট রুটিন প্রকাশিত', category: 'পরীক্ষা', date: '২৪ অক্টোবর, ২০২৬', description: 'সকল ব্যাচের শিক্ষার্থীদের মডেল টেস্ট আগামী রবিবার সকাল ৯টা থেকে শুরু হবে। প্রবেশপত্র সংগ্রহ করার জন্য বলা হচ্ছে।' },
    { id: 'n2', title: 'পদার্থবিজ্ঞান বিশেষ রিভিশন ও প্র্যাকটিক্যাল ক্লাস', category: 'ক্লাস', date: '২২ অক্টোবর, ২০২৬', description: 'আগামীকাল শুক্রবার বিকাল ৩টায় ল্যাব-৩ এ বিশেষ প্র্যাকটিক্যাল সেশন অনুষ্ঠিত হবে।' },
    { id: 'n3', title: 'চলতি মাসের টিউশন ফি পরিশোধ সংক্রান্ত নোটিশ', category: 'জরুরি', date: '২০ অক্টোবর, ২০২৬', description: 'যাদের চলতি মাসের ফি এখনও বকেয়া আছে, তারা আগামী ২৫ তারিখের মধ্যে অফিসে অথবা অনলাইনে পরিশোধ করুন।' },
  ]);

  // New Class Form State
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    teacher: '',
    time: '',
    room: ''
  });

  // New Notice Form State
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    category: 'পরীক্ষা' as Notice['category'],
    description: ''
  });

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.name) return;
    setBatches([...batches, {
      id: 'b' + (batches.length + 1),
      name: newClassForm.name,
      teacher: newClassForm.teacher || 'নিযুক্ত শিক্ষক',
      time: newClassForm.time || 'নির্ধারিত শিডিউল',
      room: newClassForm.room || 'রুম ১০১',
      students: 0
    }]);
    setNewClassForm({ name: '', teacher: '', time: '', room: '' });
    setShowAddClassModal(false);
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title) return;
    setNotices([{
      id: 'n' + Date.now(),
      title: newNoticeForm.title,
      category: newNoticeForm.category,
      date: 'আজ',
      description: newNoticeForm.description
    }, ...notices]);
    setNewNoticeForm({ title: '', category: 'পরীক্ষা', description: '' });
    setShowAddNoticeModal(false);
  };

  const toggleAttendance = (id: string, status: 'present' | 'absent') => {
    setStudents(students.map(s => s.id === id ? { ...s, attendanceToday: status } : s));
  };

  const toggleFeeStatus = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, feeStatus: s.feeStatus === 'paid' ? 'pending' : 'paid' } : s));
  };

  const filteredStudents = students.filter(s => {
    const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.includes(searchQuery);
    return matchesBatch && matchesSearch;
  });

  const totalFeeCollected = students.filter(s => s.feeStatus === 'paid').reduce((acc, s) => acc + s.feeAmount, 0);
  const totalFeePending = students.filter(s => s.feeStatus === 'pending').reduce((acc, s) => acc + s.feeAmount, 0);
  const presentCount = students.filter(s => s.attendanceToday === 'present').length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Top Header with Coaching Branding & Quick Actions */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setShowRegistrationModal(true)}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
            style={{ backgroundColor: `${coachingProfile.themeColor}15`, color: coachingProfile.themeColor }}
            title="লোগো বা প্রোফাইল পরিবর্তন করতে ক্লিক করুন"
          >
            {coachingProfile.logo.startsWith('data:') || coachingProfile.logo.startsWith('http') ? (
              <img src={coachingProfile.logo} alt="Logo" className="w-full h-full object-contain p-1 rounded-2xl" />
            ) : (
              <span>{coachingProfile.logo}</span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <GraduationCap size={13} className="text-emerald-600" />
                কোচিং ও একাডেমি পোর্টাল
              </span>

              {/* Subscription Status Pill */}
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors cursor-pointer"
              >
                <Sparkles size={11} className="text-indigo-600" />
                <span>{subscription.planName}</span>
                <span className="text-[10px] text-indigo-900">• রিনিউয়াল তারিখ: {new Date(subscription.renewalDate).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              {coachingProfile.name}
            </h1>
            
            <p className="mt-0.5 text-slate-500 text-xs flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin size={12} className="text-emerald-600" />
                {coachingProfile.address || coachingProfile.district}
              </span>
              <span>•</span>
              <span>ধারণক্ষমতা: {coachingProfile.studentCapacity} শিক্ষার্থী</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">dapathshala.com/c/{coachingProfile.subdomain}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenMarketplace && (
            <Button 
              variant="outline" 
              onClick={onOpenMarketplace}
              className="gap-1.5 cursor-pointer text-xs font-bold border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            >
              <Search size={14} className="text-emerald-700" />
              মার্কেটপ্লেস ডিরেক্টরি
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => setActiveTab('leads')}
            className={`gap-1.5 cursor-pointer text-xs font-bold border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 ${
              activeTab === 'leads' ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <Users size={15} className="text-amber-600" />
            <span>ভর্তি আবেদন (Leads)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {leads.filter(l => l.status === 'new').length}
            </span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowRegistrationModal(true)}
            className="gap-1.5 cursor-pointer text-xs font-bold border-slate-300 hover:bg-slate-50"
          >
            <Building2 size={15} className="text-emerald-600" />
            কোচিং তথ্য
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setActiveTab('subscription')}
            className={`gap-1.5 cursor-pointer text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 ${
              activeTab === 'subscription' ? 'bg-indigo-100' : ''
            }`}
          >
            <CreditCard size={15} />
            প্যাকেজ ও বিলিং
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowAddNoticeModal(true)}
            className="gap-1.5 cursor-pointer text-xs font-bold"
          >
            <Bell size={15} />
            নোটিশ
          </Button>

          <Button 
            variant="primary" 
            onClick={() => setShowAddClassModal(true)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs font-bold shadow-md shadow-emerald-200"
          >
            <Plus size={15} />
            নতুন ব্যাচ
          </Button>
        </div>
      </header>

      {/* Auto-Notification Renewal Alert Banner */}
      <SubscriptionAlertBanner
        subscription={subscription}
        coachingProfile={coachingProfile}
        onOpenRenew={() => setActiveTab('subscription')}
        onToggleAutoRenew={handleToggleAutoRenew}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ওভারভিউ ও অ্যানালিটিক্স
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leads' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-700 bg-emerald-50/70 hover:bg-emerald-100'
          }`}
        >
          <Users size={15} />
          ভর্তি আবেদন (Student Leads)
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'leads' ? 'bg-white text-emerald-800' : 'bg-amber-400 text-slate-950'
          }`}>
            {leads.filter(l => l.status === 'new').length} নতুন
          </span>
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'batches' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={15} />
          সক্রিয় ব্যাচসমূহ ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={15} />
          উপস্থিতি শিট (Attendance)
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'fees' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign size={15} />
          টিউশন ফি ট্র্যাকার
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'subscription' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
          }`}
        >
          <CreditCard size={15} />
          প্যাকেজ ও সাবস্ক্রিপশন (SaaS)
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'branding' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 size={15} />
          ব্র্যান্ডিং ও প্রোফাইল
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notices' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell size={15} />
          নোটিশ বোর্ড ({notices.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'মোট শিক্ষার্থী', value: '৪৫০ জন', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', onClick: undefined },
              { 
                label: 'ভর্তি আবেদন (Leads)', 
                value: `${leads.length} জন`, 
                subtext: `${leads.filter(l => l.status === 'new').length}টি নতুন আবেদন`,
                icon: Sparkles, 
                color: 'text-amber-600', 
                bg: 'bg-amber-50',
                onClick: () => setActiveTab('leads') 
              },
              { label: 'সক্রিয় ব্যাচ', value: `${batches.length}টি`, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => setActiveTab('batches') },
              { label: 'চলতি মাসে ফি আদায়', value: `৳${totalFeeCollected.toLocaleString('bn-BD')}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', onClick: () => setActiveTab('fees') },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.label} 
                  onClick={stat.onClick}
                  className={`flex items-center gap-4 border-none shadow-md bg-white transition-all ${stat.onClick ? 'cursor-pointer hover:shadow-lg hover:border-slate-300' : ''}`}
                >
                  <div className={`rounded-2xl p-3.5 ${stat.bg}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                    {stat.subtext && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md inline-block mt-1">
                        {stat.subtext}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Active Classes Card */}
              <Card className="border-none shadow-md bg-white">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={20} className="text-emerald-600" />
                    সক্রিয় ক্লাসসমূহ
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('batches')} className="text-xs font-bold text-emerald-600">সব দেখুন</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="pb-4 pl-4">ক্লাসের নাম</th>
                        <th className="pb-4">শিক্ষক</th>
                        <th className="pb-4">শিক্ষার্থী</th>
                        <th className="pb-4">শিডিউল</th>
                        <th className="pb-4 pr-4">রুম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {batches.map((cls, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 pl-4 font-bold text-slate-900">{cls.name}</td>
                          <td className="py-4 text-slate-600">{cls.teacher}</td>
                          <td className="py-4 font-semibold text-emerald-600">{cls.students} জন</td>
                          <td className="py-4 text-slate-600">{cls.time}</td>
                          <td className="py-4 pr-4 text-slate-500 font-medium">{cls.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Recent Student Admission Leads Widget */}
              <Card className="border-none shadow-md bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-amber-500" />
                      নতুন ভর্তি ইচ্ছুক শিক্ষার্থী (Recent Admission Leads)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">মার্কেটপ্লেস ও ডিরেক্টরি থেকে সরাসরি আসা সর্বশেষ আবেদনসমূহ</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('leads')} 
                    className="text-xs font-bold text-emerald-600 cursor-pointer"
                  >
                    সকল আবেদন দেখুন ({leads.length})
                  </Button>
                </div>

                <div className="divide-y divide-slate-100">
                  {leads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {lead.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{lead.studentName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              lead.status === 'new' 
                                ? 'bg-amber-100 text-amber-800' 
                                : lead.status === 'enrolled' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {lead.status === 'new' ? 'নতুন' : lead.status === 'enrolled' ? 'ভর্তি নিশ্চিত' : 'যোগাযোগকৃত'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{lead.currentInstitution}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{lead.programInterest}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${lead.phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          কল দিন
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('leads')}
                          className="text-xs font-bold text-slate-700 border-slate-200 cursor-pointer"
                        >
                          ফলো-আপ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-md bg-white">
                <h2 className="mb-4 text-lg font-bold text-slate-900">শিক্ষার্থীর পারফরম্যান্স মেট্রিকস</h2>
                <div className="space-y-4">
                  {[
                    { name: 'টপ পারফর্মার (A+ গ্রেড)', count: 48, color: 'bg-emerald-500' },
                    { name: 'গড় পারফর্মার (A/B গ্রেড)', count: 320, color: 'bg-blue-500' },
                    { name: 'বিশেষ মনোযোগ প্রয়োজন', count: 18, color: 'bg-amber-500' },
                  ].map((group) => (
                    <div key={group.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">{group.name}</span>
                        <span className="font-bold text-slate-900">{group.count} জন</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div 
                          className={`h-full rounded-full ${group.color}`} 
                          style={{ width: `${(group.count / 350) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
                <h2 className="mb-2 text-lg font-black text-white">কোচিং ডিজিটাল ইনসাইট</h2>
                <p className="mb-4 text-xs text-slate-300 leading-relaxed">
                  আপনার প্রতিষ্ঠানের মোট ফি আদায়ের হার বর্তমানে ৮০%। শিক্ষার্থীদের জন্য আগামী সপ্তাহের মডেল টেস্টের নোটিশ প্রকাশ করা হয়েছে।
                </p>
                <Button 
                  onClick={() => setActiveTab('fees')} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  ফি তালিকা ও বকেয়া দেখুন
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STUDENT LEADS */}
      {activeTab === 'leads' && (
        <StudentLeadsManager
          coachingId={coachingProfile.id}
          coachingName={coachingProfile.name}
        />
      )}

      {/* TAB 2: BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">সকল সক্রিয় ক্লাস ও ব্যাচ তালিকা</h2>
            <Button 
              onClick={() => setShowAddClassModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              + নতুন ব্যাচ যোগ করুন
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="p-6 border-none shadow-md bg-white hover:shadow-xl transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                    {batch.room}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{batch.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">শিক্ষক: {batch.teacher}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">শিডিউল:</span>
                    <span className="font-semibold">{batch.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">শিক্ষার্থী সংখ্যা:</span>
                    <span className="font-bold text-emerald-600">{batch.students} জন</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedBatch(batch.name);
                      setActiveTab('attendance');
                    }}
                    className="w-full text-xs font-bold cursor-pointer"
                  >
                    উপস্থিতি দিন
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedBatch(batch.name);
                      setActiveTab('fees');
                    }}
                    className="w-full text-xs font-bold cursor-pointer"
                  >
                    ফি দেখুন
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <Card className="p-6 border-none shadow-md bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="text-emerald-600" />
                দৈনিক উপস্থিতি শিট
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                তারিখ: {new Date().toLocaleDateString('bn-BD')} • ব্যাচভিত্তিক এক ক্লিকে উপস্থিতি মার্ক করুন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              >
                <option value="all">সকল ব্যাচ</option>
                {batches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                  <th className="pb-3 pl-3">রোল</th>
                  <th className="pb-3">শিক্ষার্থীর নাম</th>
                  <th className="pb-3">ব্যাচ</th>
                  <th className="pb-3">যোগাযোগ</th>
                  <th className="pb-3">আজকের উপস্থিতি</th>
                  <th className="pb-3 pr-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 pl-3 font-bold text-slate-900">{s.roll}</td>
                    <td className="py-3.5 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 text-slate-600">{s.batch}</td>
                    <td className="py-3.5 text-slate-500 font-mono">{s.phone}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        s.attendanceToday === 'present' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : s.attendanceToday === 'absent' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.attendanceToday === 'present' ? 'উপস্থিত' : s.attendanceToday === 'absent' ? 'অনুপস্থিত' : 'মার্ক হয়নি'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => toggleAttendance(s.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            s.attendanceToday === 'present' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          উপস্থিত
                        </button>
                        <button
                          onClick={() => toggleAttendance(s.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            s.attendanceToday === 'absent' 
                              ? 'bg-rose-600 text-white' 
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          অনুপস্থিত
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-md bg-emerald-50/50 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 uppercase">মোট আদায়কৃত ফি</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                ৳{totalFeeCollected.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-emerald-700 mt-1">চলতি মাসের সকল পরিশোধিত শিক্ষার্থীদের মোট ফি</p>
            </Card>

            <Card className="p-6 border-none shadow-md bg-rose-50/50 border border-rose-100">
              <span className="text-xs font-bold text-rose-700 uppercase">মোট বকেয়া ফি</span>
              <div className="text-3xl font-black text-rose-600 mt-1">
                ৳{totalFeePending.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-rose-700 mt-1">যেসব শিক্ষার্থীর ফি পরিশোধ বাকি আছে</p>
            </Card>
          </div>

          <Card className="p-6 border-none shadow-md bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">শিক্ষার্থীভিত্তিক টিউশন ফি হিসাব</h3>
              <input
                type="text"
                placeholder="নাম বা রোল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 px-3 rounded-xl border border-slate-200 text-xs w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3 pl-3">রোল</th>
                    <th className="pb-3">নাম</th>
                    <th className="pb-3">ব্যাচ</th>
                    <th className="pb-3">মাসিক ফি</th>
                    <th className="pb-3">স্ট্যাটাস</th>
                    <th className="pb-3 pr-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 pl-3 font-bold text-slate-900">{s.roll}</td>
                      <td className="py-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3.5 text-slate-600">{s.batch}</td>
                      <td className="py-3.5 font-bold text-slate-900">৳{s.feeAmount}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${
                          s.feeStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.feeStatus === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <button
                          onClick={() => toggleFeeStatus(s.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            s.feeStatus === 'paid' 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {s.feeStatus === 'paid' ? 'বকেয়া মার্ক করুন' : 'পরিশোধ সম্পন্ন'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: NOTICES */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Bell className="text-emerald-600" />
              কোচিং নোটিশ ও অ্যানাউন্সমেন্ট বোর্ড
            </h2>
            <Button
              onClick={() => setShowAddNoticeModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              + নতুন নোটিশ দিন
            </Button>
          </div>

          <div className="space-y-4">
            {notices.map((n) => (
              <Card key={n.id} className="p-6 border-none shadow-md bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      n.category === 'জরুরি' 
                        ? 'bg-rose-100 text-rose-700' 
                        : n.category === 'পরীক্ষা'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {n.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{n.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                  {n.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SUBSCRIPTION & BILLING (SAAS) */}
      {activeTab === 'subscription' && (
        <CoachingSubscriptionManager
          subscription={subscription}
          coachingProfile={coachingProfile}
          invoices={invoices}
          onUpdateSubscription={handleUpdateSubscription}
          onAddInvoice={handleAddInvoice}
        />
      )}

      {/* TAB 7: BRANDING & PROFILE */}
      {activeTab === 'branding' && (
        <CoachingProfileView
          profile={coachingProfile}
          onEdit={() => setShowRegistrationModal(true)}
        />
      )}

      {/* MODAL: ADD CLASS */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-none shadow-2xl bg-white space-y-4">
            <h3 className="text-lg font-bold text-slate-900">নতুন ক্লাস / ব্যাচ তৈরি করুন</h3>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ব্যাচের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: এইচএসসি রসায়ন ব্যাচ-৩"
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">শিক্ষক / ইনস্ট্রাক্টর</label>
                <input
                  type="text"
                  placeholder="যেমন: ইঞ্জিনিয়ার সাদমান"
                  value={newClassForm.teacher}
                  onChange={(e) => setNewClassForm({ ...newClassForm, teacher: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ক্লাসের সময়</label>
                  <input
                    type="text"
                    placeholder="যেমন: শনি, সোম বিকাল ৪:০০"
                    value={newClassForm.time}
                    onChange={(e) => setNewClassForm({ ...newClassForm, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">রুম / ল্যাব</label>
                  <input
                    type="text"
                    placeholder="যেমন: রুম ৩০২"
                    value={newClassForm.room}
                    onChange={(e) => setNewClassForm({ ...newClassForm, room: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowAddClassModal(false)}>বাতিল</Button>
                <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">তৈরি করুন</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: ADD NOTICE */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-none shadow-2xl bg-white space-y-4">
            <h3 className="text-lg font-bold text-slate-900">নতুন নোটিশ প্রচার করুন</h3>
            <form onSubmit={handleAddNotice} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  placeholder="যেমন: পরীক্ষা পেছানো সংক্রান্ত নোটিশ"
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={newNoticeForm.category}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="পরীক্ষা">পরীক্ষা</option>
                  <option value="ক্লাস">ক্লাস</option>
                  <option value="ছুটি">ছুটি</option>
                  <option value="জরুরি">জরুরি</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={3}
                  placeholder="নোটিশের বিস্তারিত বক্তব্য..."
                  value={newNoticeForm.description}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowAddNoticeModal(false)}>বাতিল</Button>
                <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">প্রচার করুন</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: COACHING REGISTRATION & BRANDING */}
      <CoachingRegistrationModal
        isOpen={showRegistrationModal}
        initialProfile={coachingProfile}
        onClose={() => setShowRegistrationModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
