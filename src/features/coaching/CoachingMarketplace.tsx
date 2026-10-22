import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  GraduationCap, 
  Users, 
  Filter, 
  CheckCircle2, 
  BadgeCheck, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Building2, 
  SlidersHorizontal,
  ChevronRight,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MarketplaceCoaching, AdmissionLead } from './marketplaceTypes';
import { 
  SAMPLE_MARKETPLACE_COACHINGS, 
  BANGLADESH_DIVISIONS, 
  POPULAR_PROGRAMS, 
  POPULAR_SUBJECTS 
} from './marketplaceData';
import { CoachingDetailModal } from './CoachingDetailModal';
import { AdmissionModal } from './AdmissionModal';
import { CoachingProfile } from './types';

interface CoachingMarketplaceProps {
  onOpenCoachingDashboard?: () => void;
}

export const CoachingMarketplace: React.FC<CoachingMarketplaceProps> = ({
  onOpenCoachingDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('সব বিভাগ');
  const [selectedArea, setSelectedArea] = useState('সকল এলাকা');
  const [selectedProgram, setSelectedProgram] = useState('সকল প্রোগ্রাম');
  const [selectedSubject, setSelectedSubject] = useState('সব বিষয়');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'price_low' | 'price_high'>('rating');
  const [selectedCoachingForDetail, setSelectedCoachingForDetail] = useState<MarketplaceCoaching | null>(null);
  const [selectedCoachingForApply, setSelectedCoachingForApply] = useState<MarketplaceCoaching | null>(null);
  const [appliedSuccessToast, setAppliedSuccessToast] = useState<string | null>(null);

  const POPULAR_AREAS = [
    'সকল এলাকা',
    'ফার্মগেট',
    'ধানমন্ডি',
    'উত্তরা',
    'মিরপুর',
    'চকবাজার',
    'বোয়ালিয়া'
  ];

  // Check if current user has a custom registered coaching in localStorage
  const registeredProfile: CoachingProfile | null = useMemo(() => {
    try {
      const saved = localStorage.getItem('dapathshala_coaching_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  // Merge sample coachings with registered coaching if available
  const allCoachings = useMemo(() => {
    let list = [...SAMPLE_MARKETPLACE_COACHINGS];
    if (registeredProfile && registeredProfile.name) {
      const customExists = list.some(c => c.id === registeredProfile.id);
      if (!customExists) {
        const customCoaching: MarketplaceCoaching = {
          id: registeredProfile.id || 'custom-coaching',
          name: registeredProfile.name,
          tagline: registeredProfile.tagline || 'আধুনিক ডিজিটাল পাঠদান ও মানসম্মত শিক্ষা',
          logo: registeredProfile.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&h=120&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
          division: registeredProfile.division || 'ঢাকা',
          district: registeredProfile.district || 'ঢাকা',
          thana: registeredProfile.address?.split(',')[0] || 'ধানমন্ডি',
          address: registeredProfile.address || 'ঢাকা, বাংলাদেশ',
          phone: registeredProfile.phone || '০১৭০০০০০০০০',
          whatsapp: registeredProfile.phone || '০১৭০০০০০০০০',
          email: registeredProfile.email || 'coaching@dapathshala.com',
          foundedYear: registeredProfile.foundedYear || '২০২৪',
          rating: 4.9,
          reviewCount: 48,
          studentCount: registeredProfile.studentCapacity || 450,
          successRate: '৯৫% জিপিএ-৫ পাসের হার',
          programs: registeredProfile.curriculumLevels?.length ? registeredProfile.curriculumLevels : ['এইচএসসি বিজ্ঞান', 'এসএসসি বিজ্ঞান ও গণিত'],
          subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
          feeRange: '৳২,০০০ - ৳৩,৫০০ / মাস',
          featured: true,
          verified: true,
          facilities: ['ডিজিটাল লাইভ ক্লাস', 'ওএমআর এক্সাম সিস্টেম', 'অভিভাবক এসএমএস অ্যালার্ট', 'এসি ক্লাসরুম'],
          feeStructure: [
            {
              courseName: 'এইচএসসি ও বোর্ড ফাইনাল রিভিশন ব্যাচ',
              duration: '১০ মাস স্পেশাল',
              monthlyFee: 3000,
              admissionFee: 1500,
              features: ['বিজ্ঞান মূল বিষয়সমূহ', 'দৈনিক মডেল টেস্ট', 'সলভ শিট'],
              seatsAvailable: 25
            }
          ],
          teachers: [
            { name: 'অভিজ্ঞ মেন্টর প্যানেল', designation: 'প্রধান উপদেষ্টা', institution: 'বুয়েট ও ঢাকা বিশ্ববিদ্যালয়', experience: '৮+ বছর' }
          ],
          reviews: [
            { studentName: 'আরিফুল ইসলাম', college: 'সরকারি বিজ্ঞান কলেজ', rating: 5, date: '১ দিন আগে', comment: 'ডিজিটাল পাঠশালার সার্বিক কেয়ারিং খুব চমৎকার।' }
          ]
        };
        list = [customCoaching, ...list];
      }
    }
    return list;
  }, [registeredProfile]);

  // Filtered and sorted list
  const filteredCoachings = useMemo(() => {
    return allCoachings.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.thana.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.programs.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDivision = selectedDivision === 'সব বিভাগ' ? true : c.division === selectedDivision;
      const matchesArea = selectedArea === 'সকল এলাকা' ? true : (
        c.thana.toLowerCase().includes(selectedArea.toLowerCase()) ||
        c.address.toLowerCase().includes(selectedArea.toLowerCase())
      );
      const matchesProgram = selectedProgram === 'সকল প্রোগ্রাম' ? true : c.programs.includes(selectedProgram);
      const matchesSubject = selectedSubject === 'সব বিষয়' ? true : c.subjects.includes(selectedSubject);

      return matchesSearch && matchesDivision && matchesArea && matchesProgram && matchesSubject;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return b.studentCount - a.studentCount;
      const feeA = a.feeStructure[0]?.monthlyFee || 0;
      const feeB = b.feeStructure[0]?.monthlyFee || 0;
      if (sortBy === 'price_low') return feeA - feeB;
      if (sortBy === 'price_high') return feeB - feeA;
      return 0;
    });
  }, [allCoachings, searchQuery, selectedDivision, selectedArea, selectedProgram, selectedSubject, sortBy]);

  const handleLeadSubmitted = (lead: AdmissionLead) => {
    setAppliedSuccessToast(`ধন্যবাদ! "${lead.studentName}"-এর আবেদন "${lead.coachingName}"-এ সফলভাবে পৌঁছেছে।`);
    setTimeout(() => setAppliedSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast Alert */}
      {appliedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[130] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{appliedSuccessToast}</span>
        </div>
      )}

      {/* Hero Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles size={14} className="text-emerald-400" />
            <span>কোচিং মার্কেটপ্লেস ও স্টুডেন্ট অ্যাডমিশন ফাইন্ডার</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            আপনার এলাকায় সেরা কোচিং সেন্টার খুঁজুন ও <span className="text-emerald-400">অনলাইনে ভর্তি</span> আবেদন করুন
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            এলাকা, বিষয় ও বাজেট অনুযায়ী ভেরিফাইড কোচিংয়ের ফি স্ট্রাকচার, শিক্ষক প্যানেল ও শিক্ষার্থী রিভিউ যাচাই করে সরাসরি এক ক্লিকে ভর্তি আবেদন নিশ্চিত করুন।
          </p>

          {/* Search Bar inside Hero */}
          <div className="pt-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-3 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="কোচিংয়ের নাম, বিষয় (যেমন: পদার্থবিজ্ঞান), এলাকা বা প্রোগ্রাম লিখে সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                />
              </div>

              {/* Division Selector inside Hero */}
              <div className="w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2">
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  aria-label="বিভাগ নির্বাচন করুন"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer focus:outline-none"
                >
                  {BANGLADESH_DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => {}}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-700/30 cursor-pointer"
              >
                খুঁজুন
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-2 flex items-center gap-6 text-xs text-slate-300 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>{allCoachings.length}+</strong> ভেরিফাইড কোচিং</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span><strong>১,৮৫০+</strong> সরাসরি ভর্তি আবেদন</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span><strong>৯২%</strong> সফলতার হার</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Bar */}
      <Card className="p-4 sm:p-5 border-none shadow-sm bg-white space-y-4">
        
        {/* Programs chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={14} className="text-emerald-600" />
              প্রোগ্রাম / লক্ষ্য অনুযায়ী ফিল্টার করুন:
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              {filteredCoachings.length}টি কোচিং পাওয়া গেছে
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {POPULAR_PROGRAMS.map(prog => (
              <button
                key={prog}
                onClick={() => setSelectedProgram(prog)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedProgram === prog
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {prog}
              </button>
            ))}
          </div>
        </div>

        {/* Area / Location chips */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" />
              জনপ্রিয় এলাকা / লোকেশন ফিল্টার:
            </span>
            {selectedArea !== 'সকল এলাকা' && (
              <button 
                onClick={() => setSelectedArea('সকল এলাকা')}
                className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                সব এলাকা দেখুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {POPULAR_AREAS.map(area => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  selectedArea === area
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                <MapPin size={11} className={selectedArea === area ? 'text-white' : 'text-emerald-600'} />
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects & Sort row */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Subjects chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap mr-1 flex items-center gap-1">
              <BookOpen size={13} /> বিষয়:
            </span>
            {POPULAR_SUBJECTS.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-bold">বাছাই:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              aria-label="কোচিং তালিকা বাছাই করুন"
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="rating">সর্বোচ্চ রেটিং</option>
              <option value="popular">সর্বাধিক শিক্ষার্থী</option>
              <option value="price_low">ফি: কম থেকে বেশি</option>
              <option value="price_high">ফি: বেশি থেকে কম</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoachings.map((coaching) => (
          <Card 
            key={coaching.id}
            className="overflow-hidden border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white group rounded-3xl"
          >
            <div>
              {/* Banner with Tags */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                <img 
                  src={coaching.bannerImage} 
                  alt={coaching.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Badges on banner */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <BadgeCheck size={12} /> ভেরিফাইড
                  </span>
                  {coaching.featured && (
                    <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      জনপ্রিয়
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-slate-900 text-xs font-black shadow-sm">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{coaching.rating}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({coaching.reviewCount})</span>
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin size={12} className="text-emerald-400" /> {coaching.thana}, {coaching.district}
                  </span>
                  <span className="font-bold text-amber-300">
                    {coaching.successRate}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 shadow-sm">
                    <img 
                      src={coaching.logo} 
                      alt={coaching.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                      {coaching.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{coaching.tagline}</p>
                  </div>
                </div>

                {/* Programs and subjects */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {coaching.programs.slice(0, 3).map((prog, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {prog}
                    </span>
                  ))}
                  {coaching.subjects.slice(0, 2).map((sub, i) => (
                    <span key={`s-${i}`} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Fee Range Tag */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">টিউশন ফি পরিসীমা</span>
                    <span className="text-sm font-black text-emerald-700">{coaching.feeRange}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">ভর্তিযোগ্য কোর্স</span>
                    <span className="text-xs font-bold text-slate-700">{coaching.feeStructure.length}টি ব্যাচ ওপেন</span>
                  </div>
                </div>

                {/* Facilities summary */}
                <div className="space-y-1">
                  {coaching.facilities.slice(0, 2).map((fac, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCoachingForDetail(coaching)}
                className="text-xs font-bold py-2.5 rounded-xl border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                বিস্তারিত প্রোফাইল
              </Button>
              <Button
                onClick={() => setSelectedCoachingForApply(coaching)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <GraduationCap size={14} />
                <span>ভর্তির আবেদন</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* No results placeholder */}
      {filteredCoachings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <Building2 size={48} className="mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">কোনো কোচিং সেন্টার পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            আপনার ফিল্টারের সাথে মিলিয়ে কোনো কোচিং সেন্টার খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে বা সব বিভাগে সার্চ করে আবার চেষ্টা করুন।
          </p>
          <Button
            onClick={() => {
              setSelectedDivision('সব বিভাগ');
              setSelectedProgram('সকল প্রোগ্রাম');
              setSelectedSubject('সব বিষয়');
              setSearchQuery('');
            }}
            variant="outline"
            className="text-xs font-bold cursor-pointer"
          >
            সকল ফিল্টার রিসেট করুন
          </Button>
        </div>
      )}

      {/* Bottom CTA for Coaching Owners */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
            <Building2 size={14} className="text-emerald-400" />
            কোচিং পরিচালক ও শিক্ষকদের জন্য
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            আপনার কোচিং সেন্টার DaPathshala মার্কেটপ্লেসে যুক্ত করতে চান?
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            বিনামূল্যে সাইন-আপ করুন, আপনার কোর্স ও ফি তালিকাভুক্ত করুন এবং প্রতিদিন হাজারো শিক্ষার্থীর কাছ থেকে সরাসরি ভর্তি আবেদন ও লিডস গ্রহণ করুন।
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Button
            onClick={onOpenCoachingDashboard}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <span>কোচিং ড্যাশবোর্ড ও লিডস খুলুন</span>
            <ChevronRight size={18} className="stroke-[3]" />
          </Button>
        </div>
      </div>

      {/* Coaching Profile Detail Modal */}
      {selectedCoachingForDetail && (
        <CoachingDetailModal
          coaching={selectedCoachingForDetail}
          isOpen={!!selectedCoachingForDetail}
          onClose={() => setSelectedCoachingForDetail(null)}
          onLeadSubmitted={handleLeadSubmitted}
        />
      )}

      {/* Admission Application Modal */}
      {selectedCoachingForApply && (
        <AdmissionModal
          coaching={selectedCoachingForApply}
          isOpen={!!selectedCoachingForApply}
          onClose={() => setSelectedCoachingForApply(null)}
          onLeadSubmitted={handleLeadSubmitted}
        />
      )}
    </div>
  );
};
