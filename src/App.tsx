import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Components
import DashboardLayout from './components/Layout/DashboardLayout';
import Auth from './components/Auth/Forms/Registration/AuthForm';
import QuestionStudio from './components/Generator/QuestionStudio';
import ScrollToTop from './components/Common/ScrollToTop';

// Pages
import LandingPage from './pages/Public/Landing/Hero/LandingPage';
import { DaPathshalaDashboard } from './pages/Protected/Dashboards/Main/DaPathshalaDashboard';
import ExamSystem from './pages/Protected/Education/Exams/Live/ExamSystem';
import CoachingDashboard from './pages/Protected/Dashboards/Coaching/Admin/CoachingDashboard';
import ParentDashboard from './pages/Protected/Dashboards/Parent/Overview/ParentDashboard';
import MasterAdminDashboard from './pages/Protected/Dashboards/Admin/MasterAdminDashboard';

export default function App() {
  useEffect(() => {
    // Security: Prevent Right Click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Security: Prevent Developer Tool Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Landing Page without Sidebar or Navbar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/register" element={<Auth type="register" />} />

        {/* Protected Application Pages with Persistent Fixed Sidebar & Navbar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DaPathshalaDashboard />} />
          <Route path="/generate" element={<QuestionStudio />} />
          <Route path="/question-bank" element={<QuestionStudio />} />
          <Route path="/paper-builder" element={<QuestionStudio />} />
          <Route path="/exams" element={<ExamSystem />} />
          <Route path="/coaching-dashboard" element={<CoachingDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/admin" element={<MasterAdminDashboard />} />
          <Route path="/control" element={<MasterAdminDashboard />} />
          <Route path="/master-dashboard" element={<MasterAdminDashboard />} />
          <Route 
            path="/shop" 
            element={
              <div className="p-8 text-center font-bold text-slate-600 font-['Hind_Siliguri']">
                দা পাঠশালা ই-কমার্স শপ শীঘ্রই আসছে...
              </div>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <div className="p-8 text-center font-bold text-slate-600 font-['Hind_Siliguri']">
                প্রোফাইল সেটিংস শীঘ্রই আসছে...
              </div>
            } 
          />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
