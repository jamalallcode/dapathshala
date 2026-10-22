import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Check, 
  ExternalLink, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey } from '../lib/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getGeminiApiKey());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, message: 'অনুগ্রহ করে একটি বৈধ Gemini API Key লিখুন।' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGeminiApiKey(keyInput.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      setGeminiApiKey(keyInput.trim());
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleSaveWithoutTest = () => {
    if (!keyInput.trim()) return;
    setGeminiApiKey(keyInput.trim());
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Gemini AI এপিআই কী (API Key)</h3>
              <p className="text-xs text-emerald-100">স্মার্ট কোয়েস্ট ও অন্যান্য এআই টুলস সক্রিয় করতে এটি প্রয়োজন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <button 
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <HelpCircle size={14} />
                {showGuide ? 'গাইড বন্ধ করুন' : 'কীভাবে ফ্রি কি পাবেন?'}
              </button>
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-12 text-slate-900 font-mono text-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Guide Accordion */}
          {showGuide && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                সম্পূর্ণ বিনামূল্যে ১ মিনিটে API Key নিন:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                <li>
                  <a 
                    href="https://aistudio.google.com/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5 ml-1"
                  >
                    Google AI Studio <ExternalLink size={12} />
                  </a> এ যান।
                </li>
                <li>আপনার জিমেইল (Gmail) দিয়ে সাইন ইন করুন।</li>
                <li><b>"Create API key"</b> বাটনে ক্লিক করুন।</li>
                <li>তৈরি হওয়া কোডটি কপি করে ওপরের বক্সে পেস্ট করুন।</li>
              </ol>
            </div>
          )}

          {/* Test Status Feedback */}
          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-500 shrink-0" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleSaveWithoutTest}
              disabled={isTesting || !keyInput.trim()}
              className="flex-1 py-3 text-sm rounded-xl font-medium"
            >
              সরাসরি সেভ করুন
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isTesting}
              disabled={!keyInput.trim()}
              className="flex-1 py-3 text-sm rounded-xl font-semibold shadow-lg shadow-emerald-200 gap-2"
            >
              {!isTesting && <Check size={16} />}
              যাচাই করে সেভ করুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
