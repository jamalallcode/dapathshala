import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Layers, 
  Sparkles, 
  X, 
  Lock, 
  Eye, 
  Database,
  ArrowRight,
  RefreshCw,
  Building2,
  BookOpen
} from 'lucide-react';
import { 
  InstitutionPaper, 
  getStoredInstitutionPapers, 
  saveInstitutionPapers, 
  deleteInstitutionPaper,
  pushBulkPapersToServer,
  syncInstitutionPapersWithServer,
  parseRawTextToQuestions
} from '../../lib/institutionPapers';

interface AdminPaperBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPaperBulkUploadModal: React.FC<AdminPaperBulkUploadModalProps> = ({
  isOpen,
  onClose
}) => {
  // Security PIN gate (default 7788, or auto-unlocked for Admin login)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dapathshala_is_admin') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'bulkPaste' | 'fileUpload' | 'manage'>('bulkPaste');

  // Form Fields for Bulk Paste
  const [institutionName, setInstitutionName] = useState('মতিঝিল সরকারি বালিকা উচ্চ বিদ্যালয়');
  const [institutionType, setInstitutionType] = useState<'school' | 'college' | 'cadet' | 'board'>('school');
  const [year, setYear] = useState('২০২৪');
  const [studentClass, setStudentClass] = useState('১০ম শ্রেণি');
  const [subject, setSubject] = useState('বাংলা ১ম পত্র');
  const [examType, setExamType] = useState('টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা');
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Raw Text Paste
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Database list
  const [papersList, setPapersList] = useState<InstitutionPaper[]>([]);
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPapersList(getStoredInstitutionPapers());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '7788' || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('ভুল অ্যাডমিন পিন! সঠিক কোড দিন (ডিফল্ট: 7788)');
    }
  };

  // Parse Raw Text
  const handleParseRawText = () => {
    if (!rawText.trim()) {
      setStatusMessage('অনুগ্রহ করে প্রশ্নপত্রের সফট কপি টেক্সট পেস্ট করুন।');
      return;
    }
    const questions = parseRawTextToQuestions(rawText);
    setParsedPreview(questions);
    setStatusMessage(`✅ সফলভাবে ${questions.length}টি প্রশ্ন চিহ্নিত ও পার্স করা হয়েছে! নিচে প্রিভিউ দেখুন।`);
  };

  // Save parsed single paper
  const handleSaveParsedPaper = async () => {
    if (parsedPreview.length === 0) {
      handleParseRawText();
    }
    const questions = parsedPreview.length > 0 ? parsedPreview : parseRawTextToQuestions(rawText);
    if (questions.length === 0) {
      setStatusMessage('কোনো প্রশ্ন পার্স করা সম্ভব হয়নি। সঠিক ফরম্যাটে টেক্সট দিন।');
      return;
    }

    setIsProcessing(true);
    const newPaper: InstitutionPaper = {
      id: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      institutionName: institutionName.trim(),
      institutionType,
      year: year.trim(),
      studentClass: studentClass.trim(),
      subject: subject.trim(),
      examType: examType.trim(),
      durationMinutes,
      totalMarks: questions.length,
      questionCount: questions.length,
      questions,
      createdAt: new Date().toISOString(),
      isCustomUploaded: true
    };

    saveInstitutionPapers([newPaper]);
    await pushBulkPapersToServer([newPaper]);
    setPapersList(getStoredInstitutionPapers());
    setIsProcessing(false);
    setStatusMessage(`🎉 "${institutionName}" এর প্রশ্নপত্র (${questions.length}টি প্রশ্ন) সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!`);
    setRawText('');
    setParsedPreview([]);
  };

  // Handle Multi-File Upload (.json / .txt)
  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setStatusMessage(`⏳ ${files.length}টি ফাইল প্রসেস ও আপলোড করা হচ্ছে...`);

    const uploadedPapers: InstitutionPaper[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach((item, idx) => {
              uploadedPapers.push({
                ...item,
                id: item.id || `batch_${Date.now()}_${i}_${idx}`,
                createdAt: item.createdAt || new Date().toISOString(),
                isCustomUploaded: true
              });
            });
          } else if (parsed && typeof parsed === 'object') {
            uploadedPapers.push({
              ...parsed,
              id: parsed.id || `batch_${Date.now()}_${i}`,
              createdAt: parsed.createdAt || new Date().toISOString(),
              isCustomUploaded: true
            });
          }
        } else {
          // .txt or raw text file
          const questions = parseRawTextToQuestions(text);
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          uploadedPapers.push({
            id: `txt_${Date.now()}_${i}`,
            institutionName: cleanName || institutionName,
            institutionType,
            year,
            studentClass,
            subject,
            examType,
            durationMinutes: 30,
            totalMarks: questions.length,
            questionCount: questions.length,
            questions,
            createdAt: new Date().toISOString(),
            isCustomUploaded: true
          });
        }
      } catch (err) {
        console.warn(`File ${file.name} processing error:`, err);
      }
    }

    if (uploadedPapers.length > 0) {
      saveInstitutionPapers(uploadedPapers);
      await pushBulkPapersToServer(uploadedPapers);
      setPapersList(getStoredInstitutionPapers());
      setStatusMessage(`🎉 অভিনন্দন! একসাথে ${uploadedPapers.length}টি প্রশ্নপত্র নিমেষেই ডাটাবেজে আপলোড সম্পন্ন হয়েছে!`);
    } else {
      setStatusMessage('ফাইল থেকে প্রশ্নপত্র প্রসেস করা যায়নি। ফরম্যাট যাচাই করুন।');
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download Sample JSON Template
  const handleDownloadSampleTemplate = () => {
    const sample: InstitutionPaper[] = [
      {
        id: 'sample_motijheel_2024',
        institutionName: 'মতিঝিল সরকারি বালিকা উচ্চ বিদ্যালয়',
        institutionType: 'school',
        districtOrBoard: 'ঢাকা',
        year: '২০২৪',
        studentClass: '১০ম শ্রেণি',
        subject: 'বাংলা ১ম পত্র',
        examType: 'টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা',
        durationMinutes: 30,
        totalMarks: 2,
        questionCount: 2,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'sample_q1',
            question: "'পল্লিজননী' কবিতায় মা কেন সন্তানের শিয়রে বসে কাঁদছিলেন?",
            options: ['রোগাক্রান্ত সন্তানের সুস্থতার ব্যাকুলতায়', 'অন্ধকারের ভয়ে', 'শীতের কষ্টে', 'ক্ষুধার জ্বালায়'],
            correctAnswer: 'রোগাক্রান্ত সন্তানের সুস্থতার ব্যাকুলতায়',
            correctAnswerIndex: 0,
            explanation: 'সন্তানের জীবন বাঁচানোর জন্য স্নেহময়ী মায়ের অসহায় ব্যাকুল প্রার্থনা।'
          },
          {
            id: 'sample_q2',
            question: "অপু ও দুর্গার বাবার পেশা কী ছিল?",
            options: ['পুরোহিত ও লেখক', 'ব্যবসায়ী', 'জমিদার', 'শিক্ষক'],
            correctAnswer: 'পুরোহিত ও লেখক',
            correctAnswerIndex: 0,
            explanation: 'হরিহর রায় সামান্য আয়ের লেখক ও গৃহস্থ পুরোহিত ছিলেন।'
          }
        ]
      }
    ];

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'dapathshala_sample_question_paper.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 lg:left-[var(--sidebar-width,208px)] z-[80] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  অ্যাডমিন হাই-স্পিড প্রশ্নপত্র আপলোড পোর্টাল
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-black uppercase tracking-wider">
                  গোপন ও সংরক্ষিত
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                শত শত বা হাজার হাজার প্রশ্নপত্র একসাথে দ্রুত ডাটাবেজে সংরক্ষণ করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Verification View */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-slate-900">অ্যাডমিন সিকিউরিটি কোড দিন</h4>
            <p className="text-xs text-slate-500">
              সাধারণ ব্যবহারকারীদের জন্য এই ডাটাবেজ সুরক্ষিত। অ্যাডমিন পিন কোড দিয়ে প্রবেশ করুন।
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3 pt-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="অ্যাডমিন পিন (ডিফল্ট: 7788)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-center font-mono font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={6}
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-semibold">{pinError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                প্রবেশ করুন
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <>
            {/* Admin Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 text-xs sm:text-sm font-bold shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('bulkPaste'); setStatusMessage(null); }}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'bulkPaste'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>সফট কপি পেস্ট ও স্মার্ট পার্স</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('fileUpload'); setStatusMessage(null); }}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'fileUpload'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>কম্পিউটার হতে মাল্টি-ফাইল আপলোড</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('manage'); setStatusMessage(null); }}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'manage'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span>ডাটাবেজ ও সংরক্ষিত পেপারস ({papersList.length})</span>
              </button>
            </div>

            {/* Notification / Toast Banner */}
            {statusMessage && (
              <div className="p-3 bg-indigo-50 border-b border-indigo-100 text-xs font-bold text-indigo-900 flex items-center justify-between px-6 shrink-0">
                <span>{statusMessage}</span>
                <button type="button" onClick={() => setStatusMessage(null)} className="text-indigo-400 hover:text-indigo-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
              
              {/* TAB 1: Bulk Soft-Copy Paste */}
              {activeTab === 'bulkPaste' && (
                <div className="space-y-4">
                  {/* Metadata Selection */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block">
                      ১. প্রতিষ্ঠানের তথ্য ও শ্রেণি নির্বাচন করুন:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রতিষ্ঠানের নাম</label>
                        <input
                          type="text"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          placeholder="যেমন: মতিঝিল সরকারি বালিকা উচ্চ বিদ্যালয়"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রতিষ্ঠানের ধরন</label>
                        <select
                          value={institutionType}
                          onChange={(e) => setInstitutionType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        >
                          <option value="school">শীর্ষ স্কুল</option>
                          <option value="college">কলেজ</option>
                          <option value="board">শিক্ষা বোর্ড</option>
                          <option value="cadet">ক্যাডেট কলেজ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">সাল (Year)</label>
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">শ্রেণি (Class)</label>
                        <input
                          type="text"
                          value={studentClass}
                          onChange={(e) => setStudentClass(e.target.value)}
                          placeholder="যেমন: ১০ম শ্রেণি"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">বিষয় (Subject)</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="যেমন: বাংলা ১ম পত্র"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">পরীক্ষার ধরন</label>
                        <input
                          type="text"
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          placeholder="যেমন: টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Soft Copy Paste Area */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-slate-800">
                        ২. সফট কপি প্রশ্নপত্র হুবহু এখানে পেস্ট করুন:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        স্বয়ংক্রিয়ভাবে প্রশ্ন, ৪টি অপশন ও উত্তর সাজিয়ে নেবে
                      </span>
                    </div>

                    <textarea
                      rows={8}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={`এখানে প্রশ্নপত্রের সফট কপি পেস্ট করুন। যেমন:

১. 'অপরিচিতা' ছোটগল্পে অনুপমের বন্ধুর নাম কী ছিল?
ক) হরিশ  খ) বিনুদা  গ) শম্ভুনাথ  ঘ) গজাধর
উত্তর: ক
ব্যাখ্যা: হরিশ কানপুরে কাজ করত।

২. অনুপমের মামার বয়স অনুপমের চেয়ে কত বেশি ছিল?
ক) চার বছর  খ) পাঁচ বছর  গ) ছয় বছর  ঘ) সাত বছর
উত্তর: গ`}
                      className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-slate-50/50"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleParseRawText}
                        className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
                      >
                        প্রিভিউ দেখুন
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveParsedPaper}
                        disabled={isProcessing}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all cursor-pointer ml-auto"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>১-ক্লিকে ডাটাবেজে সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Parsed Preview */}
                  {parsedPreview.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-2">
                        <span>পার্সকৃত প্রশ্ন প্রিভিউ ({parsedPreview.length}টি প্রশ্ন সনাক্ত হয়েছে)</span>
                        <span className="text-[11px] text-slate-500">সবকিছু ঠিক থাকলে ওপরের বাটনে সেভ করুন</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {parsedPreview.map((q, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-800">{idx + 1}. {q.question}</p>
                            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                              {q.options.map((opt: string, i: number) => (
                                <div key={i} className={`p-1 rounded ${opt === q.correctAnswer ? 'bg-emerald-100 font-bold text-emerald-900' : 'bg-white'}`}>
                                  {['ক', 'খ', 'গ', 'ঘ'][i]}) {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: Multi-File Batch Upload */}
              {activeTab === 'fileUpload' && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 transition-colors text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        কম্পিউটার হতে এক বা একাধিক প্রশ্নপত্রের ফাইল নির্বাচন করুন
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        একসাথে ১০টি, ৫০টি, ১০০টি বা শত শত প্রশ্নপত্রের ফাইল (.json অথবা .txt) নির্বাচন করুন। সিস্টেম সব ফাইল স্বয়ংক্রিয়ভাবে ডাটাবেজে স্টোর করে দেবে।
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".json,.txt"
                      onChange={handleMultiFileUpload}
                      className="hidden"
                    />

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>কম্পিউটার হতে ফাইল সিলেক্ট করুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSampleTemplate}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>নমুনা JSON টেমপ্লেট ডাউনলোড</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>টিপস ও সহজ পদ্ধতি:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      • আপনি যেকোনো টেক্সট ফাইলে প্রশ্নপত্র রেখে ফাইলগুলোর নাম স্কুলের নাম অনুসারে রেখে (যেমন: `মতিঝিল_আইডিয়াল_১০ম_বাংলা.txt`) আপলোড করতে পারেন।<br/>
                      • অথবা আমাদের দেওয়া নমুনা JSON ফাইলটির মতো করে এক ফাইলে ৫০-১০০টি পেপার রেখে আপলোড করলে মাত্র ২ সেকেন্ডে পুরো প্রশ্নব্যাংক লোড হয়ে যাবে।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Database Manager */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>বর্তমানে মোট সংরক্ষিত প্রশ্নপত্র: {papersList.length}টি</span>
                    <button
                      type="button"
                      onClick={() => {
                        syncInstitutionPapersWithServer().then(latest => setPapersList(latest));
                      }}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>রিফ্রেশ</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                    {papersList.map(paper => (
                      <div
                        key={paper.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px]">
                              {paper.year}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold text-[10px]">
                              {paper.studentClass}
                            </span>
                            {paper.isCustomUploaded && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                অ্যাডমিন আপলোডেড
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {paper.institutionName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {paper.subject} • {paper.examType} • {paper.questions ? paper.questions.length : 0}টি প্রশ্ন
                          </p>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <button
                            type="button"
                            onClick={() => setDeletingPaperId(deletingPaperId === paper.id ? null : paper.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              deletingPaperId === paper.id
                                ? 'bg-rose-600 text-white ring-2 ring-rose-500/50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={deletingPaperId === paper.id ? 'বাতিল' : 'ডাটাবেজ থেকে মুছুন'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {deletingPaperId === paper.id && (
                            <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-left shadow-md min-w-[170px] z-20">
                              <p className="text-[11px] font-bold text-rose-800 mb-1 leading-tight">
                                ⚠️ মুছে ফেলতে চান?
                              </p>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDeletingPaperId(null)}
                                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                                >
                                  বাতিল
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteInstitutionPaper(paper.id);
                                    setPapersList(prev => prev.filter(p => p.id !== paper.id));
                                    setDeletingPaperId(null);
                                    fetch(`/api/institution-papers/${paper.id}`, { method: 'DELETE' }).catch(() => {});
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                  হ্যাঁ, মুছুন
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-medium">
                অ্যাডমিন ডাটাবেজ সুরক্ষা সক্রিয়
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
              >
                প্যানেল বন্ধ করুন
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
