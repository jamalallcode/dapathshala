import { useState, useEffect } from 'react';

interface SessionState {
  email: string;
  mode: 'signin' | 'register' | 'otp' | 'magic';
  role: any;
  timestamp: number;
}

export const useResumeSession = () => {
  const [savedSession, setSavedSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('auth_session_resume');
    if (session) {
      const parsed = JSON.parse(session);
      // Only resume if session is less than 30 minutes old
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        setSavedSession(parsed);
      } else {
        localStorage.removeItem('auth_session_resume');
      }
    }
  }, []);

  const saveSession = (state: Omit<SessionState, 'timestamp'>) => {
    const session = { ...state, timestamp: Date.now() };
    localStorage.setItem('auth_session_resume', JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem('auth_session_resume');
    setSavedSession(null);
  };

  return { savedSession, saveSession, clearSession };
};
