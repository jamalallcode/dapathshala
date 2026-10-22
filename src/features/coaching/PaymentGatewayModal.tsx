import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Clock, 
  Receipt, 
  ArrowRight, 
  Check, 
  Loader2,
  Copy,
  Printer,
  Sparkles,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { SubscriptionPlan, BillingCycle, PaymentMethod, Invoice, CoachingProfile } from './types';

interface PaymentGatewayModalProps {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  coachingProfile: CoachingProfile;
  onClose: () => void;
  onSuccess: (invoice: Invoice, newRenewalDate: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  plan,
  cycle,
  coachingProfile,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [phone, setPhone] = useState('01711223344');
  const [trxId, setTrxId] = useState('');
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const amount = plan.id === 'trial' ? 0 : cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const merchantNumbers: Record<PaymentMethod, string> = {
    bkash: '01886-900800 (মার্চেন্ট)',
    nagad: '01999-554433 (মার্চেন্ট)',
    upay: '01700-112233 (এজেন্ট)',
    card: 'SSLCommerz গেটওয়ে',
    bank: 'আইবিবিএল একাউন্ট: ২০৫০৩...'
  };

  const handleCopyMerchant = () => {
    navigator.clipboard.writeText(merchantNumbers[selectedMethod]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (plan.id !== 'trial' && !agreeTerms) return;

    setStep('processing');

    setTimeout(() => {
      // Calculate renewal date
      const daysToAdd = plan.id === 'trial' ? 14 : cycle === 'yearly' ? 365 : 30;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);

      const randomTrx = trxId.trim() || `${selectedMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const newInvoice: Invoice = {
        id: 'inv-' + Date.now(),
        invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        planName: plan.name,
        cycle: cycle,
        amount: amount,
        paymentMethod: selectedMethod,
        transactionId: randomTrx,
        status: 'paid'
      };

      setGeneratedInvoice(newInvoice);
      setStep('success');
      onSuccess(newInvoice, nextDate.toISOString());
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            নিরাপদ পেমেন্ট ও অ্যাক্টিভেশন গেটওয়ে
          </div>
          <h2 className="text-2xl font-black text-white">
            {plan.name} সাবস্ক্রিপশন
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            প্রতিষ্ঠান: <span className="text-white font-bold">{coachingProfile.name}</span>
          </p>
        </div>

        {/* Content Body based on step */}
        {step === 'method' && (
          <div className="p-6 space-y-6">
            
            {/* Price Summary Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">নির্বাচিত প্যাকেজ</span>
                <div className="text-lg font-black text-slate-900">{plan.name}</div>
                <div className="text-xs text-slate-500">
                  {cycle === 'yearly' ? 'বাৎসরিক বিলিং (১ বছর মেয়াদ)' : plan.id === 'trial' ? '১৪ দিনের ট্রায়াল' : 'মাসিক বিলিং (৩০ দিন মেয়াদ)'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">পরিশোধযোগ্য মোট টাকা</span>
                <div className="text-3xl font-black text-emerald-600">
                  {amount === 0 ? '৳০ (ফ্রি)' : `৳${amount.toLocaleString('bn-BD')}`}
                </div>
                {cycle === 'yearly' && plan.id !== 'trial' && (
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ২০% বিশেষ সাশ্রয় অন্তর্ভুক্ত
                  </span>
                )}
              </div>
            </div>

            {/* Trial Direct Active */}
            {plan.id === 'trial' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-bold text-slate-900">কোনো ক্রেডিট কার্ড বা পেমেন্টের প্রয়োজন নেই</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  আপনি পরবর্তী ১৪ দিনের জন্য সম্পূর্ণ ফ্রিতে মেধা একাডেমি পোর্টালে সর্বোচ্চ ৫০ জন শিক্ষার্থীর ব্যাচ, এআই খাতা দেখা ও উপস্থিতি পরিচালনা করতে পারবেন।
                </p>
              </div>
            ) : (
              <>
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('bkash')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'bkash' 
                          ? 'border-[#D12053] bg-pink-50/50 shadow-md ring-2 ring-[#D12053]/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#D12053] text-white flex items-center justify-center font-black text-xs">
                        বি
                      </div>
                      <span className="text-xs font-bold text-slate-900">বিকাশ (bKash)</span>
                      <span className="text-[10px] text-pink-600 font-bold">মার্চেন্ট পে</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('nagad')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'nagad' 
                          ? 'border-[#F7941D] bg-orange-50/50 shadow-md ring-2 ring-[#F7941D]/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center font-black text-xs">
                        ন
                      </div>
                      <span className="text-xs font-bold text-slate-900">নগদ (Nagad)</span>
                      <span className="text-[10px] text-orange-600 font-bold">মার্চেন্ট পে</span>
                    </button>

                    {/* Upay */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upay')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'upay' 
                          ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                        উ
                      </div>
                      <span className="text-xs font-bold text-slate-900">উপায় (Upay)</span>
                      <span className="text-[10px] text-blue-600 font-bold">মোবাইল ওয়ালেট</span>
                    </button>

                    {/* Card / Bank */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'card' 
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CreditCard size={15} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">কার্ড / নেট ব্যাংকিং</span>
                      <span className="text-[10px] text-emerald-600 font-bold">ভিসা / মাস্টারকার্ড</span>
                    </button>
                  </div>
                </div>

                {/* Method instructions & Inputs */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      দা-পাঠশালা অফিসিয়াল {selectedMethod === 'bkash' ? 'বিকাশ' : selectedMethod === 'nagad' ? 'নগদ' : selectedMethod === 'upay' ? 'উপায়' : 'পেমেন্ট'} নম্বর:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMerchant}
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-md cursor-pointer transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'কপি হয়েছে' : merchantNumbers[selectedMethod]}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        আপনার মোবাইল নম্বর (বিকাশ/নগদ)
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ট্রানজেকশন আইডি (TrxID)
                      </label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="যেমন: BK982J1A (ঐচ্ছিক)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-500">খালি রাখলে স্বয়ংক্রিয় ভেরিফাই হবে</span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-600">
                      আমি দা-পাঠশালা SaaS সাবস্ক্রিপশন শর্তাবলী এবং স্বয়ংক্রিয় রিনিউয়াল পলিসির সাথে একমত পোষণ করছি।
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
              >
                বাতিল করুন
              </button>
              
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={plan.id !== 'trial' && !agreeTerms}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                  plan.id !== 'trial' && !agreeTerms
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
              >
                {plan.id === 'trial' ? (
                  <>
                    <span>ট্রায়াল অবিলম্বে সক্রিয় করুন</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>৳{amount.toLocaleString('bn-BD')} পেমেন্ট নিশ্চিত ও সাবস্ক্রিপশন চালু করুন</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Processing state */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 size={48} className="text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-lg font-black text-slate-900">
              পেমেন্ট গেটওয়ে ভেরিফিকেশন চলছে...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              অনুগ্রহ করে অপেক্ষা করুন। আপনার {selectedMethod === 'bkash' ? 'বিকাশ' : selectedMethod === 'nagad' ? 'নগদ' : 'অনলাইন'} ট্রানজেকশন সফলভাবে যাচাই ও ডাটাবেজে সাবস্ক্রিপশন আপডেট করা হচ্ছে।
            </p>
          </div>
        )}

        {/* Step 3: Success with Invoice Receipt */}
        {step === 'success' && generatedInvoice && (
          <div className="p-6 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                অভিনন্দন! সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে
              </h3>
              <p className="text-xs text-slate-600">
                আপনার কোচিং সেন্টারের অ্যাকাউন্টটি সফলভাবে আপগ্রেড করা হয়েছে এবং নতুন মেয়াদ আপডেট হয়েছে।
              </p>
            </div>

            {/* Printable Digital Invoice Receipt Card */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{coachingProfile.logo}</span>
                  <div>
                    <h5 className="font-black text-slate-900 text-sm">{coachingProfile.name}</h5>
                    <p className="text-slate-500 text-[11px]">{coachingProfile.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">ইনভয়েস নং: {generatedInvoice.invoiceNo}</div>
                  <div className="text-slate-500 text-[11px]">তারিখ: {generatedInvoice.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div>
                  <span className="text-slate-500">প্যাকেজের নাম:</span>
                  <div className="font-bold text-slate-900">{generatedInvoice.planName}</div>
                </div>
                <div>
                  <span className="text-slate-500">বিলিং চক্র:</span>
                  <div className="font-bold text-slate-900">{generatedInvoice.cycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'}</div>
                </div>
                <div>
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <div className="font-bold text-slate-900 uppercase">{generatedInvoice.paymentMethod}</div>
                </div>
                <div>
                  <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
                  <div className="font-mono font-bold text-emerald-700">{generatedInvoice.transactionId}</div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-black">
                <span className="text-slate-700">পরিশোধিত মোট:</span>
                <span className="text-emerald-700 text-base">
                  {generatedInvoice.amount === 0 ? '৳০ (ফ্রি ট্রায়াল)' : `৳${generatedInvoice.amount.toLocaleString('bn-BD')}`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                <Printer size={15} />
                ইনভয়েস প্রিন্ট / সেভ করুন
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 cursor-pointer"
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
