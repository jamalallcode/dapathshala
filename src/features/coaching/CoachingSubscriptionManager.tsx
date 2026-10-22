import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  RefreshCw, 
  Bell, 
  Calendar, 
  Clock, 
  FileText, 
  Printer, 
  Download, 
  HelpCircle,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  DollarSign
} from 'lucide-react';
import { SubscriptionPlan, BillingCycle, SubscriptionState, Invoice, CoachingProfile } from './types';
import { SAAS_PLANS } from './coachingConstants';
import { PaymentGatewayModal } from './PaymentGatewayModal';

interface CoachingSubscriptionManagerProps {
  subscription: SubscriptionState;
  coachingProfile: CoachingProfile;
  invoices: Invoice[];
  onUpdateSubscription: (newSub: SubscriptionState) => void;
  onAddInvoice: (inv: Invoice) => void;
}

export const CoachingSubscriptionManager: React.FC<CoachingSubscriptionManagerProps> = ({
  subscription,
  coachingProfile,
  invoices,
  onUpdateSubscription,
  onAddInvoice
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription.billingCycle);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [testNotificationToast, setTestNotificationToast] = useState<string | null>(null);

  const renewalDate = new Date(subscription.renewalDate);
  const today = new Date();
  const diffTime = renewalDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysRemaining <= 5 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const handleOpenPayment = (plan: SubscriptionPlan) => {
    setSelectedPlanForPayment(plan);
  };

  const handlePaymentSuccess = (newInvoice: Invoice, nextRenewalDate: string) => {
    onAddInvoice(newInvoice);

    const updatedSub: SubscriptionState = {
      ...subscription,
      planId: selectedPlanForPayment?.id || subscription.planId,
      planName: selectedPlanForPayment?.name || subscription.planName,
      status: 'active',
      billingCycle: billingCycle,
      renewalDate: nextRenewalDate,
      lastPaymentMethod: newInvoice.paymentMethod,
      lastAmountPaid: newInvoice.amount,
      lastTransactionId: newInvoice.transactionId
    };

    onUpdateSubscription(updatedSub);
  };

  const handleTriggerTestAlert = () => {
    const formattedDate = renewalDate.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const msg = `[দা-পাঠশালা এসএমএস গেটওয়ে] প্রিয় ${coachingProfile.name}, আপনার সাবস্ক্রিপশন মেয়াদ ${formattedDate}-এ শেষ হচ্ছে। সেবা চালু রাখতে বিকাশ/নগদে রিনিউ করুন।`;
    setTestNotificationToast(msg);
    setTimeout(() => setTestNotificationToast(null), 5000);
  };

  const toggleAutoRenew = () => {
    onUpdateSubscription({
      ...subscription,
      autoRenew: !subscription.autoRenew
    });
  };

  const toggleAlert = (type: 'sms' | 'email' | 'whatsapp') => {
    if (type === 'sms') {
      onUpdateSubscription({ ...subscription, smsAlertsEnabled: !subscription.smsAlertsEnabled });
    } else if (type === 'email') {
      onUpdateSubscription({ ...subscription, emailAlertsEnabled: !subscription.emailAlertsEnabled });
    } else {
      onUpdateSubscription({ ...subscription, whatsappAlertsEnabled: !subscription.whatsappAlertsEnabled });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Test simulated alert banner */}
      {testNotificationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                রিনিউয়াল এসএমএস নোটিফিকেশন পাঠানো হয়েছে
              </span>
              <span className="text-[10px] text-slate-400">এখনই</span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {testNotificationToast}
            </p>
          </div>
        </div>
      )}

      {/* Subscription Active Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">বর্তমান সাবস্ক্রিপশন স্ট্যাটাস</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                isExpired 
                  ? 'bg-rose-100 text-rose-800' 
                  : isExpiringSoon 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isExpired ? 'মেয়াদোত্তীর্ণ' : isExpiringSoon ? 'শীঘ্রই রিনিউ প্রয়োজন' : 'সক্রিয় প্ল্যান'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {subscription.planName}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-600" />
                পরবর্তী রিনিউয়াল তারিখ: <strong className="text-slate-800 font-bold">
                  {renewalDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-600" />
                বাকি আছে: <strong className="text-slate-800 font-bold">{daysRemaining.toLocaleString('bn-BD')} দিন</strong>
              </span>

              {subscription.lastPaymentMethod && (
                <span className="flex items-center gap-1.5">
                  <CreditCard size={14} className="text-purple-600" />
                  সর্বশেষ পেমেন্ট: <strong className="text-slate-800 font-bold uppercase">{subscription.lastPaymentMethod}</strong>
                  {subscription.lastTransactionId && ` (${subscription.lastTransactionId})`}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={toggleAutoRenew}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                subscription.autoRenew
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <RefreshCw size={14} className={subscription.autoRenew ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{subscription.autoRenew ? 'অটো-রিনিউ চালু (বিকাশ)' : 'অটো-রিনিউ বন্ধ'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const currentOrPro = SAAS_PLANS.find(p => p.id === subscription.planId) || SAAS_PLANS[1];
                handleOpenPayment(currentOrPro);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap size={14} />
              <span>প্যাকেজ রিনিউ বা আপগ্রেড করুন</span>
            </button>
          </div>
        </div>

        {/* Days remaining visual progress */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">সাবস্ক্রিপশন মেয়াদ ট্র্যাকার</span>
            <span className="text-slate-500 font-medium">{daysRemaining} দিন অবশিষ্ট / ৩০ দিন</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isExpired 
                  ? 'bg-rose-500' 
                  : isExpiringSoon 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 30) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Header & Cycle Toggle */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles size={14} className="text-emerald-600" />
          দা-পাঠশালা SaaS প্যাকেজ ও সাবস্ক্রিপশন প্ল্যান
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          আপনার কোচিং সেন্টারের প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নিন
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          বিকাশ (bKash), নগদ (Nagad) বা কার্ডের মাধ্যমে সহজ ও নিরাপদ পেমেন্ট। কোনো লুকানো চার্জ নেই।
        </p>

        {/* Monthly vs Yearly Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            মাসিক বিলিং
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>বাৎসরিক বিলিং</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              billingCycle === 'yearly' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              ২০% ছাড়
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAAS_PLANS.map((plan) => {
          const isCurrentPlan = subscription.planId === plan.id;
          const displayPrice = plan.id === 'trial' 
            ? 0 
            : billingCycle === 'yearly' 
            ? plan.yearlyPrice 
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 bg-white border-2 transition-all flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                plan.popular 
                  ? 'border-emerald-600 ring-4 ring-emerald-500/10' 
                  : isCurrentPlan
                  ? 'border-indigo-600'
                  : 'border-slate-200'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md ${
                  plan.popular 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-indigo-600 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {plan.id === 'trial' ? '৳০' : `৳${displayPrice.toLocaleString('bn-BD')}`}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {plan.id === 'trial' ? '/ ১৪ দিন' : billingCycle === 'yearly' ? '/ বছর' : '/ মাস'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.id !== 'trial' && (
                    <span className="text-[11px] text-emerald-600 font-bold">
                      (প্রতি মাসে মাত্র ৳{Math.round(plan.yearlyPrice / 12).toLocaleString('bn-BD')})
                    </span>
                  )}
                </div>

                {/* Student Limit */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>ধারণক্ষমতা: {plan.studentLimit.toLocaleString('bn-BD')} জন শিক্ষার্থী</span>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                    সুবিধাসমূহ অন্তর্ভুক্ত:
                  </span>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenPayment(plan)}
                  className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrentPlan
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>বর্তমান প্যাকেজ রিনিউ করুন</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.id === 'trial' ? 'ফ্রি ট্রায়াল শুরু করুন' : 'প্যাকেজ নির্বাচন ও পেমেন্ট'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Auto-Notification & Alert Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              সাবস্ক্রিপশন ও রিনিউয়াল অটোনোটিফিকেশন সিস্টেম
            </h3>
            <p className="text-xs text-slate-500">
              মেয়াদ শেষ হওয়ার পূর্বে কোচিং সেন্টারের ডিরেক্টর ও অ্যাডমিনের কাছে স্বয়ংক্রিয় নোটিফিকেশন পাঠানোর সেটিংস।
            </p>
          </div>

          <button
            type="button"
            onClick={handleTriggerTestAlert}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Smartphone size={14} className="text-emerald-600" />
            <span>টেস্ট এসএমএস এলার্ট পাঠান</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* SMS Alert */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Smartphone size={16} className="text-indigo-600" />
                এসএমএস (SMS) রিমাইন্ডার
              </span>
              <input
                type="checkbox"
                checked={subscription.smsAlertsEnabled}
                onChange={() => toggleAlert('sms')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              মেয়াদ শেষ হওয়ার ৭ দিন, ৩ দিন ও ১ দিন আগে কোচিংয়ের নিবন্ধিত নম্বরে ({coachingProfile.phone}) সতর্কবার্তা পাঠানো হবে।
            </p>
          </div>

          {/* Email Alert */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                ইমেইল ইনভয়েস ও নোটিশ
              </span>
              <input
                type="checkbox"
                checked={subscription.emailAlertsEnabled}
                onChange={() => toggleAlert('email')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              ডিজিটাল ইনভয়েস এবং মানি রিসিট পিডিএফ কপি স্বয়ংক্রিয়ভাবে {coachingProfile.email || 'coaching@mail.com'}-এ যাবে।
            </p>
          </div>

          {/* WhatsApp Alert */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                হোয়াটসঅ্যাপ স্মার্ট বট
              </span>
              <input
                type="checkbox"
                checked={subscription.whatsappAlertsEnabled}
                onChange={() => toggleAlert('whatsapp')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              হোয়াটসঅ্যাপের মাধ্যমে এক ক্লিকেই সরাসরি বিকাশ ও নগদে রিনিউয়াল লিংক পাওয়ার সুবিধা।
            </p>
          </div>

        </div>
      </div>

      {/* Invoices & Payment History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            পেমেন্ট হিস্ট্রি ও ইনভয়েস রসিদসমূহ
          </h3>
          <span className="text-xs text-slate-500 font-bold">{invoices.length}টি ইনভয়েস পাওয়া গেছে</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">ইনভয়েস নং</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">প্যাকেজ</th>
                <th className="py-3 px-4">বিলিং চক্র</th>
                <th className="py-3 px-4">পেমেন্ট মেথড</th>
                <th className="py-3 px-4">ট্রানজেকশন আইডি</th>
                <th className="py-3 px-4">টাকার পরিমাণ</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">রসিদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{inv.invoiceNo}</td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{inv.planName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.cycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'}</td>
                  <td className="py-3.5 px-4 font-bold uppercase text-slate-700">{inv.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{inv.transactionId}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {inv.amount === 0 ? '৳০ (ফ্রি)' : `৳${inv.amount.toLocaleString('bn-BD')}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      পরিশোধিত
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForView(inv)}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                    >
                      <Printer size={13} />
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-2xl">{coachingProfile.logo}</span>
                <h3 className="text-lg font-black text-slate-900">{coachingProfile.name}</h3>
                <p className="text-xs text-slate-500">{coachingProfile.address}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  অফিসিয়াল মানি রিসিট
                </span>
                <div className="text-xs font-bold text-slate-900 mt-2">{selectedInvoiceForView.invoiceNo}</div>
                <div className="text-[11px] text-slate-500">{selectedInvoiceForView.date}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">প্যাকেজ বিবরণ:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceForView.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">বিলিং চক্র:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceForView.cycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">পেমেন্ট গেটওয়ে:</span>
                <span className="font-bold uppercase text-slate-900">{selectedInvoiceForView.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedInvoiceForView.transactionId}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-sm border-t border-slate-200">
                <span className="text-slate-800">মোট পরিশোধিত:</span>
                <span className="text-emerald-700">
                  {selectedInvoiceForView.amount === 0 ? '৳০ (ফ্রি ট্রায়াল)' : `৳${selectedInvoiceForView.amount.toLocaleString('bn-BD')}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForView(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {selectedPlanForPayment && (
        <PaymentGatewayModal
          plan={selectedPlanForPayment}
          cycle={billingCycle}
          coachingProfile={coachingProfile}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={(newInvoice, nextRenewal) => {
            handlePaymentSuccess(newInvoice, nextRenewal);
          }}
        />
      )}

    </div>
  );
};
