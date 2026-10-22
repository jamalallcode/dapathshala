import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Layout,
  CheckCircle,
  Menu,
  X,
  FileText,
  ShoppingBag,
  Award,
  Zap,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  HelpCircle,
  BrainCircuit
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';

interface LandingPageProps {
  user?: User | null;
  onDashboardClick?: () => void;
  onGetStarted: () => void;
  onFeatureClick: (tab: string) => void;
  onSignInClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  user,
  onDashboardClick,
  onGetStarted, 
  onFeatureClick,
  onSignInClick,
  onRegisterClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <HelpCircle className="text-emerald-600" size={28} />,
      title: "এআই ডাউট সলভার",
      desc: "কঠিন অঙ্ক বা বৈজ্ঞানিক প্রশ্নে আটকে গেলে তাৎক্ষণিক ধাপে ধাপে বাংলা সমাধান ও টিপস।",
      tab: "doubt-solver"
    },
    {
      icon: <BrainCircuit className="text-indigo-600" size={28} />,
      title: "স্মার্ট রিভিশন ও উইক-পয়েন্ট",
      desc: "স্পেসড রিপিটেশন অ্যালগরিদম দিয়ে দুর্বল চ্যাপ্টারগুলো মনে রাখার বৈজ্ঞানিক পদ্ধতি।",
      tab: "smart-revision"
    },
    {
      icon: <Users className="text-indigo-600" size={28} />,
      title: "অভিভাবক কন্ট্রোল প্যানেল",
      desc: "সন্তানের পড়ার সময় পর্যবেক্ষণ, কাস্টম পরীক্ষা অ্যাসাইন ও প্রগ্রেস রিপোর্ট কার্ড ডাউনলোড।",
      tab: "parent-dashboard"
    },
    {
      icon: <Globe className="text-emerald-600" size={28} />,
      title: "অনলাইন এক্সাম পোর্টাল",
      desc: "এমসিকিউ ও সৃজনশীল মডেল টেস্ট, লাইভ টাইমার এবং সারা দেশের শিক্ষার্থীদের সাথে মেধা যাচাই।",
      tab: "exams"
    },
    {
      icon: <Layout className="text-blue-600" size={28} />,
      title: "কোচিং সেন্টার ও ব্যাচ ম্যানেজার",
      desc: "শিক্ষার্থী ভর্তি, এক ক্লিকে হাজিরা/উপস্থিতি, টিউশন ফি ট্র্যাকার ও নোটিশ বোর্ড।",
      tab: "coaching"
    },
    {
      icon: <BookOpen className="text-purple-600" size={28} />,
      title: "ডিজিটাল নোট স্টোর",
      desc: "সেরা শিক্ষক ও শিক্ষার্থীদের তৈরি বিষয়ভিত্তিক হ্যান্ডনোট ও স্টাডি মেটেরিয়াল সংগ্রহ।",
      tab: "notes"
    }
  ];

  const pricingPlans = [
    {
      name: "সাধারণ শিক্ষার্থী",
      price: "ফ্রি",
      desc: "নিয়মিত পড়ার প্রস্তুতি ও সেলফ স্টাডির জন্য",
      features: [
        "প্রতিদিন আনলিমিটেড এআই কুইজ",
        "অধ্যায়ভিত্তিক প্র্যাকটিস প্রশ্ন",
        "লিডারবোর্ড ও অর্জনসমূহ",
        "ডিজিটাল ফ্ল্যাশকার্ড"
      ],
      popular: false,
      tab: "ai-gen"
    },
    {
      name: "অভিভাবক ও পরিবার",
      price: "৳২৯৯ / মাস",
      desc: "সন্তানের পড়াশোনা ও পরীক্ষার পূর্ণ নজরদারির জন্য",
      features: [
        "সন্তানের অ্যাকাউন্ট লিংক সুবিধা",
        "কাস্টম পরীক্ষা নির্ধারণ ও সময়সীমা",
        "এআই এবং ম্যানুয়াল খাতা মূল্যায়ন",
        "দৈনিক ও সাপ্তাহিক প্রগ্রেস রিপোর্ট"
      ],
      popular: true,
      tab: "parent-dashboard"
    },
    {
      name: "কোচিং ও প্রতিষ্ঠান",
      price: "৳৯৯৯ / মাস",
      desc: "কোচিং সেন্টার ও ব্যাচ পরিচালনার পূর্ণাঙ্গ সল্যুশন",
      features: [
        "আনলিমিটেড ব্যাচ ও শিক্ষার্থী তালিকা",
        "লাইভ অনলাইন পরীক্ষা ও র‍্যাঙ্কিং",
        "নোটিশ বোর্ড ও ক্লাস শিডিউল",
        "উন্নত পারফরম্যান্স অ্যানালিটিক্স"
      ],
      popular: false,
      tab: "coaching"
    }
  ];

  const navMenuItems = [
    { label: "ডাউট সলভার", action: () => onFeatureClick('doubt-solver'), isSpecial: true },
    { label: "অভিভাবক প্যানেল", action: () => onFeatureClick('parent-dashboard'), isSpecial: true },
    { label: "অনলাইন এক্সাম পোর্টাল", action: () => onFeatureClick('exams') },
    { label: "কোচিং ব্যবস্থাপনা", action: () => onFeatureClick('coaching') },
    { label: "স্মার্ট রিভিশন", action: () => onFeatureClick('smart-revision') },
    { label: "নোট স্টোর", action: () => onFeatureClick('notes') },
    { label: "ফিচারসমূহ", href: "#features" },
    { label: "প্রাইসিং", href: "#pricing" },
  ];

  const handleNavClick = (item: typeof navMenuItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200 font-bold">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              দা<span className="text-emerald-600">পাঠশালা</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-6 text-[13px] font-semibold text-slate-600">
            {navMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                className={`transition-colors py-1 cursor-pointer whitespace-nowrap ${
                  item.isSpecial 
                    ? 'text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50/70 hover:bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200/60' 
                    : 'hover:text-emerald-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Medium screen navigation (compact) */}
          <div className="hidden lg:flex xl:hidden items-center gap-4 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => onFeatureClick('parent-dashboard')} 
              className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
            >
              অভিভাবক প্যানেল
            </button>
            <button 
              onClick={() => onFeatureClick('exams')} 
              className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
            >
              এক্সাম পোর্টাল
            </button>
            <button onClick={() => onFeatureClick('coaching')} className="hover:text-emerald-600">
              কোচিং
            </button>
            <button onClick={() => onFeatureClick('notes')} className="hover:text-emerald-600">
              নোট স্টোর
            </button>
            <a href="#features" className="hover:text-emerald-600">ফিচারসমূহ</a>
            <a href="#pricing" className="hover:text-emerald-600">প্রাইসিং</a>
          </div>

          {/* Right Action Area - Always show prominent Login & Register options */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <div 
                onClick={onDashboardClick}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-all cursor-pointer group shadow-xs mr-0.5"
                title="চলমান অ্যাকাউন্টে প্রবেশ করুন"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'ইউ'
                  )}
                </div>
                <p className="text-xs font-bold text-emerald-800 truncate max-w-[95px]">
                  {user.name || user.email?.split('@')[0]}
                </p>
                <ChevronRight size={13} className="text-emerald-600" />
              </div>
            )}

            <button 
              onClick={onSignInClick}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              লগইন
            </button>
            
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onRegisterClick} 
              className="rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm shadow-md shadow-emerald-200 font-bold"
            >
              রেজিস্টার
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl"
            >
              <div className="grid grid-cols-1 gap-1.5">
                {navMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      item.isSpecial
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Action Buttons - Always Visible */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => { onSignInClick(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  লগইন
                </button>
                <button
                  onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200"
                >
                  রেজিস্টার
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Platform Features Section */}
      <section id="features" className="pt-28 pb-16 lg:pt-32 lg:pb-24 bg-slate-50/80 scroll-mt-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              সবকিছু যা আপনার প্রয়োজন
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              অভিভাবক, শিক্ষার্থী ও শিক্ষা প্রতিষ্ঠানের প্রতিটি প্রয়োজনকে মাথায় রেখে প্রস্তুত।
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => onFeatureClick(feature.tab)}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 bg-slate-50 group-hover:bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 transition-colors shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>প্যানেলে যান</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28 bg-white border-t border-slate-100 scroll-mt-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              সহজ ও সাশ্রয়ী
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">
              আমাদের সাবস্ক্রিপশন ও প্রাইসিং
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              আপনার প্রয়োজন অনুযায়ী সেরা প্ল্যানটি বেছে নিন এবং নির্বিঘ্নে পড়াশোনা পরিচালনা করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
                  plan.popular 
                    ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-xl' 
                    : 'border border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    সবচেয়ে জনপ্রিয়
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    onClick={() => onFeatureClick(plan.tab)}
                    className="w-full rounded-xl py-3 text-sm font-bold"
                  >
                    শুরু করুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-100 scroll-mt-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                আমাদের লক্ষ্য
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                বাংলাদেশের প্রতিটি শিক্ষার্থীর জন্য আধুনিক ডিজিটাল পাঠশালা
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                দা পাঠশালা তৈরি হয়েছে শিক্ষার্থীদের পড়াশোনাকে আনন্দদায়ক, অভিভাবকদের জন্য স্বচ্ছ ও সুনিশ্চিত এবং কোচিং বা শিক্ষকদের জন্য সময়সাশ্রয়ী করার লক্ষ্যে।
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <p className="text-2xl font-black text-emerald-600">১০০%</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">স্বচ্ছ মূল্যায়ন ব্যবস্থা</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <p className="text-2xl font-black text-indigo-600">২৪/৭</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">এআই প্রশ্ন ও স্টাডি সাপোর্ট</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900">যোগাযোগ ও সহায়তা</h3>
              <p className="text-sm text-slate-600">
                আমাদের প্ল্যাটফর্ম সম্পর্কিত যেকোনো প্রশ্নের জন্য আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।
              </p>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">ইমেইল ঠিকানা</p>
                    <p className="font-bold">support@dapathshala.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">হেল্পলাইন</p>
                    <p className="font-bold">+৮৮০১৭১০০০০০০০</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">ঠিকানা</p>
                    <p className="font-bold">ঢাকা, বাংলাদেশ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-slate-900 py-20 sm:py-28 px-4 sm:px-8 text-center relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-blue-600/10 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-4xl mx-auto relative z-10"
        >
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            আজই শুরু করুন আপনার ডিজিটাল শিক্ষা যাত্রা
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            হাজারো শিক্ষার্থী ও অভিভাবকের সাথে আপনিও যুক্ত হোন দা পাঠশালায়।
          </p>

          <div className="flex justify-center">
            {user ? (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onDashboardClick} 
                className="px-10 py-4 text-base rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all font-bold"
              >
                প্ল্যাটফর্মে প্রবেশ করুন
                <ArrowRight className="ml-2" size={18} />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onGetStarted} 
                className="px-10 py-4 text-base rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all font-bold"
              >
                এখনি শুরু করুন
                <ArrowRight className="ml-2" size={18} />
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-100 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">দা পাঠশালা</span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">© ২০২৬ দা পাঠশালা। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
            <button onClick={() => onFeatureClick('parent-dashboard')} className="hover:text-emerald-600">অভিভাবক প্যানেল</button>
            <button onClick={() => onFeatureClick('exams')} className="hover:text-emerald-600">এক্সাম পোর্টাল</button>
            <button onClick={() => onFeatureClick('coaching')} className="hover:text-emerald-600">কোচিং</button>
            <button onClick={() => onFeatureClick('notes')} className="hover:text-emerald-600">নোট স্টোর</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
