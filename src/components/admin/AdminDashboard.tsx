import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  Download, 
  Upload, 
  Trash2, 
  Search, 
  RefreshCw, 
  Eye, 
  Key, 
  Settings, 
  Bell, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  Power, 
  Lock, 
  Unlock, 
  Edit3, 
  Database,
  BarChart3,
  Sliders,
  Radio,
  FileCheck,
  Check
} from 'lucide-react';
import { AssignedTest, StudentSubmission, ParentAccountSummary, AdminBroadcastNotice } from '../../types';
import { 
  getStoredTests, 
  saveStoredTests, 
  deleteStoredTest,
  getStoredSubmissions, 
  saveStoredSubmission,
  fetchAllTestsFromServer,
  getShareableTestUrl
} from '../../lib/storage';
import { 
  InstitutionPaper, 
  getStoredInstitutionPapers, 
  deleteInstitutionPaper,
  saveInstitutionPapers 
} from '../../lib/institutionPapers';
import { AdminPaperBulkUploadModal } from './AdminPaperBulkUploadModal';
import { AdminAIVisionQuestionModal } from './AdminAIVisionQuestionModal';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onNavigateHome: () => void;
  onOpenTestPreview?: (test: AssignedTest) => void;
  onOpenReviewModal?: (test: AssignedTest) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
  onNavigateHome,
  onOpenTestPreview,
  onOpenReviewModal
}) => {
  // Navigation tabs inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'papers' | 'users' | 'exams' | 'proctoring' | 'notice' | 'system'
  >('overview');

  // Stats
  const [stats, setStats] = useState({
    totalParents: 0,
    totalExams: 0,
    totalSubmissions: 0,
    totalInstitutionPapers: 0,
    unreviewedSubmissions: 0,
    totalProctoringFlags: 0,
    serverUptimeSeconds: 0,
    status: 'operational',
    aiStatus: 'online'
  });

  // Data sets
  const [allTests, setAllTests] = useState<AssignedTest[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<StudentSubmission[]>([]);
  const [institutionPapers, setInstitutionPapers] = useState<InstitutionPaper[]>([]);
  const [parentsList, setParentsList] = useState<ParentAccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter States
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examStatusFilter, setExamStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [paperSearchQuery, setPaperSearchQuery] = useState('');

  // Modals & Action States
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [selectedExamForInspect, setSelectedExamForInspect] = useState<AssignedTest | null>(null);
  const [inspectMode, setInspectMode] = useState<'questions' | 'submission'>('questions');
  
  // Password Reset Modal for Parent
  const [parentToResetPass, setParentToResetPass] = useState<ParentAccountSummary | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Notice Broadcaster state
  const [noticeForm, setNoticeForm] = useState<AdminBroadcastNotice>({
    title: '',
    message: '',
    type: 'info',
    isActive: false
  });

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Admin PIN settings
  const [currentAdminPin, setCurrentAdminPin] = useState(() => {
    return localStorage.getItem('dapathshala_admin_custom_pin') || '7788';
  });
  const [newAdminPinInput, setNewAdminPinInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load everything
  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Tests & Submissions from server & local
      const serverTests = await fetchAllTestsFromServer();
      const localTests = getStoredTests();
      const mergedTestsMap = new Map<string, AssignedTest>();
      localTests.forEach(t => { if (t && (t.pin || t.id)) mergedTestsMap.set(t.pin || t.id, t); });
      serverTests.forEach(t => { if (t && (t.pin || t.id)) mergedTestsMap.set(t.pin || t.id, t); });
      const combinedTests = Array.from(mergedTestsMap.values());
      setAllTests(combinedTests);

      // 2. Load Submissions
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const subs = await res.json();
          setAllSubmissions(Array.isArray(subs) ? subs : Object.values(subs || {}));
        } else {
          setAllSubmissions(Object.values(getStoredSubmissions()));
        }
      } catch {
        setAllSubmissions(Object.values(getStoredSubmissions()));
      }

      // 3. Load Institution Papers
      const papers = getStoredInstitutionPapers();
      setInstitutionPapers(papers);

      // 4. Load Parents from server
      try {
        const pRes = await fetch('/api/admin/parents');
        if (pRes.ok) {
          const pList = await pRes.json();
          setParentsList(pList);
        } else {
          // Fallback to local accounts
          const rawAccounts = localStorage.getItem('dapathshala_parent_accounts_v1');
          if (rawAccounts) {
            const parsed = JSON.parse(rawAccounts);
            const mapped: ParentAccountSummary[] = Object.values(parsed).map((p: any) => ({
              id: p.id,
              phone: p.phone,
              name: p.name || 'অভিভাবক',
              childName: p.childName || '',
              childClass: p.childClass || '',
              createdAt: p.createdAt || new Date().toISOString(),
              status: 'active',
              examsCreated: combinedTests.filter(t => t.parentPhone === p.phone).length,
              submissionsReceived: 0
            }));
            setParentsList(mapped);
          }
        }
      } catch {}

      // 5. Load Stats
      try {
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
        }
      } catch {}

      // 6. Load Broadcast Notice
      try {
        const nRes = await fetch('/api/admin/notice');
        if (nRes.ok) {
          const n = await nRes.json();
          setNoticeForm(n);
        }
      } catch {}

      // 7. Load Maintenance status
      try {
        const mRes = await fetch('/api/admin/maintenance');
        if (mRes.ok) {
          const m = await mRes.json();
          setMaintenanceMode(m.maintenanceMode || false);
          setMaintenanceMessage(m.message || '');
        }
      } catch {}

    } catch (e) {
      console.error('Error loading admin master data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
    window.addEventListener('dapathshala_tests_updated', loadMasterData);
    return () => {
      window.removeEventListener('dapathshala_tests_updated', loadMasterData);
    };
  }, []);

  // Delete an Exam (Super-Admin Privilege)
  const handleDeleteExam = async (pinOrId: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে এই পরীক্ষাটি (PIN: ${pinOrId}) মুছে ফেলতে চান? এটি সার্ভার ও সকল ডেটাবেজ থেকে চিরতরে মুছে যাবে।`)) {
      return;
    }
    try {
      await fetch(`/api/tests/${pinOrId}`, { method: 'DELETE' });
      deleteStoredTest(pinOrId);
      setAllTests(prev => prev.filter(t => t.pin !== pinOrId && t.id !== pinOrId));
      showToast('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে');
    } catch {
      deleteStoredTest(pinOrId);
      setAllTests(prev => prev.filter(t => t.pin !== pinOrId && t.id !== pinOrId));
      showToast('পরীক্ষা মুছে ফেলা হয়েছে');
    }
  };

  // Toggle Parent Status (Active / Suspended)
  const handleToggleParentStatus = async (parent: ParentAccountSummary) => {
    const nextStatus = parent.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/parents/${parent.phone}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setParentsList(prev => prev.map(p => p.phone === parent.phone ? { ...p, status: nextStatus } : p));
        showToast(`অভিভাবকের স্ট্যাটাস পরিবর্তন হয়েছে: ${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}`);
      }
    } catch {
      showToast('সার্ভার রেসপন্স পাওয়া যায়নি');
    }
  };

  // Reset Parent Password
  const handleExecutePasswordReset = async () => {
    if (!parentToResetPass || !newPasswordInput.trim()) return;
    try {
      const res = await fetch(`/api/admin/parents/${parentToResetPass.phone}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() })
      });
      if (res.ok) {
        showToast(`অভিভাবক ${parentToResetPass.phone} এর নতুন পাসওয়ার্ড সেট করা হয়েছে`);
        setParentToResetPass(null);
        setNewPasswordInput('');
      } else {
        const err = await res.json();
        alert(err.error || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার যোগাযোগে সমস্যা হয়েছে');
    }
  };

  // Save Broadcast Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm)
      });
      if (res.ok) {
        showToast('প্ল্যাটফর্ম নোটিশ সফলভাবে আপডেট ও সম্প্রচার করা হয়েছে!');
        window.dispatchEvent(new Event('dapathshala_notice_updated'));
      }
    } catch {
      showToast('নোটিশ সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  // Save Maintenance Mode
  const handleSaveMaintenance = async (nextState: boolean) => {
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: nextState,
          message: maintenanceMessage || 'দাপাঠশালা পোর্টাল বর্তমানে রক্ষণাবেক্ষণে রয়েছে।'
        })
      });
      if (res.ok) {
        setMaintenanceMode(nextState);
        showToast(nextState ? '⚠️ রক্ষণাবেক্ষণ মোড চালু করা হয়েছে' : '✅ রক্ষণাবেক্ষণ মোড বন্ধ করা হয়েছে');
      }
    } catch {
      showToast('ব্যর্থ হয়েছে');
    }
  };

  // Download Full Unified Backup
  const handleDownloadBackup = () => {
    window.open('/api/admin/backup', '_blank');
  };

  // Update Admin PIN
  const handleUpdateAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPinInput.trim().length < 4) {
      alert('নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে');
      return;
    }
    localStorage.setItem('dapathshala_admin_custom_pin', newAdminPinInput.trim());
    setCurrentAdminPin(newAdminPinInput.trim());
    setNewAdminPinInput('');
    showToast('অ্যাডমিন মাস্টার পিন সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  // Logout from Admin
  const handleAdminLogout = () => {
    if (window.confirm('আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
      localStorage.removeItem('dapathshala_is_admin');
      localStorage.removeItem('dapathshala_admin_session');
      onExitAdmin();
    }
  };

  // Filtered Tests
  const filteredTests = allTests.filter(t => {
    const matchesSearch = 
      t.pin?.includes(examSearchQuery.trim()) || 
      t.title?.toLowerCase().includes(examSearchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(examSearchQuery.toLowerCase()) ||
      t.parentPhone?.includes(examSearchQuery.trim());

    if (!matchesSearch) return false;
    if (examStatusFilter === 'all') return true;
    return t.status === examStatusFilter;
  });

  // Filtered Parents
  const filteredParents = parentsList.filter(p => {
    return (
      p.phone?.includes(userSearchQuery.trim()) ||
      p.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      p.childName?.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  });

  // Filtered Institution Papers
  const filteredPapers = institutionPapers.filter(p => {
    return (
      p.institutionName?.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
      p.subject?.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
      p.year?.includes(paperSearchQuery.trim()) ||
      p.studentClass?.toLowerCase().includes(paperSearchQuery.toLowerCase())
    );
  });

  // Tests with proctoring violations
  const flaggedTests = allTests.filter(t => Array.isArray(t.proctoringFlags) && t.proctoringFlags.length > 0);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-700 border border-purple-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP HEADER: Super Admin Command Center                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-purple-900/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
              <Crown className="w-6 h-6 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight truncate">
                  দাপাঠশালা সুপার-অ্যাডমিন
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                  Master Console
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                প্ল্যাটফর্ম সার্বিক নিয়ন্ত্রণ, ব্যবহারকারী, প্রশ্নব্যাংক ও সিকিউরিটি হাব
              </p>
            </div>
          </div>

          {/* Quick Exit & Master Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={loadMasterData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/60 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="অ্যাডমিন থেকে লগআউট করুন"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>লগআউট</span>
            </button>
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ADMIN CONTROL TABS (Exclusive Top Navigation)         */}
      {/* ======================================================== */}
      <div className="bg-[#0b101e] border-b border-slate-800/80 sticky top-16 z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 py-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>মাস্টার ওভারভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('papers')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>কেন্দ্রীয় প্রশ্নব্যাংক</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-900/80 text-[10px] text-purple-200">
              {institutionPapers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ব্যবহারকারী ও একাউন্ট</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {parentsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>গ্লোবাল পরীক্ষা ও খাতা</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {allTests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proctoring')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'proctoring'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>প্রক্টরিং সিকিউরিটি</span>
            {flaggedTests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] text-white font-black animate-pulse">
                {flaggedTests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'notice'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>নোটিশ ব্রডকাস্ট</span>
            {noticeForm.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>সিস্টেম ও ব্যাকআপ</span>
          </button>

        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT                                            */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ==================================================== */}
        {/* TAB 1: MASTER OVERVIEW                               */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Top Welcome & System Status Banner */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>প্ল্যাটফর্ম সুপ্রিম অথরিটি কন্ট্রোল</span>
                  </div>
                  <h1 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight">
                    স্বাগতম, সুপার-অ্যাডমিন!
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                    এখানে আপনি অভিভাবক অ্যাকাউন্ট, কেন্দ্রীয় প্রশ্নব্যাংক, লাইভ ও জমাকৃত খাতা, অ্যান্টি-চিট সিকিউরিটি অডিট এবং সম্পূর্ণ সিস্টেমের কনফিগারেশন সরাসরি পরিচালনা করতে পারবেন।
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 block font-bold">সার্ভার স্ট্যাটাস</span>
                    <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ১০০% সচল ও সক্রিয়
                    </span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 block font-bold">এআই কোয়েশ্চেন ইঞ্জিন</span>
                    <span className="text-sm font-black text-purple-400 flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      অনলাইন রেডি
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-blue-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">নিবন্ধিত অভিভাবক</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{parentsList.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">সক্রিয় অভিভাবক ডিরেক্টরি</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-indigo-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">মোট আয়োজিত পরীক্ষা</span>
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{allTests.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">প্লাটফর্মে তৈরি পরীক্ষা</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">জমাকৃত খাতা</span>
                  <FileCheck className="w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {allTests.filter(t => t.status === 'submitted' || t.status === 'reviewed').length}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">শিক্ষার্থীর উত্তরপত্র</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">প্রতিষ্ঠান পেপারস</span>
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{institutionPapers.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">স্কুল ও বোর্ড টেস্ট পেপার</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-rose-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">সিকিউরিটি ফ্ল্যাগস</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-rose-400">{flaggedTests.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">অসদুপায় চেষ্টার রেকর্ড</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-teal-400 mb-2">
                  <span className="text-xs font-bold text-slate-400">সার্ভার আপটাইম</span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {Math.floor(stats.serverUptimeSeconds / 60)} মিনিট
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1">নিরবচ্ছিন্ন সচল</span>
              </div>

            </div>

            {/* Quick Action Matrix for Admin */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>সুপার-অ্যাডমিন কুইক কন্ট্রোল টুলস</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <button
                  type="button"
                  onClick={() => setShowBulkUploadModal(true)}
                  className="p-4 rounded-2xl bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 text-left transition-all cursor-pointer group"
                >
                  <Building2 className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-sm">নতুন টেস্ট পেপার আপলোড</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ক্যাডেট কলেজ ও নামকরা স্কুলের প্রশ্নপত্র সফট কপি বাল্ক পেস্ট করুন
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 text-left transition-all cursor-pointer group"
                >
                  <Users className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-sm">অভিভাবক অ্যাকাউন্ট পরিচালনা</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    পাসওয়ার্ড রিসেট, সাসপেনশন বা পরীক্ষা রেকর্ড ইনস্পেক্ট করুন
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notice')}
                  className="p-4 rounded-2xl bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 text-left transition-all cursor-pointer group"
                >
                  <Radio className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-sm">প্ল্যাটফর্ম নোটিশ ব্রডকাস্ট</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    সকল শিক্ষার্থীর স্ক্রিনে জরুরি ঘোষণা বা অ্যালার্ট ব্যানার দিন
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="p-4 rounded-2xl bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/50 text-left transition-all cursor-pointer group"
                >
                  <Database className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-sm">সম্পূর্ণ ডাটাবেজ ব্যাকআপ</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    এক ক্লিকে সমস্ত পরীক্ষা, সাবমিশন ও ব্যবহারকারীর JSON এক্সপোর্ট
                  </p>
                </button>

              </div>
            </div>

            {/* Recent Submissions Ticker */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>সাম্প্রতিক পরীক্ষার কার্যক্রম ও উত্তরপত্র</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>সকল পরীক্ষা দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {allTests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  কোনো পরীক্ষা রেকর্ড পাওয়া যায়নি
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">পিন (PIN)</th>
                        <th className="pb-3 font-bold">পরীক্ষার নাম ও বিষয়</th>
                        <th className="pb-3 font-bold">অভিভাবক ফোন</th>
                        <th className="pb-3 font-bold">প্রশ্ন সংখ্যা</th>
                        <th className="pb-3 font-bold">স্ট্যাটাস</th>
                        <th className="pb-3 font-bold text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {allTests.slice(0, 5).map(t => (
                        <tr key={t.id || t.pin} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-mono font-bold text-amber-400">
                            {t.pin || 'N/A'}
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-white block truncate max-w-xs">{t.title}</span>
                            <span className="text-[11px] text-slate-400">{t.subject} • {t.chapter || ''}</span>
                          </td>
                          <td className="py-3 text-slate-300">
                            {t.parentPhone || 'অজানা'}
                          </td>
                          <td className="py-3 text-slate-300">
                            {t.questions?.length || t.questionCount || 0}টি
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'reviewed' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : t.status === 'submitted'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-700/40 text-slate-400'
                            }`}>
                              {t.status === 'reviewed' ? 'মূল্যায়িত' : t.status === 'submitted' ? 'জমা দেওয়া' : 'চলমান'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExamForInspect(t);
                                setInspectMode('questions');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              ইনস্পেক্ট
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CENTRAL QUESTION PAPERS (প্রতিষ্ঠান প্রশ্নব্যাংক) */}
        {/* ==================================================== */}
        {activeTab === 'papers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header & Actions */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>কেন্দ্রীয় প্রশ্নব্যাংক ও প্রতিষ্ঠান টেস্ট পেপারস</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ক্যাডেট কলেজ, মতিঝিল আইডিয়াল, ভিকারুননিসা, রাজউক ও শিক্ষা বোর্ডের প্রশ্নপত্র সংরক্ষণ ও পরিচালনা
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowVisionModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ছবি/পিডিএফ এআই ভিশন কনভার্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBulkUploadModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>বাল্ক টেক্সট পেস্ট</span>
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paperSearchQuery}
                onChange={(e) => setPaperSearchQuery(e.target.value)}
                placeholder="প্রতিষ্ঠানের নাম, বিষয়, সাল বা শ্রেণি দিয়ে সার্চ করুন..."
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Paper Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPapers.map(paper => (
                <div 
                  key={paper.id} 
                  className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                        {paper.year} • {paper.studentClass}
                      </span>
                      <span className="text-[11px] text-amber-400 font-bold">
                        {paper.examType}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">
                      {paper.institutionName}
                    </h3>

                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {paper.subject} {paper.districtOrBoard ? `(${paper.districtOrBoard})` : ''}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                      <span>📝 প্রশ্ন: <strong>{paper.questions?.length || 0}টি</strong></span>
                      <span>⏱️ সময়: <strong>{paper.durationMinutes} মি.</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        alert(`প্রশ্ন সংখ্যা: ${paper.questions?.length}\nপ্রথম প্রশ্ন: ${paper.questions?.[0]?.question || 'N/A'}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`আপনি কি "${paper.institutionName}" এর প্রশ্নপত্রটি মুছে ফেলতে চান?`)) {
                          deleteInstitutionPaper(paper.id);
                          setInstitutionPapers(prev => prev.filter(p => p.id !== paper.id));
                          showToast('প্রতিষ্ঠান প্রশ্নপত্র মুছে ফেলা হয়েছে');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: USER & ACCOUNT MANAGEMENT (অভিভাবক ও শিক্ষার্থী) */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>অভিভাবক ও শিক্ষার্থী অ্যাকাউন্ট নিয়ন্ত্রণ</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  প্ল্যাটফর্মে নিবন্ধিত অভিভাবকদের স্ট্যাটাস, পাসওয়ার্ড রিসেট ও অ্যাক্টিভিটি রিপোর্ট
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                মোট অ্যাকাউন্ট: {parentsList.length}টি
              </span>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="মোবাইল নম্বর, অভিভাবকের নাম বা সন্তানের নাম দিয়ে সার্চ করুন..."
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Parents Directory Table */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">অভিভাবকের নাম ও মোবাইল</th>
                      <th className="py-3 px-4 font-bold">সন্তানের বিবরণ</th>
                      <th className="py-3 px-4 font-bold">তৈরি করা পরীক্ষা</th>
                      <th className="py-3 px-4 font-bold">স্ট্যাটাস</th>
                      <th className="py-3 px-4 font-bold">যোগদানের তারিখ</th>
                      <th className="py-3 px-4 font-bold text-right">কন্ট্রোল ও অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredParents.map(parent => (
                      <tr key={parent.phone} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm">{parent.name}</span>
                          <span className="font-mono text-emerald-400 text-xs font-semibold">{parent.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {parent.childName ? (
                            <>
                              <span className="font-semibold block">{parent.childName}</span>
                              <span className="text-[11px] text-slate-400">{parent.childClass || 'শ্রেণি উল্লেখ নেই'}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 italic">তথ্য নেই</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-purple-300 block text-sm">
                            {allTests.filter(t => t.parentPhone === parent.phone).length}টি
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            parent.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {parent.status === 'active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(parent.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setParentToResetPass(parent);
                                setNewPasswordInput('');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold transition-colors cursor-pointer"
                              title="পাসওয়ার্ড রিসেট করুন"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Suspend / Activate Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleParentStatus(parent)}
                              className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                                parent.status === 'active'
                                  ? 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-300'
                                  : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300'
                              }`}
                              title={parent.status === 'active' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'অ্যাকাউন্ট সক্রিয় করুন'}
                            >
                              {parent.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete User Button */}
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`আপনি কি সত্যিই অভিভাবক ${parent.phone} এর অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
                                  await fetch(`/api/admin/parents/${parent.phone}`, { method: 'DELETE' });
                                  setParentsList(prev => prev.filter(p => p.phone !== parent.phone));
                                  showToast('অভিভাবক অ্যাকাউন্ট মুছে ফেলা হয়েছে');
                                }
                              }}
                              className="p-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer"
                              title="অ্যাকাউন্ট ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: GLOBAL EXAMS & ANSWER SHEETS MONITOR           */}
        {/* ==================================================== */}
        {activeTab === 'exams' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>গ্লোবাল পরীক্ষা ও উত্তরপত্র মনিটর</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  প্ল্যাটফর্মের সকল পরীক্ষার পিন অনুসন্ধান, খাতা নিরীক্ষা, মার্কস ও মন্তব্য ওভাররাইড
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExamStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    examStatusFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  সকল ({allTests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExamStatusFilter('submitted')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    examStatusFilter === 'submitted' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  জমা খাতা ({allTests.filter(t => t.status === 'submitted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setExamStatusFilter('reviewed')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    examStatusFilter === 'reviewed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  মূল্যায়িত ({allTests.filter(t => t.status === 'reviewed').length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={examSearchQuery}
                onChange={(e) => setExamSearchQuery(e.target.value)}
                placeholder="৬-সংখ্যার পিন (PIN), পরীক্ষার নাম, বিষয় বা অভিভাবক ফোন দিয়ে সার্চ করুন..."
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Exams Table */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">পিন (PIN)</th>
                      <th className="py-3 px-4 font-bold">পরীক্ষার নাম ও বিষয়</th>
                      <th className="py-3 px-4 font-bold">অভিভাবক ফোন</th>
                      <th className="py-3 px-4 font-bold">প্রশ্ন সংখ্যা</th>
                      <th className="py-3 px-4 font-bold">স্ট্যাটাস ও স্কোর</th>
                      <th className="py-3 px-4 font-bold">তৈরির তারিখ</th>
                      <th className="py-3 px-4 font-bold text-right">সুপার-অ্যাডমিন অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredTests.map(test => (
                      <tr key={test.id || test.pin} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-amber-400 text-sm">
                          {test.pin || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm">{test.title}</span>
                          <span className="text-[11px] text-slate-400">{test.subject} • {test.chapter || ''}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {test.parentPhone || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {test.questions?.length || test.questionCount || 0}টি
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              test.status === 'reviewed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : test.status === 'submitted'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-700/40 text-slate-400'
                            }`}>
                              {test.status === 'reviewed' ? 'মূল্যায়িত' : test.status === 'submitted' ? 'জমা দেওয়া' : 'চলমান'}
                            </span>
                            {test.score !== undefined && (
                              <span className="font-black text-amber-300">
                                {test.score}/{test.questions?.length || test.questionCount || 0}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Inspect Questions */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExamForInspect(test);
                                setInspectMode('questions');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="প্রশ্নপত্র ও উত্তরমালা দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>প্রশ্নমালা</span>
                            </button>

                            {/* View Submission & Evaluation if submitted */}
                            {(test.status === 'submitted' || test.status === 'reviewed') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedExamForInspect(test);
                                  setInspectMode('submission');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="জমা দেওয়া খাতা নিরীক্ষা"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                                <span>খাতা</span>
                              </button>
                            )}

                            {/* Delete Exam Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteExam(test.pin || test.id)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer"
                              title="পরীক্ষা চিরতরে মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: PROCTORING SECURITY & AUDIT HUB                */}
        {/* ==================================================== */}
        {activeTab === 'proctoring' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span>অ্যান্টি-চিট ও প্রক্টরিং সিকিউরিটি অডিট</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  শিক্ষার্থীদের পরীক্ষার সময় ঘটা ট্যাব পরিবর্তন, ফুলস্ক্রিন এক্সিট ও ক্যামেরা সংক্রান্ত নিরাপত্তা লঙ্ঘন লগ
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-600/20 text-rose-300 text-xs font-black border border-rose-500/30">
                চিহ্নিত ভায়োলেশন: {flaggedTests.length}টি পরীক্ষা
              </span>
            </div>

            {flaggedTests.length === 0 ? (
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">কোনো নিরাপত্তা লঙ্ঘন পাওয়া যায়নি!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  শিক্ষার্থীরা নিয়ম মেনে ফুলস্ক্রিন ও ক্যামেরা অন রেখে পরীক্ষা সম্পন্ন করেছে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flaggedTests.map(test => (
                  <div key={test.id || test.pin} className="bg-[#0f172a] border border-rose-900/40 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        PIN: {test.pin}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                        {test.proctoringFlags?.length || 0}টি সতর্কতা
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base">{test.title}</h4>
                      <p className="text-xs text-slate-400">{test.subject} • পরীক্ষার্থী: {test.studentName || 'নামবিহীন'}</p>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs text-rose-300">
                      <p className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">রেকর্ড হওয়া লঙ্ঘনসমূহ:</p>
                      {test.proctoringFlags?.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExamForInspect(test);
                          setInspectMode('submission');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        সম্পূর্ণ খাতা পরীক্ষা
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি এই পরীক্ষার স্কোর শূন্য করতে চান?')) {
                            test.score = 0;
                            saveStoredTests(allTests.map(t => t.id === test.id ? test : t));
                            showToast('পরীক্ষার ফলাফল বাতিল করা হয়েছে');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        ফলাফল বাতিল করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: NOTICE BOARD & BROADCAST ENGINE                */}
        {/* ==================================================== */}
        {activeTab === 'notice' && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-3xl mx-auto">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">প্ল্যাটফর্ম নোটিশ ও ব্রডকাস্ট ইঞ্জিন</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    এখানে সেট করা নোটিশ সমস্ত অভিভাবক ও শিক্ষার্থীর স্ক্রিনে লাইভ ব্যানার হিসেবে প্রদর্শিত হবে
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveNotice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    নোটিশ সক্রিয় রাখুন?
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeForm.isActive}
                      onChange={(e) => setNoticeForm({ ...noticeForm, isActive: e.target.checked })}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-900"
                    />
                    <span className="text-sm font-semibold text-white">
                      {noticeForm.isActive ? '✅ বর্তমানে নোটিশ লাইভ সক্রিয় রয়েছে' : '❌ নোটিশ বন্ধ রয়েছে'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    নোটিশের ধরন (Type)
                  </label>
                  <div className="flex items-center gap-3">
                    {(['info', 'warning', 'alert'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNoticeForm({ ...noticeForm, type: t })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          noticeForm.type === t
                            ? t === 'info' ? 'bg-blue-600 text-white' : t === 'warning' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t === 'info' ? 'তথ্যমূলক (Info)' : t === 'warning' ? 'সতর্কতা (Warning)' : 'জরুরি অ্যালার্ট (Alert)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    নোটিশের শিরোনাম (Title)
                  </label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="যেমন: সার্ভার মেইনটেন্যান্স অথবা নতুন প্রশ্নব্যাংক আপডেট"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    বিস্তারিত বার্তা (Message)
                  </label>
                  <textarea
                    rows={3}
                    value={noticeForm.message}
                    onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                    placeholder="সম্পূর্ণ বিস্তারিত তথ্য লিখুন যা ব্যবহারকারীরা দেখতে পাবে..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Preview */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-2">লাইভ প্রিভিউ (ব্যবহারকারীরা যেভাবে দেখবে):</p>
                  <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                    noticeForm.type === 'alert'
                      ? 'bg-rose-950/80 border border-rose-700 text-rose-200'
                      : noticeForm.type === 'warning'
                      ? 'bg-amber-950/80 border border-amber-700 text-amber-200'
                      : 'bg-blue-950/80 border border-blue-700 text-blue-200'
                  }`}>
                    <Bell className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{noticeForm.title || 'শিরোনাম এখানে দেখাবে'}</h4>
                      <p className="text-xs mt-0.5 opacity-90">{noticeForm.message || 'বিস্তারিত বার্তা এখানে প্রদর্শিত হবে।'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all cursor-pointer"
                  >
                    নোটিশ সেভ ও লাইভ সম্প্রচার করুন
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: SYSTEM CONFIG, BACKUP & EMERGENCY              */}
        {/* ==================================================== */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
            
            {/* Maintenance Mode Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Power className={`w-5 h-5 ${maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span>প্ল্যাটফর্ম মেইনটেন্যান্স মোড</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    চালু করলে সাধারণ শিক্ষার্থী ও অভিভাবকগণ মেইনটেন্যান্স বার্তা দেখতে পাবেন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveMaintenance(!maintenanceMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    maintenanceMode
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {maintenanceMode ? '⚠️ মেইনটেন্যান্স সক্রিয়' : 'সিস্টেম সচল (Live)'}
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                দাপাঠশালার সমস্ত পরীক্ষা, প্রশ্নব্যাংক, শিক্ষার্থী ও অভিভাবকের তথ্য সমন্বিত একটি সিঙ্গেল JSON আর্কাইভে ডাউনলোড বা পূর্ববর্তী ব্যাকআপ ফাইল আপলোড করে এক ক্লিকে রিস্টোর করুন।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
                </button>
              </div>
            </div>

            {/* Change Admin PIN */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>সুপার-অ্যাডমিন মাস্টার পিন পরিবর্তন</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                বর্তমানে সক্রিয় অ্যাডমিন পিন: <strong className="text-amber-400 font-mono">{currentAdminPin}</strong> (লোগোতে ২০ ক্লিকের পর এই পিন চাওয়া হবে)
              </p>

              <form onSubmit={handleUpdateAdminPin} className="flex items-center gap-3 max-w-md">
                <input
                  type="text"
                  value={newAdminPinInput}
                  onChange={(e) => setNewAdminPinInput(e.target.value)}
                  placeholder="নতুন ৪-সংখ্যার পিন লিখুন"
                  maxLength={8}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  পিন সেভ করুন
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* EXAM INSPECT MODAL (Question Bank / Submission Review)   */}
      {/* ======================================================== */}
      {selectedExamForInspect && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono font-bold block">
                  PIN: {selectedExamForInspect.pin}
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedExamForInspect.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExamForInspect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch inside inspect modal */}
            <div className="flex items-center border-b border-slate-800 px-5 pt-2 gap-4">
              <button
                type="button"
                onClick={() => setInspectMode('questions')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inspectMode === 'questions' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                প্রশ্নমালা ও সঠিক উত্তর ({selectedExamForInspect.questions?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setInspectMode('submission')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inspectMode === 'submission' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                জমা দেওয়া উত্তরপত্র ও মূল্যায়ন
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {inspectMode === 'questions' ? (
                <div className="space-y-4">
                  {selectedExamForInspect.questions?.map((q, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <p className="font-bold text-white text-sm">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        {q.options?.map((opt, oIdx) => (
                          <div 
                            key={oIdx}
                            className={`p-2 rounded-lg border ${
                              opt === q.correctAnswer || (q.correctAnswerIndex !== undefined && oIdx === q.correctAnswerIndex)
                                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-bold'
                                : 'bg-slate-800/40 border-slate-800'
                            }`}
                          >
                            <span>{['ক', 'খ', 'গ', 'ঘ'][oIdx]}. {opt}</span>
                            {(opt === q.correctAnswer || (q.correctAnswerIndex !== undefined && oIdx === q.correctAnswerIndex)) && (
                              <span className="ml-1 text-[10px] text-emerald-400">(সঠিক উত্তর)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-amber-300/80 pt-1">
                          💡 ব্যাখ্যা: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">প্রাপ্ত স্কোর:</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {selectedExamForInspect.score !== undefined ? selectedExamForInspect.score : 'মূল্যায়ন অপেক্ষমাণ'} / {selectedExamForInspect.questions?.length || 0}
                      </span>
                    </div>
                    {selectedExamForInspect.parentComment && (
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-bold">অভিভাবকের মন্তব্য:</span>
                        <span className="text-xs text-slate-200 italic">"{selectedExamForInspect.parentComment}"</span>
                      </div>
                    )}
                  </div>

                  {selectedExamForInspect.questions?.map((q, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                      <p className="font-bold text-white text-sm">{idx + 1}. {q.question}</p>
                      <div className="text-xs flex items-center gap-4">
                        <span className="text-slate-400">শিক্ষার্থীর উত্তর: <strong className={q.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{q.studentAnswer || 'উত্তর দেয়নি'}</strong></span>
                        <span className="text-slate-400">সঠিক উত্তর: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedExamForInspect(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PARENT PASSWORD RESET MODAL                              */}
      {/* ======================================================== */}
      {parentToResetPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>পাসওয়ার্ড রিসেট করুন</span>
            </h3>
            <p className="text-xs text-slate-400">
              অভিভাবক: <strong>{parentToResetPass.name} ({parentToResetPass.phone})</strong> এর জন্য নতুন পাসওয়ার্ড দিন।
            </p>

            <input
              type="text"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParentToResetPass(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExecutePasswordReset}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INSTITUTION BULK PASTE MODAL                             */}
      {/* ======================================================== */}
      <AdminPaperBulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => {
          setShowBulkUploadModal(false);
          setInstitutionPapers(getStoredInstitutionPapers());
        }}
      />

      {/* ======================================================== */}
      {/* AI VISION QUESTION CONVERTER & VERIFICATION MODAL        */}
      {/* ======================================================== */}
      <AdminAIVisionQuestionModal
        isOpen={showVisionModal}
        onClose={() => {
          setShowVisionModal(false);
        }}
        onSavedSuccess={() => {
          setInstitutionPapers(getStoredInstitutionPapers());
          showToast('নতুন প্রশ্নপত্র সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে');
        }}
      />

    </div>
  );
};
