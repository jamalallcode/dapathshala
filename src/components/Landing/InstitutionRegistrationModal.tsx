import React, { useState, useEffect } from 'react';
import { X, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { BANGLADESH_DIVISIONS, GeoDivision } from '../../data/bangladeshGeoData';

interface InstitutionRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (data: any) => void;
}

export const InstitutionRegistrationModal: React.FC<InstitutionRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered
}) => {
  const [instituteName, setInstituteName] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load existing saved registration if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dapathshala_institution_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.instituteName) setInstituteName(parsed.instituteName);
        if (parsed.division) setSelectedDivision(parsed.division);
        if (parsed.district) setSelectedDistrict(parsed.district);
        if (parsed.upazila) setSelectedUpazila(parsed.upazila);
        if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        if (parsed.detailedAddress) setDetailedAddress(parsed.detailedAddress);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Compute available districts based on division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision);
  const availableDistricts = currentDivisionObj ? currentDivisionObj.districts : [];

  // Compute available upazilas based on district
  const currentDistrictObj = availableDistricts.find((dist) => dist.name === selectedDistrict);
  const availableUpazilas = currentDistrictObj ? currentDistrictObj.upazilas : [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!instituteName.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রতিষ্ঠানের নাম লিখুন।');
      return;
    }
    if (!selectedDivision) {
      setErrorMsg('অনুগ্রহ করে বিভাগ নির্বাচন করুন।');
      return;
    }
    if (!selectedDistrict) {
      setErrorMsg('অনুগ্রহ করে জেলা নির্বাচন করুন।');
      return;
    }

    const payload = {
      instituteName: instituteName.trim(),
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      phoneNumber: phoneNumber.trim(),
      detailedAddress: detailedAddress.trim(),
      registeredAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('dapathshala_institution_profile', JSON.stringify(payload));
      localStorage.setItem('dapathshala_registration_dismissed', 'false');
    } catch (e) {
      // ignore
    }

    setIsSuccess(true);
    if (onRegistered) onRegistered(payload);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[460px] rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header - Matches the distinct green bar in the user screenshot */}
        <div className="bg-[#16a34a] px-5 py-3.5 flex items-center justify-between text-white">
          <h2 className="font-bold text-base sm:text-lg tracking-wide text-white flex items-center gap-2">
            এক ধাপ বাকি, প্রতিষ্ঠান রেজিস্ট্রেশন করুন
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white text-[#16a34a] hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs"
            title="বন্ধ করুন"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#16a34a] text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={18} />
              প্রতিষ্ঠান সফলভাবে রেজিস্টার্ড হয়েছে!
            </div>
          )}

          {/* 1. প্রতিষ্ঠানের নাম * */}
          <div>
            <input
              type="text"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              placeholder="প্রতিষ্ঠানের নাম *"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-500 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition"
              required
            />
          </div>

          {/* 2. বিভাগ * */}
          <div className="relative">
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('');
                setSelectedUpazila('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white appearance-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition cursor-pointer pr-10"
              required
            >
              <option value="" disabled className="text-slate-400">
                বিভাগ *
              </option>
              {BANGLADESH_DIVISIONS.map((div) => (
                <option key={div.id} value={div.name}>
                  {div.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
              <ChevronDown size={18} />
            </div>
          </div>

          {/* 3. জেলা * */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedUpazila('');
              }}
              disabled={!selectedDivision}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white appearance-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition cursor-pointer pr-10 disabled:bg-slate-100 disabled:text-slate-400"
              required
            >
              <option value="" disabled className="text-slate-400">
                জেলা *
              </option>
              {availableDistricts.map((dist) => (
                <option key={dist.id} value={dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
              <ChevronDown size={18} />
            </div>
          </div>

          {/* 4. উপজেলা * */}
          <div className="relative">
            <select
              value={selectedUpazila}
              onChange={(e) => setSelectedUpazila(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white appearance-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition cursor-pointer pr-10 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="" disabled className="text-slate-400">
                উপজেলা *
              </option>
              {availableUpazilas.map((upz, idx) => (
                <option key={idx} value={upz}>
                  {upz}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
              <ChevronDown size={18} />
            </div>
          </div>

          {/* 5. ফোন নম্বর */}
          <div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="ফোন নম্বর"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-500 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition"
            />
          </div>

          {/* 6. নির্দিষ্ট ঠিকানা লিখুন */}
          <div>
            <textarea
              rows={3}
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="নির্দিষ্ট ঠিকানা লিখুন (যদি থাকে)। এখানে জেলা বা উপজেলা লিখবেন না।"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-500 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 outline-none transition resize-none"
            />
          </div>

          {/* 7. রেজিস্টার্ড করুন Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-base shadow-md shadow-[#16a34a]/20 transition duration-150 disabled:opacity-75"
            >
              রেজিস্টার্ড করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
