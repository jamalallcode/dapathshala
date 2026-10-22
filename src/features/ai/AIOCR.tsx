import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Camera, 
  Upload, 
  FileText, 
  Loader2, 
  Check, 
  Copy, 
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  X,
  FileUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OCRFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
}

export const AIOCR: React.FC = () => {
  const [files, setFiles] = useState<OCRFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [aggregatedResult, setAggregatedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    const newFiles: OCRFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, 20)); // Limit to 20 files
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      // Cleanup URL objects
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setAggregatedResult('');
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessingAll(true);
    setAggregatedResult('');

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      setAggregatedResult("এপিআই কী (API Key) সেট করা নেই। দয়া করে সেটিংস থেকে GEMINI_API_KEY যোগ করুন।");
      setIsProcessingAll(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    let combinedText = '';

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (currentFile.status === 'completed') {
        combinedText += `\n\n--- ফাইল: ${currentFile.file.name} ---\n${currentFile.result}`;
        continue;
      }

      setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'processing' } : f));

      try {
        const base64Data = await fileToBase64(currentFile.file);
        const mimeType = currentFile.file.type;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data.split(',')[1],
                  mimeType: mimeType.startsWith('image/') ? mimeType : 'application/pdf',
                },
              },
              { text: "Extract all text from this document. If it's handwritten or printed Bengali, preserve the formatting. Correct minor spelling errors. Return ONLY the extracted text." }
            ]
          },
        });

        const text = response.text || '';
        combinedText += `\n\n--- ফাইল: ${currentFile.file.name} ---\n${text}`;
        
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'completed', result: text } : f));
      } catch (err) {
        console.error(err);
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error' } : f));
      }
    }

    setAggregatedResult(combinedText.trim());
    setIsProcessingAll(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aggregatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Camera size={24} />
            </div>
            এআই <span className="text-blue-600">ওসিআর (OCR)</span>
          </h1>
          <p className="mt-1 text-slate-500">একসাথে ২০টি পর্যন্ত ছবি বা পিডিএফ থেকে টেক্সট এক্সট্র্যাক্ট করুন।</p>
        </div>
        <div className="flex gap-2">
          {files.length > 0 && (
            <Button variant="ghost" onClick={clearAll} className="text-red-500 hover:bg-red-50">
              <Trash2 size={18} className="mr-2" />
              সব মুছুন
            </Button>
          )}
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} className="rounded-xl shadow-lg shadow-blue-200">
            <FileUp size={18} className="mr-2" />
            ফাইল যোগ করুন
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Upload & Queue Section */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="p-0 overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50/50 min-h-[300px] flex flex-col">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              multiple
              className="hidden"
            />
            
            {files.length > 0 ? (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm"
                  >
                    {f.file.type.startsWith('image/') ? (
                      <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-600 p-2">
                        <FileText size={32} />
                        <p className="text-[10px] font-bold truncate w-full text-center mt-1">{f.file.name}</p>
                      </div>
                    )}
                    
                    {/* Status Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${f.status === 'processing' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {f.status === 'processing' ? (
                        <Loader2 className="animate-spin text-white" size={24} />
                      ) : f.status === 'completed' ? (
                        <Check className="text-emerald-400" size={24} />
                      ) : (
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {files.length < 20 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all bg-white"
                  >
                    <Upload size={24} />
                    <span className="text-xs mt-2 font-bold">আরো যোগ করুন</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-blue-600 transition-colors py-20"
              >
                <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <Upload size={40} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl">ফাইল আপলোড করুন</p>
                  <p className="text-sm">ছবি বা পিডিএফ ড্র্যাগ করে ছেড়ে দিন (সর্বোচ্চ ২০টি)</p>
                </div>
              </button>
            )}
          </Card>

          <Button
            variant="primary"
            className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-blue-200 gap-2"
            onClick={processFiles}
            disabled={files.length === 0 || isProcessingAll}
            isLoading={isProcessingAll}
          >
            {!isProcessingAll && <Sparkles size={20} />}
            {isProcessingAll ? 'প্রসেস করা হচ্ছে...' : 'সবগুলো প্রসেস করুন'}
          </Button>
        </div>

        {/* Result Section */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="h-full min-h-[500px] flex flex-col bg-white shadow-xl shadow-slate-200/50 border-none overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <FileText size={18} className="text-blue-600" />
                ডিজিটাল টেক্সট (ফলাফল)
              </div>
              <div className="flex gap-2">
                {aggregatedResult && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-0 relative">
              <AnimatePresence mode="wait">
                {isProcessingAll && aggregatedResult === '' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white z-10"
                  >
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="font-medium animate-pulse">এআই আপনার ফাইলগুলো বিশ্লেষণ করছে...</p>
                  </motion.div>
                ) : aggregatedResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    <textarea
                      value={aggregatedResult}
                      onChange={(e) => setAggregatedResult(e.target.value)}
                      className="w-full h-[600px] p-8 border-none focus:ring-0 text-slate-700 leading-relaxed resize-none bg-transparent font-sans text-lg"
                      placeholder="এখানে ফলাফল দেখা যাবে..."
                    />
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-20">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                    <p className="text-sm font-medium">বাম পাশ থেকে ফাইল আপলোড করে শুরু করুন</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

