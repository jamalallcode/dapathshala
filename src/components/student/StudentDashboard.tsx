import React, { useState, useEffect } from "react";
import { 
  BookOpen, Clock, GraduationCap, Flame, Zap, 
  CircleCheck, CirclePlay, FileCheck, CircleAlert, Key, ArrowRight 
} from "lucide-react";
import { 
  getStoredTests, 
  saveStoredTests, 
  fetchTestFromServer, 
  generateFallbackTestForPin 
} from "../../lib/storage";
import { AssignedTest } from "../../types";

interface StudentDashboardProps {
  onStartExam: (test: AssignedTest) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onStartExam }) => {
  const [tests, setTests] = useState<AssignedTest[]>([]);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    setTests(getStoredTests());
    const handleUpdate = () => setTests(getStoredTests());
    window.addEventListener("dapathshala_tests_updated", handleUpdate);
    return () => window.removeEventListener("dapathshala_tests_updated", handleUpdate);
  }, []);

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError("");
    const trimmed = pinInput.trim();
    if (!trimmed) {
      setPinError("দয়া করে ৬-সংখ্যার পিন কোডটি লিখুন");
      return;
    }
    const currentTests = getStoredTests();
    let matched = currentTests.find(
      t => t.pin === trimmed || t.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (!matched) {
      const serverTest = await fetchTestFromServer(trimmed);
      if (serverTest) {
        matched = serverTest;
        saveStoredTests([serverTest, ...currentTests]);
      }
    }

    if (!matched) {
      const fallback = generateFallbackTestForPin(trimmed);
      if (fallback) {
        matched = fallback;
        saveStoredTests([fallback, ...currentTests]);
      }
    }

    if (matched) {
      onStartExam(matched);
    } else {
      setPinError("এই পিনের কোনো পরীক্ষা পাওয়া যায়নি। সঠিক পিন (যেমন: 787193) দিন।");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>শিক্ষার্থী কর্নার</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">শিক্ষার্থী কর্নারে স্বাগতম!</h1>
            <p className="mt-1 text-emerald-100 text-xs sm:text-sm">
              অভিভাবকের নির্ধারিত পরীক্ষাগুলো সম্পন্ন করুন এবং নিজের দক্ষতা বৃদ্ধি করুন।
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <Flame className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-xs text-emerald-100 uppercase font-bold">ধারাবাহিকতা</p>
                <p className="text-base font-black">৭ দিন</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <div>
                <p className="text-xs text-emerald-100 uppercase font-bold">পয়েন্টস</p>
                <p className="text-base font-black">২৪৫০ XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Moved PIN Entry Section (Clean Student Workspace) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
            <Key className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              পরীক্ষার পিন কোড (PIN) আছে?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              অভিভাবক বা শিক্ষকের দেওয়া ৬-সংখ্যার পিন দিয়ে সরাসরি পরীক্ষায় অংশ নিন
            </p>
          </div>
        </div>

        <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="পিন কোড লিখুন (যেমন: 787193)"
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold outline-hidden text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200/80 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>পরীক্ষায় যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {pinError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <CircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{pinError}</span>
        </div>
      )}

      {/* 3. Assigned Test List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>আপনার জন্য নির্ধারিত পরীক্ষা তালিকা</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            মোট পরীক্ষা: {tests.length}টি
          </span>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
            <CircleCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">সব পরীক্ষা সম্পন্ন হয়েছে!</h3>
            <p className="text-xs text-slate-400 mt-1">
              অভিভাবক নতুন পরীক্ষা অ্যাসাইন করলে এখানে দেখতে পাবেন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => {
              const isSubmitted = test.status === "submitted" || test.status === "reviewed";
              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        {test.subject}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          test.status === "reviewed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : test.status === "submitted"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800 animate-pulse"
                        }`}
                      >
                        {test.status === "reviewed"
                          ? "✓ খাতা দেখা হয়েছে"
                          : test.status === "submitted"
                          ? "⏳ খাতা মূল্যায়নাধীন"
                          : "পরীক্ষা বাকি"}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">{test.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{test.chapter}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {test.durationMinutes} মিনিট
                      </span>
                      <span>প্রশ্ন: {test.questionCount}টি</span>
                      <span>পূর্ণমান: {test.totalMarks || 100}</span>
                    </div>

                    {/* Show Parent Comment in Student Card if reviewed */}
                    {test.status === "reviewed" && test.parentComment && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-indigo-900 block">💬 অভিভাবকের মন্তব্য:</span>
                        <p className="text-slate-800 italic font-medium leading-relaxed">
                          "{test.parentComment}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {test.status === "reviewed" ? (
                      <div className="flex items-center gap-2">
                        <CircleCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-700">
                          প্রাপ্ত নম্বর: {test.score !== undefined ? `${test.score}%` : "৮৫%"}
                        </span>
                      </div>
                    ) : test.status === "submitted" ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">
                          খাতা মূল্যায়নাধীন
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 font-bold flex items-center gap-1">
                        <CircleAlert className="w-4 h-4" />
                        <span>প্রস্তুত হলে শুরু করুন</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => onStartExam(test)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        test.status === "reviewed"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          : isSubmitted
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 active:scale-95"
                      }`}
                    >
                      {test.status === "reviewed" ? (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>ফলাফল ও সমাধান</span>
                        </>
                      ) : isSubmitted ? (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>খাতার অবস্থা</span>
                        </>
                      ) : (
                        <>
                          <CirclePlay className="w-4 h-4" />
                          <span>পরীক্ষা শুরু করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
