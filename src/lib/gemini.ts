import { GoogleGenAI } from '@google/genai';

const STORAGE_KEYS = ['dapathshala_gemini_key', 'GEMINI_API_KEY', 'vite_gemini_api_key'];

/**
 * Returns the currently active Gemini API key from:
 * 1. Browser LocalStorage (user-entered in app Settings or popup)
 * 2. Vite import.meta.env.VITE_GEMINI_API_KEY
 * 3. Process.env.GEMINI_API_KEY or process.env.VITE_GEMINI_API_KEY
 */
export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    for (const key of STORAGE_KEYS) {
      const val = localStorage.getItem(key);
      if (val && val.trim().length > 0) {
        return val.trim();
      }
    }
  }

  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      // @ts-ignore
      const val = import.meta.env.VITE_GEMINI_API_KEY;
      if (val && val.trim().length > 0) return val.trim();
    }
  } catch {
    // ignore
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      const envKey = process.env.GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim().length > 0) {
        return envKey.trim();
      }
    }
  } catch {
    // ignore
  }

  return '';
};

export const hasGeminiApiKey = (): boolean => {
  return getGeminiApiKey().length > 5;
};

export const setGeminiApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    localStorage.setItem('dapathshala_gemini_key', trimmed);
    localStorage.setItem('GEMINI_API_KEY', trimmed);
  }
};

export const removeGeminiApiKey = (): void => {
  if (typeof window !== 'undefined') {
    for (const key of STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  }
};

/**
 * Tests if an API key is valid by sending a tiny prompt.
 */
export const testGeminiApiKey = async (customKey?: string): Promise<{ success: boolean; message: string }> => {
  const keyToTest = customKey?.trim() || getGeminiApiKey();
  if (!keyToTest) {
    return { success: false, message: 'কোনো এপিআই কী পাওয়া যায়নি।' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: keyToTest });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping: reply with one word "OK"',
    });

    if (response && response.text) {
      return { success: true, message: 'এপিআই কী সঠিক আছে এবং সফলভাবে কানেক্ট হয়েছে!' };
    }
    return { success: false, message: 'এআই থেকে উত্তর আসেনি।' };
  } catch (err: any) {
    return { 
      success: false, 
      message: err?.message || 'এপিআই কী যাচাইকরণ ব্যর্থ হয়েছে। কী-টি পুনরায় পরীক্ষা করুন।' 
    };
  }
};
