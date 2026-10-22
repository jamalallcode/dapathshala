import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  BadgeCheck, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MarketplaceCoaching, AdmissionLead } from './marketplaceTypes';
import { AdmissionModal } from './AdmissionModal';

interface CoachingDetailModalProps {
  coaching: MarketplaceCoaching | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadSubmitted?: (lead: AdmissionLead) => void;
}

export const CoachingDetailModal: React.FC<CoachingDetailModalProps> = ({
  coaching,
  isOpen,
  onClose,
  onLeadSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'fees' | 'teachers' | 'facilities' | 'reviews'>('fees');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCourseForApply, setSelectedCourseForApply] = useState<string | undefined>(undefined);

  if (!isOpen || !coaching) return null;

  const handleApplyClick = (courseName?: string) => {
    setSelectedCourseForApply(courseName);
    setIsApplyModalOpen(true);
  };

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম ${coaching.name}! আমি DaPathshala থেকে আপনার কোচিংয়ের বিস্তারিত প্রোফাইল দেখেছি এবং ভর্তি সংক্রান্ত তথ্য জানতে আগ্রহী।`
  );

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-6 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X size={20} />
          </button>

          {/* Banner & Header */}
          <div className="relative bg-slate-900 text-white shrink-0">
            <div className="h-44 sm:h-52 w-full relative overflow-hidden">
              <img 
                src={coaching.bannerImage} 
                alt={coaching.name} 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>

            <div className="px-5 sm:px-8 pb-5 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex items-start sm:items-end gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-white/80 shrink-0">
                  <img 
                    src={coaching.logo} 
                    alt={coaching.name} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                      <BadgeCheck size={14} className="text-emerald-400" />
                      ভেরিফাইড পার্টনার কোচিং
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {coaching.rating} ({coaching.reviewCount} রিভিউ)
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-white">{coaching.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-1">{coaching.tagline}</p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-400" /> {coaching.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-blue-400" /> {coaching.studentCount.toLocaleString('bn-BD')} শিক্ষার্থী
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-400" /> {coaching.successRate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action button header */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                <a
                  href={`https://wa.me/88${coaching.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition-all"
                >
                  <MessageSquare size={14} />
                  হোয়াটসঅ্যাপ
                </a>
                <Button
                  onClick={() => handleApplyClick()}
                  className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap size={16} />
                  ভর্তির আবেদন করুন
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 px-6 pt-3 bg-slate-50/70 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'fees'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={15} />
              কোর্স ও ফি স্ট্রাকচার ({coaching.feeStructure.length})
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'teachers'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={15} />
              শিক্ষক ও ফ্যাকাল্টি ({coaching.teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'facilities'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={15} />
              সুযোগ-সুবিধা ({coaching.facilities.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star size={15} />
              শিক্ষার্থীদের রিভিউ ({coaching.reviews.length})
            </button>
          </div>

          {/* Modal Tab Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* TAB: Fee Structure */}
            {activeTab === 'fees' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">ভর্তি ও নিয়মিত টিউশন ফি তালিকা</h3>
                    <p className="text-xs text-slate-500">স্বচ্ছ ফি পলিসি, কোনো গোপন চার্জ নেই</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">গড় ফি পরিসীমা:</span>
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {coaching.feeRange}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coaching.feeStructure.map((fee, idx) => (
                    <div 
                      key={idx}
                      className="border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                            {fee.courseName}
                          </h4>
                          {fee.seatsAvailable && (
                            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">
                              আসন বাকি {fee.seatsAvailable}টি
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{fee.duration}</span>
                        </div>

                        <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">মাসিক টিউশন ফি</span>
                            <div className="text-lg font-black text-emerald-600">
                              ৳{fee.monthlyFee.toLocaleString('bn-BD')} <span className="text-xs font-normal text-slate-500">/ মাস</span>
                            </div>
                          </div>
                          <div className="text-right border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ভর্তি ফি (এককালীন)</span>
                            <div className="text-sm font-bold text-slate-700">
                              ৳{fee.admissionFee.toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 block">কোর্সের অন্তর্ভুক্ত সুবিধাসমূহ:</span>
                          {fee.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleApplyClick(fee.courseName)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200 cursor-pointer"
                      >
                        <span>এই কোর্সে ভর্তি আবেদন</span>
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Teachers */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">অভিজ্ঞ শিক্ষক ও ফ্যাকাল্টি প্যানেল</h3>
                  <p className="text-xs text-slate-500">বুয়েট, ঢাবি ও মেডিকেল থেকে উত্তীর্ণ শীর্ষ ইনস্ট্রাক্টরবৃন্দ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coaching.teachers.map((teacher, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3.5 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-sm">{teacher.name}</h4>
                        <p className="text-xs font-semibold text-emerald-600">{teacher.designation}</p>
                        <p className="text-xs text-slate-500">{teacher.institution} • অভিজ্ঞতা: {teacher.experience}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Facilities */}
            {activeTab === 'facilities' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">আধুনিক সুযোগ-সুবিধা ও পরিবেশ</h3>
                  <p className="text-xs text-slate-500">শিক্ষার্থীদের পড়াশোনার সেরা পরিবেশ নিশ্চিতকরণ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coaching.facilities.map((fac, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">{fac}</span>
                    </div>
                  ))}
                </div>

                {/* Additional Coaching Contact details */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">যোগাযোগ ও ক্যাম্পাস তথ্য</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block">সরাসরি ফোন:</span>
                      <span className="font-bold">{coaching.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ইমেইল:</span>
                      <span className="font-bold">{coaching.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">প্রতিষ্ঠাকাল:</span>
                      <span className="font-bold">{coaching.foundedYear} সাল থেকে</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">শিক্ষার্থী ও অভিভাবকদের মতামত</h3>
                    <p className="text-xs text-slate-500">বাস্তব অভিজ্ঞতা ও ফিডব্যাক</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-slate-900">{coaching.rating}</span>
                    <span className="text-xs text-slate-500">/ ৫.০</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {coaching.reviews.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{rev.studentName}</span>
                          <span className="text-xs text-slate-500">({rev.college})</span>
                          {rev.badge && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                              {rev.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <span className="text-xs text-slate-500">ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য কল করুন:</span>
              <p className="text-sm font-black text-slate-900">{coaching.phone}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none text-xs font-bold px-4 py-2.5 cursor-pointer"
              >
                বন্ধ করুন
              </Button>
              <Button
                onClick={() => handleApplyClick()}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <GraduationCap size={16} />
                <span>ভর্তির আবেদন করুন (Apply Now)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Admission Modal */}
      {isApplyModalOpen && (
        <AdmissionModal
          coaching={coaching}
          initialCourse={selectedCourseForApply}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onLeadSubmitted={(lead) => {
            if (onLeadSubmitted) onLeadSubmitted(lead);
          }}
        />
      )}
    </>
  );
};
