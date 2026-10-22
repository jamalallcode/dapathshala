import React, { useState } from 'react';
import { 
  X, 
  Swords, 
  Sparkles, 
  Users, 
  Search, 
  Check, 
  Copy, 
  Clock, 
  Trophy, 
  Zap, 
  Radio, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { PeerFriend, SubjectType } from './types';
import { INITIAL_PEER_FRIENDS } from './communityData';

interface ChallengeFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBattle: (subject: SubjectType, opponent: PeerFriend) => void;
}

const CHALLENGE_SUBJECTS: { id: SubjectType; label: string; icon: string; color: string }[] = [
  { id: 'পদার্থবিজ্ঞান', label: 'পদার্থবিজ্ঞান', icon: '⚡', color: 'from-blue-600 to-indigo-700' },
  { id: 'রসায়ন', label: 'রসায়ন', icon: '🧪', color: 'from-purple-600 to-pink-700' },
  { id: 'উচ্চতর গণিত', label: 'উচ্চতর গণিত', icon: '📐', color: 'from-amber-500 to-orange-600' },
  { id: 'জীববিজ্ঞান', label: 'জীববিজ্ঞান', icon: '🌿', color: 'from-emerald-600 to-teal-700' },
  { id: 'আইসিটি', label: 'আইসিটি', icon: '💻', color: 'from-cyan-600 to-blue-700' },
  { id: 'বাংলা ও ইংরেজি', label: 'বাংলা ও ইংরেজি', icon: '📚', color: 'from-rose-600 to-red-700' },
  { id: 'সাধারণ জ্ঞান', label: 'সাধারণ জ্ঞান', icon: '🌍', color: 'from-slate-700 to-slate-900' },
];

export const ChallengeFriendModal: React.FC<ChallengeFriendModalProps> = ({
  isOpen,
  onClose,
  onStartBattle
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('পদার্থবিজ্ঞান');
  const [activeTab, setActiveTab] = useState<'friends' | 'random' | 'code'>('friends');
  const [isSearchingRandom, setIsSearchingRandom] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<PeerFriend | null>(null);
  const [inviteCode] = useState(() => 'DUEL-' + Math.floor(1000 + Math.random() * 9000));
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://dapathshala.com/duel?room=${inviteCode}&subject=${encodeURIComponent(selectedSubject)}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFindRandom = () => {
    setIsSearchingRandom(true);
    setMatchedOpponent(null);

    // Realistic match search
    setTimeout(() => {
      const randomOpponent = INITIAL_PEER_FRIENDS[Math.floor(Math.random() * INITIAL_PEER_FRIENDS.length)];
      setMatchedOpponent(randomOpponent);
      setIsSearchingRandom(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Swords size={16} />
            Challenge a Friend • ১ বনাম ১ কুইজ লড়াই
          </div>
          <h2 className="text-2xl font-black text-white">
            বন্ধুকে চ্যালেঞ্জ করার প্রস্তুতি নিন
          </h2>
          <p className="text-indigo-200 text-xs mt-1">
            ১০টি লাইভ কুইজ প্রশ্নের দ্রুত উত্তর দিন। সর্বোচ্চ নির্ভুলতা ও গতি দিয়ে অর্জন করুন পয়েন্ট!
          </p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* STEP 1: Select Battle Subject */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              ১. চ্যালেঞ্জের বিষয় নির্বাচন করুন
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CHALLENGE_SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    selectedSubject === sub.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xl shrink-0">{sub.icon}</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{sub.label}</h5>
                    <span className="text-[10px] text-slate-500">১০টি কুইজ</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Choose Opponent Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              ২. প্রতিপক্ষ নির্বাচন করুন
            </label>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setActiveTab('friends')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'friends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                অনলাইন সহপাঠী
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('random')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'random' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                র‍্যান্ডম প্রতিদ্বন্দ্বী
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                রুম কোড / লিংক
              </button>
            </div>

            {/* TAB 1: Friends List */}
            {activeTab === 'friends' && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {INITIAL_PEER_FRIENDS.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-3xl">{friend.avatar}</span>
                        <span 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            friend.status === 'online' ? 'bg-emerald-500' : friend.status === 'in_game' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{friend.name}</h5>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                            রেটিং: {friend.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{friend.institution}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartBattle(selectedSubject, friend)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95"
                    >
                      <Swords size={14} />
                      <span>চ্যালেঞ্জ দিন</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Random Matchmaking */}
            {activeTab === 'random' && (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                {isSearchingRandom ? (
                  <div className="py-6 space-y-3">
                    <Loader2 size={36} className="text-indigo-600 animate-spin mx-auto" />
                    <h4 className="font-bold text-slate-900 text-sm">অনলাইন শিক্ষার্থী খোঁজা হচ্ছে...</h4>
                    <p className="text-xs text-slate-500">
                      আপনার দক্ষতা ও রেটিং অনুযায়ী ঢাকা, চট্টগ্রাম বা রাজশাহীর উপযুক্ত প্রতিদ্বন্দ্বী ম্যাচ করা হচ্ছে।
                    </p>
                  </div>
                ) : matchedOpponent ? (
                  <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                      <Sparkles size={14} />
                      প্রতিদ্বন্দ্বী পাওয়া গেছে!
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between max-w-sm mx-auto">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{matchedOpponent.avatar}</span>
                        <div className="text-left">
                          <h5 className="font-bold text-slate-900 text-sm">{matchedOpponent.name}</h5>
                          <p className="text-xs text-slate-500">{matchedOpponent.institution}</p>
                          <span className="text-[10px] text-indigo-600 font-bold">রেটিং: {matchedOpponent.rating} • জয়: {matchedOpponent.wins}টি</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartBattle(selectedSubject, matchedOpponent)}
                      className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-200 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>এখনই ডুয়েল যুদ্ধ শুরু করুন</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 py-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Radio size={24} className="animate-pulse" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">দ্রুত অটো-ম্যাচমেকিং</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      যেকোনো সক্রিয় শিক্ষার্থীর সাথে তাৎক্ষণিক ১০টি প্রশ্নের লাইভ কুইজে মুখোমুখি লড়াই শুরু করুন।
                    </p>
                    <button
                      type="button"
                      onClick={handleFindRandom}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      প্রতিদ্বন্দ্বী অনুসন্ধান করুন
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Invite Code / Link */}
            {activeTab === 'code' && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">আপনার ডুয়েল রুম কোড</h4>
                  <p className="text-[11px] text-slate-500">
                    বন্ধুকে এই কোডটি মেসেঞ্জার, হোয়াটসঅ্যাপ বা ক্লাসরুমে পাঠিয়ে জয়েন করতে বলুন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-base font-black text-indigo-700 tracking-wider">
                    {inviteCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleFriend = INITIAL_PEER_FRIENDS[0];
                      onStartBattle(selectedSubject, sampleFriend);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    সরাসরি ডেমো প্রতিপক্ষের সাথে টেস্ট শুরু করুন →
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Rules Briefing */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <Zap size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">ডুয়েল যুদ্ধের নিয়মাবলী:</strong> মোট ১০টি প্রশ্ন থাকবে। প্রতি প্রশ্নের জন্য ১৫ সেকেন্ড সময়। যত দ্রুত সঠিক উত্তর দেবেন, তত বেশি স্পিড ও স্ট্রিক বোনাস পয়েন্ট পাবেন!
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
