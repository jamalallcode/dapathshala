import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  School, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MarketplaceCoaching, AdmissionLead } from './marketplaceTypes';

interface AdmissionModalProps {
  coaching: MarketplaceCoaching;
  initialCourse?: string;
  isOpen: boolean;
  onClose: () => void;
  onLeadSubmitted?: (lead: AdmissionLead) => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  coaching,
  initialCourse,
  isOpen,
  onClose,
  onLeadSubmitted
}) => {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [currentInstitution, setCurrentInstitution] = useState('');
  const [classLevel, setClassLevel] = useState('দ্বাদশ শ্রেণি (HSC-25)');
  const [programInterest, setProgramInterest] = useState(
    initialCourse || coaching.feeStructure[0]?.courseName || coaching.programs[0] || 'এইচএসসি বিজ্ঞান'
  );
  const [preferredShift, setPreferredShift] = useState<'সকাল (৮:০০ - ১২:০০)' | 'দুপুর (১২:০০ - ৩:০০)' | 'বিকাল (৩:০০ - ৭:০০)' | 'অনলাইন লাইভ ব্যাচ'>('সকাল (৮:০০ - ১২:০০)');
  const [targetExam, setTargetExam] = useState(coaching.programs[0] || 'এইচএসসি ও ভর্তি পরীক্ষা');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submittedLead, setSubmittedLead] = useState<AdmissionLead | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim()) {
      setError('দয়া করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!guardianPhone.trim() || guardianPhone.trim().length < 11) {
      setError('অভিভাবকের সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!currentInstitution.trim()) {
      setError('বর্তমান স্কুল/কলেজের নাম প্রদান করুন।');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newLead: AdmissionLead = {
      id: `lead-${Date.now()}-${randomSuffix}`,
      coachingId: coaching.id,
      coachingName: coaching.name,
      studentName: studentName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      guardianName: guardianName.trim() || 'অভিভাবক',
      guardianPhone: guardianPhone.trim(),
      currentInstitution: currentInstitution.trim(),
      classLevel,
      programInterest,
      preferredShift,
      targetExam,
      address: address.trim() || coaching.thana + ', ' + coaching.district,
      notes: notes.trim() || undefined,
      appliedAt: new Date().toISOString(),
      status: 'new'
    };

    try {
      const stored = localStorage.getItem('dapathshala_coaching_leads');
      const leads: AdmissionLead[] = stored ? JSON.parse(stored) : [];
      const updated = [newLead, ...leads];
      localStorage.setItem('dapathshala_coaching_leads', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save lead in localStorage:', err);
    }

    setSubmittedLead(newLead);
    if (onLeadSubmitted) {
      onLeadSubmitted(newLead);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedLead(null);
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম ${coaching.name}! আমি DaPathshala থেকে আপনার প্রতিষ্ঠানে "${programInterest}" কোর্সে ভর্তির আবেদন করেছি। আমার আবেদন ট্র্যাকিং আইডি: ${submittedLead?.id}। বিস্তারিত জানতে চাচ্ছি।`
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shrink-0 shadow-md">
              <img 
                src={coaching.logo} 
                alt={coaching.name} 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-1">
                <Sparkles size={12} />
                ভর্তি আবেদন ফরম (Admission Portal)
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">{coaching.name}</h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {coaching.address}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {submittedLead ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  আপনার আবেদনটি সরাসরি <span className="font-bold text-slate-900">{coaching.name}</span>-এর অ্যাডমিশন ম্যানেজারের কাছে পৌঁছে গেছে। খুব শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-bold text-slate-500">আবেদন ট্র্যাকিং আইডি:</span>
                  <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {submittedLead.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">শিক্ষার্থী:</span>
                    <p className="font-bold text-slate-800">{submittedLead.studentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">কোর্স / প্রোগ্রাম:</span>
                    <p className="font-bold text-slate-800">{submittedLead.programInterest}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">শিফট:</span>
                    <p className="font-bold text-slate-800">{submittedLead.preferredShift}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ফোন:</span>
                    <p className="font-bold text-slate-800">{submittedLead.phone}</p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/88${coaching.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-200 transition-all cursor-pointer"
                >
                  <MessageSquare size={16} />
                  সরাসরি WhatsApp-এ কথা বলুন
                </a>
                <Button
                  onClick={handleResetAndClose}
                  variant="outline"
                  className="w-full sm:w-auto text-xs font-bold px-5 py-3 cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </Button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Course Selection */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-900">
                  ভর্তি ইচ্ছুক কোর্স / ব্যাচ নির্বাচন করুন *
                </label>
                <select
                  value={programInterest}
                  onChange={(e) => setProgramInterest(e.target.value)}
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                >
                  {coaching.feeStructure.map((f, i) => (
                    <option key={i} value={f.courseName}>
                      {f.courseName} — ৳{f.monthlyFee.toLocaleString('bn-BD')} / মাস ({f.duration})
                    </option>
                  ))}
                  {coaching.programs.map((p, i) => (
                    <option key={`p-${i}`} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষার্থীর পূর্ণ নাম *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর হাসান"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (শিক্ষার্থী) *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="০১XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Institution and Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান স্কুল / কলেজ *
                  </label>
                  <div className="relative">
                    <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="যেমন: নটর ডেম কলেজ"
                      value={currentInstitution}
                      onChange={(e) => setCurrentInstitution(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শ্রেণি / শিক্ষাবর্ষ *
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <option value="দ্বাদশ শ্রেণি (HSC-25)">দ্বাদশ শ্রেণি (HSC-25)</option>
                    <option value="একাদশ শ্রেণি (HSC-26)">একাদশ শ্রেণি (HSC-26)</option>
                    <option value="এইচএসসি পরীক্ষার্থী (Second Timer)">এইচএসসি পরীক্ষার্থী (Second Timer)</option>
                    <option value="দশম শ্রেণি (SSC-25)">দশম শ্রেণি (SSC-25)</option>
                    <option value="নবম শ্রেণি (SSC-26)">নবম শ্রেণি (SSC-26)</option>
                    <option value="অ্যাডমিশন পরীক্ষার্থী">অ্যাডমিশন পরীক্ষার্থী</option>
                  </select>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের নাম
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="পিতা / মাতার নাম"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="০১XXXXXXXXX"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Shift & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পছন্দের শিফট / সময় *
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={preferredShift}
                      onChange={(e: any) => setPreferredShift(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <option value="সকাল (৮:০০ - ১২:০০)">সকাল (৮:০০ - ১২:০০)</option>
                      <option value="দুপুর (১২:০০ - ৩:০০)">দুপুর (১২:০০ - ৩:০০)</option>
                      <option value="বিকাল (৩:০০ - ৭:০০)">বিকাল (৩:০০ - ৭:০০)</option>
                      <option value="অনলাইন লাইভ ব্যাচ">অনলাইন লাইভ ব্যাচ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address & Note */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান বসবাসের ঠিকানা
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="রোড / এলাকা, থানা, জেলা"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অতিরিক্ত কোনো প্রশ্ন বা বিশেষ নোট (যদি থাকে)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="যেমন: কোনো নির্দিষ্ট বিষয়ে দুর্বলতা বা বিশেষ শিডিউল নিয়ে প্রশ্ন..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-4">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>কোনো অগ্রিম ফি ছাড়াই আবেদন সম্পূর্ণ বিনামূল্যে</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-xs font-bold cursor-pointer"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    আবেদন নিশ্চিত করুন
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
