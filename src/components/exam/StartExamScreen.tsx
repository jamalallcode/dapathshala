import React from "react";
import * as jsxRuntimeExports from "react/jsx-runtime";
const reactExports = React;
import { ArrowLeft, Clock, FileCheck, ShieldCheck, Play, CircleCheck, FileText, GraduationCap } from "lucide-react";
import { LiveExamEngine } from "./LiveExamEngine";
import { AssignedTest } from "../../types";

interface StartExamScreenProps {
  test: AssignedTest;
  onExit: () => void;
}

export const StartExamScreen = ({ test, onExit }) => {
  const [isExamStarted, setIsExamStarted] = reactExports.useState(false);
  const [isReviewMode, setIsReviewMode] = reactExports.useState(false);
  const isAlreadySubmitted = test.status === "submitted" || test.status === "reviewed";
  if (isExamStarted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      LiveExamEngine,
      {
        test,
        onExit,
        isReviewOnly: false
      }
    );
  }
  if (isReviewMode) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      LiveExamEngine,
      {
        test,
        onExit,
        isReviewOnly: true
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onExit,
        className: "inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ড্যাশবোর্ডে ফিরে যান" })
        ]
      }
    ),
    isAlreadySubmitted ? (
      /* Already Submitted State (User Request 4 - 3rd image) */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-10 h-10 sm:w-12 sm:h-12" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200", children: "পরীক্ষা সম্পন্ন হয়েছে" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black text-slate-900", children: "উত্তরপত্র সফলভাবে জমা দেওয়া হয়েছে!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed", children: [
            "আপনি ইতিমধ্যে ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-800", children: [
              '"',
              test.title,
              '"'
            ] }),
            " পরীক্ষায় অংশগ্রহণ করেছেন। পুনরায় পরীক্ষা দেওয়ার সুযোগ নেই।"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-left space-y-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "শিক্ষার্থী:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: test.studentName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "বিষয় ও অধ্যায়:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-800", children: [
              test.subject,
              " (",
              test.chapter,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "মূল্যায়ন অবস্থা:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-600", children: test.score !== void 0 ? `প্রাপ্ত নম্বর: ${test.score}/${test.totalMarks || 100}` : "খাতা অভিভাবকের মূল্যায়নাধীন" })
          ] }),
          test.parentComment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-200 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 block mb-0.5", children: "অভিভাবকের মন্তব্য:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "italic text-slate-700 font-medium", children: [
              '"',
              test.parentComment,
              '"'
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsReviewMode(true),
              className: "flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "উত্তরপত্র পর্যালোচনা করুন" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onExit,
              className: "py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-all",
              children: "ড্যাশবোর্ড"
            }
          )
        ] })
      ] })
    ) : (
      /* Ready to take exam */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-8 h-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200", children: test.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black text-slate-900", children: test.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: test.chapter })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-400", children: "সময়সীমা" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-slate-800", children: [
                test.durationMinutes,
                " মিনিট"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-400", children: "মোট প্রশ্ন" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-slate-800", children: [
                test.questionCount,
                "টি"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-slate-600 bg-amber-50/70 p-4 rounded-2xl border border-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-bold text-amber-800 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "পরীক্ষার নির্দেশনাবলী" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1.5 text-slate-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "পরীক্ষা শুরু করার পর টাইমার চলবে ও কোনো প্রশ্ন বাদ থাকবে না।" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "নকল প্রতিরোধে ফ্রন্ট ক্যামেরা ও ফুলস্ক্রিন নজরদারি সক্রিয় থাকবে।" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "ট্যাব পরিবর্তন বা অন্য অ্যাপে যাওয়া সম্পূর্ণ নিষিদ্ধ।" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "নির্ধারিত সময় শেষে খাতা স্বয়ংক্রিয়ভাবে অভিভাবকের কাছে জমা হবে।" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsExamStarted(true),
            className: "w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 fill-white" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "পরীক্ষা শুরু করুন" })
            ]
          }
        )
      ] })
    )
  ] }) });
};
