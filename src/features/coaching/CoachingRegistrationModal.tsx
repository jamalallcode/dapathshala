import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  Palette,
  Layers,
  FileCheck2,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { CoachingProfile } from './types';
import { BD_DIVISIONS, BD_DISTRICTS, PRESET_LOGOS, CURRICULUM_OPTIONS } from './coachingConstants';

interface CoachingRegistrationModalProps {
  initialProfile?: CoachingProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: CoachingProfile) => void;
  isFirstTime?: boolean;
}

export const CoachingRegistrationModal: React.FC<CoachingRegistrationModalProps> = ({
  initialProfile,
  isOpen,
  onClose,
  onSave,
  isFirstTime = false
}) => {
  const [formData, setFormData] = useState<CoachingProfile>(
    initialProfile || {
      id: 'c-' + Date.now(),
      name: '',
      tagline: 'মেধা ও সাফল্যের আলোকবর্তিকা',
      logo: '🎓',
      themeColor: '#059669',
      eiinNumber: '',
      phone: '',
      email: '',
      division: 'ঢাকা',
      district: 'ঢাকা',
      address: '',
      branchesCount: 1,
      studentCapacity: 200,
      curriculumLevels: ['এসএসসি বিজ্ঞান বিভাগ', 'এইচএসসি বিজ্ঞান বিভাগ'],
      subdomain: '',
      foundedYear: '২০২০',
      registeredAt: new Date().toISOString().split('T')[0]
    }
  );

  const [activeTab, setActiveTab] = useState<'info' | 'branding' | 'academic' | 'preview'>('info');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleDivisionChange = (division: string) => {
    const districts = BD_DISTRICTS[division] || ['ঢাকা'];
    setFormData(prev => ({
      ...prev,
      division,
      district: districts[0] || 'ঢাকা'
    }));
  };

  const handleCurriculumToggle = (level: string) => {
    setFormData(prev => {
      const exists = prev.curriculumLevels.includes(level);
      return {
        ...prev,
        curriculumLevels: exists
          ? prev.curriculumLevels.filter(l => l !== level)
          : [...prev.curriculumLevels, level]
      };
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFormData(prev => ({ ...prev, logo: loadEvt.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('অনুগ্রহ করে কোচিং সেন্টারের নাম লিখুন');
      return;
    }

    const finalSubdomain = formData.subdomain.trim() 
      ? formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : formData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 20);

    const updatedProfile = {
      ...formData,
      subdomain: finalSubdomain
    };

    onSave(updatedProfile);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  const availableDistricts = BD_DISTRICTS[formData.division] || ['ঢাকা'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 size={16} />
            {isFirstTime ? 'নতুন কোচিং সেন্টার সাইন-আপ ও অনবোর্ডিং' : 'কোচিং প্রোফাইল ও ব্র্যান্ডিং কনফিগারেশন'}
          </div>
          <h2 className="text-2xl font-black text-white">
            {isFirstTime ? 'আপনার কোচিং সেন্টারের ডিজিটাল পাঠশালা চালু করুন' : 'কোচিং সেন্টারের ব্র্যান্ডিং ও তথ্য হালনাগাদ'}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            আপনার প্রতিষ্ঠান নাম, লোগো, ঠিকানা ও শিক্ষার্থীর ধারণক্ষমতা দিয়ে তৈরি করুন আধুনিক স্মার্ট ব্র্যান্ড।
          </p>
        </div>

        {/* Wizard Step Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
          {[
            { id: 'info', label: '১. মৌলিক তথ্য ও যোগাযোগ' },
            { id: 'branding', label: '২. লোগো ও ব্র্যান্ড কালার' },
            { id: 'academic', label: '৩. শিক্ষা প্রোগ্রাম ও ধারণক্ষমতা' },
            { id: 'preview', label: '৪. লাইভ ব্র্যান্ড প্রিভিউ' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-800 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* STEP 1: Basic Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কোচিং সেন্টারের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: মেধা একাডেমি ও কোচিং হোম"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্লোগান / ট্যাগলাইন
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="যেমন: সততা ও মেধার অনন্য মেলবন্ধন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রতিষ্ঠা সাল
                  </label>
                  <input
                    type="text"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    placeholder="যেমন: ২০১৮"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    গভঃ রেজিস্ট্রেশন / EIIN নং (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.eiinNumber}
                    onChange={(e) => setFormData({ ...formData, eiinNumber: e.target.value })}
                    placeholder="যেমন: REG-DH-2024-89"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিভাগ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    {BD_DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জেলা <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    {availableDistricts.map(dst => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পূর্ণাঙ্গ ক্যাম্পাস ঠিকানা <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="বাড়ি নং, রোড নং, এলাকা (যেমন: বাড়ি নং ৪২, রোড ৭, ধানমন্ডি, ঢাকা)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অফিসিয়াল মোবাইল / WhatsApp নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অফিসিয়াল ইমেইল
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@coaching.edu.bd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Branding & Logo */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  সেন্টারের অফিশিয়াল লোগো নির্বাচন অথবা আপলোড করুন
                </label>
                
                {/* Preset emblems */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                  {PRESET_LOGOS.map(logoItem => (
                    <button
                      key={logoItem.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: logoItem.icon })}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        formData.logo === logoItem.icon
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-3xl">{logoItem.icon}</span>
                      <span className="text-[11px] font-bold text-slate-700">{logoItem.text}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Image Upload / URL */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-3xl shadow-sm overflow-hidden">
                      {formData.logo.startsWith('data:') || formData.logo.startsWith('http') ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>{formData.logo}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">নিজস্ব লোগো ফাইল আপলোড</h4>
                      <p className="text-[11px] text-slate-500">PNG, JPG বা SVG (সর্বোচ্চ ২ মেগাবাইট)</p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-sm cursor-pointer">
                    <Upload size={14} className="text-emerald-600" />
                    <span>ডিভাইস থেকে ছবি আপলোড</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  প্রাতিষ্ঠানিক ব্র্যান্ড কালার
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'এমারেল্ড গ্রিন', code: '#059669' },
                    { label: 'রয়্যাল নীল', code: '#2563eb' },
                    { label: 'ইন্ডিগো ভায়োলেট', code: '#4f46e5' },
                    { label: 'মডার্ন টিল', code: '#0d9488' },
                    { label: 'রুবি রেড', code: '#e11d48' },
                    { label: 'গোল্ডেন আম্বার', code: '#d97706' },
                    { label: 'ডার্ক স্লেট', code: '#334155' }
                  ].map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setFormData({ ...formData, themeColor: c.code })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formData.themeColor === c.code 
                          ? 'border-slate-900 bg-slate-100 shadow-sm ring-2 ring-slate-400' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: c.code }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subdomain Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অনলাইন পোর্টাল লিংক / সাবডোমেইন
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-slate-50 text-sm">
                  <span className="px-3.5 py-2.5 text-slate-500 font-mono text-xs border-r border-slate-300">
                    dapathshala.com/c/
                  </span>
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="medha-academy"
                    className="flex-1 px-3.5 py-2.5 bg-white font-mono text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Programs & Capacity */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোট শিক্ষার্থী ধারণক্ষমতা
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={formData.studentCapacity}
                    onChange={(e) => setFormData({ ...formData, studentCapacity: parseInt(e.target.value) || 100 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাম্পাস / ব্রাঞ্চ সংখ্যা
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.branchesCount}
                    onChange={(e) => setFormData({ ...formData, branchesCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  পাঠদানকৃত পাঠ্যক্রম ও কোর্সসমূহ নির্বাচন করুন
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CURRICULUM_OPTIONS.map(opt => {
                    const checked = formData.curriculumLevels.includes(opt);
                    return (
                      <label 
                        key={opt}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-3 cursor-pointer transition-all ${
                          checked 
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCurriculumToggle(opt)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-500">
                এই বিবরণগুলো শিক্ষার্থীদের অ্যাডমিট কার্ড, বেতন রশিদ ও ড্যাশবোর্ড হেডারে প্রদর্শিত হবে:
              </div>

              {/* Sample Header Preview */}
              <div 
                className="p-6 rounded-2xl text-white shadow-lg space-y-2"
                style={{ backgroundColor: formData.themeColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    {formData.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{formData.name || 'কোচিং সেন্টারের নাম'}</h3>
                    <p className="text-xs text-white/80">{formData.tagline}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/20 flex flex-wrap gap-4 text-[11px] text-white/90">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {formData.address || 'ঠিকানা'}, {formData.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {formData.phone || '017XXXXXXXX'}
                  </span>
                </div>
              </div>

              {/* Sample Digital Receipt Mockup */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-700">ডিজিটাল মানি রিসিট হেডার ভিউ</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">লাইভ ফরম্যাট</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-2xl mb-1">{formData.logo}</div>
                  <h4 className="font-black text-slate-900 text-sm">{formData.name || 'মেধা একাডেমি'}</h4>
                  <p className="text-[11px] text-slate-500">{formData.address || 'ক্যাম্পাস রোড, ঢাকা'}</p>
                  <p className="text-[10px] text-slate-400">EIIN/রেজিস্ট্রেশন: {formData.eiinNumber || 'REG-PENDING'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Toast / status notification */}
          {showSavedToast && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              কোচিং সেন্টারের প্রোফাইল ও ব্র্যান্ডিং তথ্য সফলভাবে সংরক্ষিত হয়েছে!
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-5 mt-6">
            <div className="flex gap-2">
              {activeTab !== 'info' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'branding') setActiveTab('info');
                    if (activeTab === 'academic') setActiveTab('branding');
                    if (activeTab === 'preview') setActiveTab('academic');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  পূর্ববর্তী ধাপ
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>

              {activeTab !== 'preview' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'info') setActiveTab('branding');
                    else if (activeTab === 'branding') setActiveTab('academic');
                    else if (activeTab === 'academic') setActiveTab('preview');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-sm"
                >
                  পরবর্তী ধাপ
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 size={16} />
                  <span>তথ্য ও ব্র্যান্ডিং সংরক্ষণ করুন</span>
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
