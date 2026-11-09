import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  Save,
  KeyRound,
  Sliders,
  Camera,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { 
  getCurrentParent, 
  updateParentProfile, 
  changeParentPassword, 
  ParentUser 
} from '../../lib/parentAuth';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'password' | 'preferences';
  onLogoutSuccess?: () => void;
  onProfileUpdated?: (user: ParentUser) => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  onLogoutSuccess,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>(initialTab);
  const [parent, setParent] = useState<ParentUser | null>(null);

  // Form states - Profile
  const [parentName, setParentName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [childName, setChildName] = useState('');
  const [childClass, setChildClass] = useState('৮ম শ্রেণি');
  
  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states - Preferences
  const [defaultDuration, setDefaultDuration] = useState(15);
  const [proctoringStrictness, setProctoringStrictness] = useState<'standard' | 'high'>('standard');
  const [proctoringLevel, setProctoringLevel] = useState<1 | 2 | 3 | 4>(2);

  // Status & Feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      const current = getCurrentParent();
      setParent(current);
      if (current) {
        setParentName(current.name || '');
        setAvatar(current.avatar);
        setChildName(current.childName || '');
        setChildClass(current.childClass || '৮ম শ্রেণি');
        setDefaultDuration(current.defaultDurationMinutes || 15);
        setProctoringStrictness(current.proctoringStrictness || 'standard');
        const storedLevel = (current.proctoringLevel || Number(localStorage.getItem('dapathshala_parent_proctoring_level')) || 2) as 1 | 2 | 3 | 4;
        setProctoringLevel(storedLevel);
      }
      setMessage(null);
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = updateParentProfile({
      name: parentName.trim(),
      avatar: avatar,
      childName: childName.trim(),
      childClass: childClass
    });

    setIsSubmitting(false);
    if (res.success && res.user) {
      setParent(res.user);
      onProfileUpdated?.(res.user);
      setMessage({ type: 'success', text: 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    } else {
      setMessage({ type: 'error', text: res.error || 'সংরক্ষণ ব্যর্থ হয়েছে' });
    }
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = changeParentPassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    } else {
      setMessage({ type: 'error', text: res.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' });
    }
  };

  // Handle Preferences Update
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    localStorage.setItem('dapathshala_parent_proctoring_level', String(proctoringLevel));
    const res = updateParentProfile({
      defaultDurationMinutes: defaultDuration,
      proctoringStrictness: proctoringLevel >= 3 ? 'high' : 'standard',
      proctoringLevel: proctoringLevel
    });

    setIsSubmitting(false);
    if (res.success && res.user) {
      setParent(res.user);
      onProfileUpdated?.(res.user);
      setMessage({ type: 'success', text: 'পরীক্ষা প্রেফারেন্স সফলভাবে সংরক্ষিত হয়েছে!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    } else {
      setMessage({ type: 'error', text: res.error || 'সংরক্ষণ ব্যর্থ হয়েছে' });
    }
  };

  const classList = [
    '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি',
    '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি',
    'একাদশ শ্রেণি', 'দ্বাদশ শ্রেণি / এইচএসসি'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto max-h-[calc(100dvh-2rem)] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 shrink-0" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                অভিভাবক অ্যাকাউন্ট সেটিংস
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                প্রোফাইল সংশোধন, পাসওয়ার্ড ও নিরাপত্তা ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`mx-5 sm:mx-6 mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-5 sm:px-6 pt-2 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>প্রোফাইল</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('password'); setMessage(null); }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>পাসওয়ার্ড</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('preferences'); setMessage(null); }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>প্রক্টরিং লেভেল (১-৪) ও প্রেফারেন্স</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Photo Upload */}
              <div className="space-y-1.5 pb-1">
                <label className="block text-xs font-bold text-slate-700">
                  অভিভাবকের প্রোফাইল ছবি
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400/60 flex items-center justify-center shrink-0 shadow-xs">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-base select-none">
                        {parentName.trim() ? parentName.trim().charAt(0).toUpperCase() : 'অ'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{avatar ? 'ছবি পরিবর্তন' : 'কম্পিউটার থেকে ছবি দিন'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const maxDim = 256;
                              let width = img.width;
                              let height = img.height;
                              if (width > height) {
                                if (width > maxDim) {
                                  height = Math.round((height * maxDim) / width);
                                  width = maxDim;
                                }
                              } else {
                                if (height > maxDim) {
                                  width = Math.round((width * maxDim) / height);
                                  height = maxDim;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              const compressed = canvas.toDataURL('image/jpeg', 0.85);
                              setAvatar(compressed);
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar(undefined)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="ছবি মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Phone (Read Only with badge) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  নিবন্ধিত মোবাইল নম্বর
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{parent?.phone || '০১৭XXXXXXXX'}</span>
                  <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    ✓ ভেরিফাইড অ্যাকাউন্ট
                  </span>
                </div>
              </div>

              {/* Parent Name */}
              <div className="space-y-1">
                <label htmlFor="settings-parent-name" className="block text-xs font-bold text-slate-700">
                  অভিভাবকের পূর্ণ নাম
                </label>
                <input
                  id="settings-parent-name"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="যেমন: জামাল উদ্দিন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold outline-hidden text-slate-900 transition-all"
                />
              </div>

              {/* Child's Name */}
              <div className="space-y-1">
                <label htmlFor="settings-child-name" className="block text-xs font-bold text-slate-700">
                  সন্তানের নাম
                </label>
                <input
                  id="settings-child-name"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="যেমন: আরিয়ান"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold outline-hidden text-slate-900 transition-all"
                />
              </div>

              {/* Child's Class */}
              <div className="space-y-1">
                <label htmlFor="settings-child-class" className="block text-xs font-bold text-slate-700">
                  সন্তানের বর্তমান শ্রেণি
                </label>
                <div className="relative">
                  <select
                    id="settings-child-class"
                    value={childClass}
                    onChange={(e) => setChildClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-bold outline-hidden text-slate-900 appearance-none cursor-pointer"
                  >
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল আপডেট সংরক্ষণ করুন'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  বর্তমান পাসওয়ার্ড <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold outline-hidden text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  নতুন পাসওয়ার্ড <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold outline-hidden text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  কমপক্ষে ৪ অক্ষর বা সংখ্যার শক্তিশালী পাসওয়ার্ড দিন।
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'নতুন পাসওয়ার্ড নিশ্চিত করুন'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: EXAM PREFERENCES */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-4">
              
              {/* Default Duration */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ডিফল্ট পরীক্ষার সময়সীমা
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDefaultDuration(mins)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        defaultDuration === mins
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins} মিনিট
                    </button>
                  ))}
                </div>
              </div>

              {/* Proctoring Strictness Level (4 Levels: 1, 2, 3, 4) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    লাইভ প্রক্টরিং নজরদারির কঠোরতার মাত্রা (মোট ৪টি লেভেল)
                  </label>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    লেভেল {proctoringLevel === 1 ? '১ (মৃদু)' : proctoringLevel === 2 ? '২ (মাঝারি)' : proctoringLevel === 3 ? '৩ (কঠোর)' : '৪ (সর্বোচ্চ)'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {[
                    {
                      level: 1,
                      title: 'লেভেল ১: মৃদু (সহনশীল)',
                      desc: 'বড় ধরনের মাথা ঘোরানো বা সম্পূর্ণ অনুপস্থিতি সনাক্ত করবে। ছোটখাটো আড় চোখের নড়াচড়ায় ছাড় থাকবে।'
                    },
                    {
                      level: 2,
                      title: 'লেভেল ২: মাঝারি (স্ট্যান্ডার্ড)',
                      desc: 'স্বাভাবিক পরীক্ষা প্রোটোকল। মাথা সামান্য ঘোরালে বা চোখ সরালে সতর্ক করবে।'
                    },
                    {
                      level: 3,
                      title: 'লেভেল ৩: কঠোর (আড় চোখ সনাক্ত)',
                      desc: 'সোজা বসে আড় চোখে এদিক-সেদিক তাকালে এবং বই বা নোটের দিকে দৃষ্টি সামান্য সরালেই সতর্ক করবে।'
                    },
                    {
                      level: 4,
                      title: 'লেভেল ৪: সর্বোচ্চ কঠোর (অতি-সংবেদনশীল)',
                      desc: 'সামান্যতম আড় চোখে তাকানো বা চোখের মণি কর্নারে নেওয়ার সাথে সাথেই তাৎক্ষণিক সতর্ক করা হবে।'
                    }
                  ].map((item) => (
                    <label
                      key={item.level}
                      onClick={() => setProctoringLevel(item.level as 1 | 2 | 3 | 4)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                        proctoringLevel === item.level
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="proctoringLevelChoice"
                        checked={proctoringLevel === item.level}
                        onChange={() => setProctoringLevel(item.level as 1 | 2 | 3 | 4)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${proctoringLevel === item.level ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'প্রেফারেন্স সংরক্ষণ করুন'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
