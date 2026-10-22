import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Save, User, Camera, Mail, Code, Database, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { User as UserType } from '../../types';
import { supabase } from '../../supabase';

interface SettingsProps {
  user: UserType | null;
  onUpdateUser: (updatedUser: Partial<UserType>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [isDevMode, setIsDevMode] = useState(() => localStorage.getItem('dapathshala_dev_mode') === 'true');
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSupabase = async () => {
      if (!supabase) {
        setSupabaseStatus('error');
        return;
      }
      
      try {
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        // Note: _test_connection might not exist, but we just want to see if the client can talk to the server
        // If we get an error that isn't a network error, it usually means we are connected but the table doesn't exist
        if (error && error.message.includes('FetchError')) {
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        setSupabaseStatus('error');
      }
    };
    checkSupabase();
  }, []);

  const handleSaveProfile = () => {
    onUpdateUser({ name, email, avatar });
    alert('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          সেটিংস
        </h1>
        <p className="mt-1 text-slate-500">আপনার প্রোফাইল এবং অ্যাপ্লিকেশনের কনফিগারেশন পরিচালনা করুন।</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <User size={18} className="text-emerald-600" />
                প্রোফাইল তথ্য সংশোধন
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-emerald-500 overflow-hidden flex items-center justify-center text-slate-400">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
                <p className="text-xs text-slate-500">আপনার প্রোফাইল ছবি পরিবর্তন করতে ক্যামেরায় ক্লিক করুন</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">আপনার নাম</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ইমেইল ঠিকানা</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button onClick={handleSaveProfile} className="w-full gap-2 rounded-xl py-6 shadow-lg shadow-emerald-100">
                  <Save size={18} />
                  প্রোফাইল আপডেট করুন
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Other Settings */}
        <div className="space-y-8">
          {/* Supabase Connection Status */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Database size={18} className="text-emerald-600" />
                সুপাবেজ কানেকশন
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    supabaseStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : 
                    supabaseStatus === 'error' ? 'bg-red-100 text-red-600' : 
                    'bg-slate-200 text-slate-400'
                  }`}>
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">কানেকশন স্ট্যাটাস</h3>
                    <p className="text-xs text-slate-500">
                      {supabaseStatus === 'connected' ? 'সফলভাবে কানেক্টেড' : 
                       supabaseStatus === 'error' ? 'কানেকশন ত্রুটি' : 
                       'যাচাই করা হচ্ছে...'}
                    </p>
                  </div>
                </div>
                {supabaseStatus === 'connected' ? (
                  <CheckCircle2 className="text-emerald-500" size={24} />
                ) : supabaseStatus === 'error' ? (
                  <XCircle className="text-red-500" size={24} />
                ) : (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                )}
              </div>

              {supabaseStatus === 'error' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
                  <p className="font-bold mb-1">কনফিগারেশন প্রয়োজন!</p>
                  <p className="opacity-90">
                    দয়া করে অ্যাপ সেটিংস (Settings) থেকে <b>VITE_SUPABASE_URL</b> এবং <b>VITE_SUPABASE_ANON_KEY</b> এনভায়রনমেন্ট ভেরিয়েবলগুলো সেট করুন।
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  সুপাবেজ ড্যাশবোর্ড
                </a>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl bg-slate-900 text-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Code size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">ডেভেলপার মোড</h3>
                    <p className="text-[10px] text-slate-400">অ্যাডভান্সড ডিবাগিং টুলস সক্রিয় করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const next = !isDevMode;
                    setIsDevMode(next);
                    localStorage.setItem('dapathshala_dev_mode', String(next));
                    window.location.reload();
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative ${isDevMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDevMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
