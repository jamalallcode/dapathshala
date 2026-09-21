import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginFlowModal } from '../../GoogleLoginFlowModal';

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('ep_user', JSON.stringify(userData));
    window.dispatchEvent(new Event('auth_state_changed'));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Hind_Siliguri']">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-12 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">DaPathshala</span>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#0c1e33] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
        >
          Login →
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <GoogleLoginFlowModal
          isOpen={isOpen}
          onClose={() => navigate('/')}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </div>
  );
}
