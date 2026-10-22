import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Globe, 
  Palette, 
  Edit3, 
  Calendar, 
  ShieldCheck, 
  Award,
  Layers,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react';
import { CoachingProfile } from './types';

interface CoachingProfileViewProps {
  profile: CoachingProfile;
  onEdit: () => void;
}

export const CoachingProfileView: React.FC<CoachingProfileViewProps> = ({
  profile,
  onEdit
}) => {
  return (
    <div className="space-y-6">
      
      {/* Brand Hero Card */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white relative shadow-xl overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${profile.themeColor} 0%, #0f172a 100%)` 
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-5xl shadow-2xl overflow-hidden">
              {profile.logo.startsWith('data:') || profile.logo.startsWith('http') ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span>{profile.logo}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold text-white">
                <ShieldCheck size={14} className="text-emerald-300" />
                দা-পাঠশালা ভেরিফায়েড কোচিং পার্টনার
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile.name}
              </h2>
              <p className="text-sm text-white/80 max-w-xl">
                {profile.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onEdit}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>প্রোফাইল ও ব্র্যান্ডিং এডিট করুন</span>
            </button>
          </div>
        </div>

        {/* Bottom meta stats */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-white/60 block text-[11px]">প্রতিষ্ঠা সাল</span>
            <span className="font-bold text-white text-sm">{profile.foundedYear}</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">ধারণক্ষমতা</span>
            <span className="font-bold text-white text-sm">{profile.studentCapacity} জন শিক্ষার্থী</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">শাখা সংখ্যা</span>
            <span className="font-bold text-white text-sm">{profile.branchesCount}টি ক্যাম্পাস</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">রেজিস্ট্রেশন নম্বর</span>
            <span className="font-bold text-white text-sm">{profile.eiinNumber || 'REG-BD-2024'}</span>
          </div>
        </div>
      </div>

      {/* Profile Details & Academic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact & Location Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            ঠিকানা ও যোগাযোগ তথ্য
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">প্রধান ক্যাম্পাস ঠিকানা</span>
              <p className="font-bold text-slate-800">{profile.address}</p>
              <p className="text-slate-500">{profile.district}, {profile.division}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">অফিসিয়াল মোবাইল ও হেল্পলাইন</span>
              <p className="font-bold text-slate-800 flex items-center gap-2">
                <Phone size={13} className="text-emerald-600" />
                {profile.phone}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">যোগাযোগ ইমেইল</span>
              <p className="font-bold text-slate-800 flex items-center gap-2">
                <Mail size={13} className="text-indigo-600" />
                {profile.email || 'coaching@dapathshala.com'}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-emerald-700 font-bold uppercase tracking-wide text-[10px]">অনলাইন শিক্ষার্থী পোর্টাল URL</span>
              <div className="font-mono text-emerald-900 font-bold flex items-center justify-between">
                <span>dapathshala.com/c/{profile.subdomain}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://dapathshala.com/c/${profile.subdomain}`)}
                  className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
                  title="লিংক কপি করুন"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Offerings & Programs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            পাঠদানকৃত প্রোগ্রাম ও পাঠ্যক্রমসমূহ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.curriculumLevels.map((lvl, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <span className="font-bold text-slate-800">{lvl}</span>
              </div>
            ))}
          </div>

          {/* Branded Admit Card & Invoice sample preview */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">
              ব্র্যান্ডেড প্রিন্ট টেমপ্লেট প্রিভিউ (অ্যাডমিট কার্ড ও মানি রিসিট)
            </h4>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{profile.logo}</span>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {profile.name} - স্টুডেন্ট আইডি ও প্রবেশপত্র হেডার
                  </div>
                  <div className="text-[11px] text-slate-500">
                    শিক্ষার্থী পরীক্ষার প্রবেশপত্র ও ফি রসিদে স্বয়ংক্রিয়ভাবে কোচিংয়ের লোগো ও সিল প্রিন্ট হবে।
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer size={14} />
                প্রিন্ট প্রিভিউ দেখুন
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
