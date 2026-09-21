import React from 'react';
import BookQuestionPaperBuilder from './PaperBuilder/BookQuestionPaperBuilder';

export default function QuestionStudio() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-6 pt-3 sm:pt-5 font-sans">
      <div className="w-full max-w-[1800px] 2xl:max-w-[1860px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Directly render database question bank & paper builder */}
        <BookQuestionPaperBuilder />
      </div>
    </div>
  );
}
