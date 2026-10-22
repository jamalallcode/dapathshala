import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  Send, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  BookOpen,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey } from '../../lib/gemini';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export const PDFReader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));
      setChat([{ role: 'ai', text: `স্বাগতম! আমি আপনার ${selectedFile.name} ফাইলটি পড়তে প্রস্তুত। আপনি এই ফাইলটি সম্পর্কে আমাকে যেকোনো প্রশ্ন করতে পারেন।` }]);
    }
  };

  const askAI = async () => {
    if (!query || !file) return;

    const userMsg = query;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        setChat(prev => [...prev, { role: 'ai', text: "এপিআই কী (API Key) সেট করা নেই। দয়া করে সেটিংস থেকে GEMINI_API_KEY যোগ করুন।" }]);
        setIsLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // In a real app, we would extract text from PDF or send the PDF data.
      // For this demo, we'll use the filename and query as context.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `The user is reading a PDF named "${file.name}". User question: "${userMsg}". Please provide a helpful answer in Bengali based on the context of learning and this document.`,
      });

      if (response.text) {
        setChat(prev => [...prev, { role: 'ai', text: response.text }]);
      }
    } catch (err: any) {
      console.error(err);
      setChat(prev => [...prev, { role: 'ai', text: "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।" }]);
    } finally {
      setIsLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex overflow-hidden bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl">
      {/* PDF Viewer Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {file ? file.name : 'পিডিএফ রিডার'}
              </h2>
              <p className="text-xs text-slate-500">স্মার্ট এআই অ্যাসিস্ট্যান্টের সাথে পড়ুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!file && (
              <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg">
                <Upload size={16} className="mr-2" />
                আপলোড
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`rounded-lg ${isSidebarOpen ? 'bg-slate-100 text-emerald-600' : ''}`}
            >
              <MessageSquare size={18} />
            </Button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
        </header>

        <div className="flex-1 overflow-hidden relative bg-slate-200/50">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center">
                <BookOpen size={48} strokeWidth={1} />
              </div>
              <p className="font-medium">শুরু করতে একটি পিডিএফ ফাইল আপলোড করুন</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                ফাইল সিলেক্ট করুন
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-full sm:w-[400px] border-l bg-white flex flex-col shadow-2xl z-20"
          >
            <header className="p-4 border-b flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles size={18} />
                স্মার্ট এআই চ্যাট
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    <span className="text-xs text-slate-400">এআই ভাবছে...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAI()}
                  placeholder="পিডিএফ সম্পর্কে কিছু জিজ্ঞাসা করুন..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
                <button
                  onClick={askAI}
                  disabled={!query || isLoading || !file}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
