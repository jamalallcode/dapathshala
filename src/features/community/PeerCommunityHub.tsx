import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Swords, 
  Trophy, 
  Flame, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Share2,
  TrendingUp,
  Star
} from 'lucide-react';
import { CommunityAnswer, CommunityQuestion, PeerFriend, SubjectType } from './types';
import { INITIAL_QUESTIONS, INITIAL_PEER_FRIENDS } from './communityData';
import { PeerForumFeed } from './PeerForumFeed';
import { ChallengeFriendModal } from './ChallengeFriendModal';
import { LiveChallengeEngine } from './LiveChallengeEngine';

export const PeerCommunityHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'forum' | 'challenge' | 'leaderboard'>('forum');
  
  // Persistent questions in localStorage
  const [questions, setQuestions] = useState<CommunityQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_community_questions');
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  // Active Live Challenge Battle state
  const [activeBattle, setActiveBattle] = useState<{
    subject: SubjectType;
    opponent: PeerFriend;
  } | null>(null);

  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_community_questions', JSON.stringify(questions));
    } catch {}
  }, [questions]);

  // Handlers for Questions & Forum Feed
  const handleAddQuestion = (newQ: CommunityQuestion) => {
    setQuestions([newQ, ...questions]);
  };

  const handleAddAnswer = (questionId: string, newAns: CommunityAnswer) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [...q.answers, newAns]
        };
      }
      return q;
    }));
  };

  const handleVoteQuestion = (questionId: string, type: 'up' | 'down') => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (q.userVote === type) {
          // toggle off
          return {
            ...q,
            upvotes: type === 'up' ? q.upvotes - 1 : q.upvotes,
            downvotes: type === 'down' ? q.downvotes - 1 : q.downvotes,
            userVote: undefined
          };
        } else {
          return {
            ...q,
            upvotes: type === 'up' ? (q.userVote === 'down' ? q.upvotes + 1 : q.upvotes + 1) : (q.userVote === 'up' ? q.upvotes - 1 : q.upvotes),
            downvotes: type === 'down' ? (q.userVote === 'up' ? q.downvotes + 1 : q.downvotes + 1) : (q.userVote === 'down' ? q.downvotes - 1 : q.downvotes),
            userVote: type
          };
        }
      }
      return q;
    }));
  };

  const handleVoteAnswer = (questionId: string, answerId: string, type: 'up' | 'down') => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(ans => {
            if (ans.id === answerId) {
              const newUp = ans.userVote === 'up' ? ans.upvotes - 1 : ans.upvotes + 1;
              return {
                ...ans,
                upvotes: newUp,
                userVote: ans.userVote === 'up' ? undefined : 'up'
              };
            }
            return ans;
          })
        };
      }
      return q;
    }));
  };

  const handleMarkAcceptedAnswer = (questionId: string, answerId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          hasAcceptedAnswer: true,
          answers: q.answers.map(ans => ({
            ...ans,
            isAccepted: ans.id === answerId
          }))
        };
      }
      return q;
    }));
  };

  // Start battle from challenge modal or peer list
  const handleStartBattle = (subject: SubjectType, opponent: PeerFriend) => {
    setShowChallengeModal(false);
    setActiveBattle({ subject, opponent });
  };

  // If live battle is ongoing, render Live Challenge Engine!
  if (activeBattle) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
        <LiveChallengeEngine
          subject={activeBattle.subject}
          opponent={activeBattle.opponent}
          onExit={() => setActiveBattle(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Users size={14} className="text-indigo-600" />
            <span>দা-পাঠশালা পিয়ার কমিউনিটি ও চ্যালেঞ্জ হাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            স্টুডেন্ট পিয়ার ফোরাম ও <span className="text-indigo-600">লাইভ ডুয়েল</span>
          </h1>
          <p className="mt-1 text-slate-500 text-xs sm:text-sm">
            বাংলাদেশের যেকোনো কোচিং বা কলেজের সহপাঠীদের সাথে প্রশ্ন-উত্তর শেয়ার করুন এবং ১০ লাইভ কুইজে বন্ধুকে চ্যালেঞ্জ জানান।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChallengeModal(true)}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Swords size={17} />
            <span>বন্ধুকে চ্যালেঞ্জ করুন</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('forum')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'forum'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare size={15} />
          <span>পাবলিক ফোরাম ও ফিড ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('challenge')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'challenge'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
          }`}
        >
          <Swords size={15} />
          <span>চ্যালেঞ্জ এ ফ্রেন্ড (১০ কুইজ ডুয়েল)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'leaderboard'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy size={15} />
          <span>ডুয়েল চ্যাম্পিয়ন লিডারবোর্ড</span>
        </button>
      </div>

      {/* SUB-TAB 1: Public Peer Forum Feed */}
      {activeSubTab === 'forum' && (
        <PeerForumFeed
          questions={questions}
          onAddQuestion={handleAddQuestion}
          onAddAnswer={handleAddAnswer}
          onVoteQuestion={handleVoteQuestion}
          onVoteAnswer={handleVoteAnswer}
          onMarkAcceptedAnswer={handleMarkAcceptedAnswer}
          onOpenChallengeModal={() => setShowChallengeModal(true)}
        />
      )}

      {/* SUB-TAB 2: Challenge a Friend Hub */}
      {activeSubTab === 'challenge' && (
        <div className="space-y-6">
          
          {/* Quick launch card */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-700/50">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <Flame size={14} />
                লাইভ ১০ কুইজ ব্যাটল এরিনা
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                সহপাঠীদের সাথে সরাসরি মুখোমুখি কুইজ লড়াই
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
                পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান বা আইসিটি বিষয়ে যেকোনো বন্ধুকে আমন্ত্রণ জানান। পয়েন্ট স্ক্যানারের মাধ্যমে রিয়েল-টাইম ফলাফল দেখুন!
              </p>
            </div>

            <button
              onClick={() => setShowChallengeModal(true)}
              className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
            >
              <Swords size={18} />
              <span>নতুন কুইজ চ্যালেঞ্জ তৈরি করুন</span>
            </button>
          </div>

          {/* Active Peer Friends Ready for Battle */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                অনলাইন সহপাঠী ও প্রতিপক্ষ ({INITIAL_PEER_FRIENDS.length} জন সক্রিয়)
              </h3>
              <span className="text-xs text-slate-400">এক ক্লিকেই যুদ্ধ শুরু করুন</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INITIAL_PEER_FRIENDS.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all flex items-center justify-between gap-3"
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
                        <h4 className="font-bold text-slate-900 text-sm">{friend.name}</h4>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                          {friend.rating} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{friend.institution}</p>
                      <span className="text-[11px] text-emerald-600 font-semibold">{friend.wins}টি জয় ({Math.round((friend.wins / friend.matchesPlayed) * 100)}% জয়হার)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartBattle('পদার্থবিজ্ঞান', friend)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Swords size={14} />
                    <span>চ্যালেঞ্জ দিন</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: Duel Champions Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Trophy size={22} className="text-amber-500" />
                লাইভ ডুয়েল চ্যাম্পিয়ন লিডারবোর্ড
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                চলতি সপ্তাহে সবচেয়ে বেশি ডুয়েল জয়ী ও সর্বোচ্চ পয়েন্ট অর্জনকারী শিক্ষার্থীগণ।
              </p>
            </div>

            <button
              onClick={() => setShowChallengeModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer hover:bg-amber-300"
            >
              শীর্ষে পৌঁছাতে চ্যালেঞ্জ করুন
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">র‍্যাংক</th>
                  <th className="py-3 px-4">শিক্ষার্থী</th>
                  <th className="py-3 px-4">প্রতিষ্ঠান ও একাডেমি</th>
                  <th className="py-3 px-4">মোট ডুয়েল</th>
                  <th className="py-3 px-4">মোট জয়</th>
                  <th className="py-3 px-4">রেটিং পয়েন্ট</th>
                  <th className="py-3 px-4 text-right">লড়াই</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_PEER_FRIENDS.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-sm">
                      {idx === 0 ? '🥇 ১' : idx === 1 ? '🥈 ২' : idx === 2 ? '🥉 ৩' : `${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{f.avatar}</span>
                        <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{f.institution}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{f.matchesPlayed}টি</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600">{f.wins}টি</td>
                    <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">{f.rating} XP</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleStartBattle('পদার্থবিজ্ঞান', f)}
                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <Swords size={12} />
                        লড়ুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Challenge a Friend Modal */}
      <ChallengeFriendModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onStartBattle={handleStartBattle}
      />

    </div>
  );
};
