import React, { useState, useEffect } from 'react';
import { Navigation } from './components/layout/Navigation';
import { Sidebar } from './components/layout/Sidebar';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StartExamScreen } from './components/exam/StartExamScreen';
import { LiveExamEngine } from './components/exam/LiveExamEngine';
import { LandingPage } from './components/landing/LandingPage';
import { AssignedTest, UserRole } from './types';
import { 
  getStoredTests, 
  saveStoredTests, 
  decodeTestFromUrl, 
  decodeSubmissionFromUrl, 
  generateFallbackTestForPin 
} from './lib/storage';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('parent');
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'exam' | 'review'>('landing');
  const [activeTest, setActiveTest] = useState<AssignedTest | null>(null);
  
  // Resizable Sidebar state (default 208px - slimmer and moved further left)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 160 && parsed <= 380) return parsed;
      }
    } catch {}
    return 208;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  // Drag-to-resize listener
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 160), 380);
      setSidebarWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const newWidth = Math.min(Math.max(e.touches[0].clientX, 160), 380);
        setSidebarWidth(newWidth);
      }
    };

    const handleStopResize = () => {
      setIsResizingSidebar(false);
      try {
        localStorage.setItem('dapathshala_sidebar_width', String(sidebarWidth));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleStopResize);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleStopResize);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopResize);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizingSidebar, sidebarWidth]);
  
  // Coordinated Dashboard state for sidebar control
  const [parentActiveTab, setParentActiveTab] = useState<'overview' | 'assigned' | 'review' | 'proctoring' | 'report'>('assigned');
  const [showCreateModalExternal, setShowCreateModalExternal] = useState(false);

  // Check URL query parameters on load across devices (e.g. ?pin=787193&exam=... or ?pin=359874)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    const testId = params.get('testId');
    const examData = params.get('exam') || params.get('testData') || params.get('data');
    const subData = params.get('subData') || params.get('submission');
    const view = params.get('view');

    if (view === 'dashboard') {
      setActiveView('dashboard');
      return;
    }

    // 1. If child shared completed submission with parent via URL
    if (subData) {
      const decodedSub = decodeSubmissionFromUrl(subData);
      if (decodedSub) {
        const tests = getStoredTests();
        const exists = tests.some(t => t.id === decodedSub.id);
        const updated = exists ? tests.map(t => t.id === decodedSub.id ? decodedSub : t) : [decodedSub, ...tests];
        saveStoredTests(updated);
        setActiveTest(decodedSub);
        setCurrentRole('parent');
        setActiveView('dashboard');
        return;
      }
    }

    // 2. If parent shared exam URL with student/friend (contains self-contained exam data)
    if (examData) {
      const decodedTest = decodeTestFromUrl(examData);
      if (decodedTest) {
        const tests = getStoredTests();
        const exists = tests.some(t => t.id === decodedTest.id || t.pin === decodedTest.pin);
        if (!exists) {
          saveStoredTests([decodedTest, ...tests]);
        }
        setCurrentRole('student');
        setActiveTest(decodedTest);
        setActiveView('exam');
        return;
      }
    }

    // 3. If standard pin or testId is provided in URL
    if (pin || testId) {
      const tests = getStoredTests();
      let matched = tests.find(t => t.pin === pin || t.id === testId);
      
      // If opened on another device where this pin hasn't been saved yet, dynamically construct it:
      if (!matched && pin) {
        matched = generateFallbackTestForPin(pin);
        saveStoredTests([matched, ...tests]);
      }

      if (matched) {
        setCurrentRole('student');
        setActiveTest(matched);
        setActiveView('exam');
      }
    }
  }, []);

  const handleNavigateHome = () => {
    try {
      if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
    } catch {
      // Sandboxed iframe pushState fallback
    }
    setActiveTest(null);
    setActiveView('landing');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleNavigateDashboard = () => {
    try {
      if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
    } catch {
      // Sandboxed iframe pushState fallback
    }
    setActiveTest(null);
    setActiveView('dashboard');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (activeView === 'landing') {
      setActiveView('dashboard');
    }
  };

  const handleSelectRoleFromLanding = (role: UserRole) => {
    setCurrentRole(role);
    setActiveView('dashboard');
  };

  const handleOpenExamWithPinFromLanding = (test: AssignedTest) => {
    setActiveTest(test);
    setActiveView('exam');
  };

  const handleOpenExam = (test: AssignedTest) => {
    setActiveTest(test);
    setActiveView('exam');
  };

  const handleOpenReview = (test: AssignedTest) => {
    setActiveTest(test);
    setActiveView('review');
  };

  const handleNavigateToReviewFromNotif = (testId?: string) => {
    if (!testId) return;
    const tests = getStoredTests();
    const matched = tests.find(t => t.id === testId);
    if (matched) {
      setActiveTest(matched);
      setActiveView('review');
    }
  };

  const handleExitToDashboard = () => {
    if (window.location.search) {
      const newUrl = window.location.pathname;
      window.history.pushState({}, '', newUrl);
    }
    setActiveTest(null);
    setActiveView('dashboard');
  };

  const handleOpenCreateExamFromSidebar = () => {
    setActiveView('dashboard');
    setCurrentRole('parent');
    setParentActiveTab('assigned');
    setShowCreateModalExternal(true);
  };

  const handleSelectParentTabFromSidebar = (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report') => {
    setCurrentRole('parent');
    setActiveView('dashboard');
    setParentActiveTab(tab);
  };

  const handleDirectStartExam = (test: AssignedTest) => {
    setActiveTest(test);
    setActiveView('exam');
  };

  return (
    <div 
      style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      className="min-h-screen bg-[#ebf2fa] text-slate-800 flex flex-col font-sans w-full max-w-full overflow-x-clip relative"
    >
      
      {/* Universal Control Sidebar (only in dashboard view) */}
      {activeView !== 'landing' && activeView !== 'exam' && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sidebarWidth={sidebarWidth}
          onStartResize={() => setIsResizingSidebar(true)}
          isResizing={isResizingSidebar}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeView={activeView}
          onNavigateHome={handleNavigateHome}
          onNavigateDashboard={handleNavigateDashboard}
          parentTab={parentActiveTab}
          onSelectParentTab={handleSelectParentTabFromSidebar}
          onOpenCreateExam={handleOpenCreateExamFromSidebar}
          onDirectStartExam={handleDirectStartExam}
        />
      )}

      {/* Main Viewport Column (offset only when sidebar is active) */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        activeView !== 'landing' && activeView !== 'exam' ? 'lg:pl-[var(--sidebar-width)]' : ''
      } ${
        isResizingSidebar ? '' : 'transition-[padding-left] duration-75'
      }`}>

        {/* Top Navbar - Fixed/Sticky at top in dashboard view */}
        {activeView !== 'landing' && activeView !== 'exam' && (
          <Navigation
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
            onNavigateToReview={handleNavigateToReviewFromNotif}
            onNavigateHome={handleNavigateHome}
            onNavigateDashboard={handleNavigateDashboard}
            onOpenCreateExam={handleOpenCreateExamFromSidebar}
            onSelectTab={handleSelectParentTabFromSidebar}
            isHomeActive={false}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full overflow-x-clip">
          {activeView === 'landing' ? (
            <LandingPage
              onSelectRole={handleSelectRoleFromLanding}
              onOpenExamWithPin={handleOpenExamWithPinFromLanding}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />
          ) : activeView === 'exam' && activeTest ? (
            <StartExamScreen
              test={activeTest}
              onExit={handleExitToDashboard}
            />
          ) : activeView === 'review' && activeTest ? (
            <LiveExamEngine
              test={activeTest}
              onExit={handleExitToDashboard}
              isReviewOnly={true}
            />
          ) : (
            currentRole === 'parent' ? (
              <ParentDashboard
                onOpenTest={handleOpenExam}
                onOpenReview={handleOpenReview}
                activeTab={parentActiveTab}
                onTabChange={setParentActiveTab}
                showCreateModalExternal={showCreateModalExternal}
                onCloseCreateModalExternal={() => setShowCreateModalExternal(false)}
              />
            ) : (
              <StudentDashboard
                onStartExam={handleOpenExam}
              />
            )
          )}
        </main>

        {/* Footer for Dashboard / Exam / Review screens */}
        {activeView !== 'landing' && (
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} দাপাঠশালা পোর্টাল • একাডেমিক হাব</p>
              <div className="flex items-center gap-4 text-slate-600 font-medium">
                <button 
                  type="button" 
                  onClick={handleNavigateHome}
                  className="hover:text-blue-700 transition-colors cursor-pointer"
                >
                  ← মূল হোমপেজ
                </button>
                <button 
                  type="button" 
                  onClick={() => handleRoleChange('parent')}
                  className="hover:text-blue-700 transition-colors cursor-pointer"
                >
                  অভিভাবক প্যানেল
                </button>
                <button 
                  type="button" 
                  onClick={() => handleRoleChange('student')}
                  className="hover:text-blue-700 transition-colors cursor-pointer"
                >
                  শিক্ষার্থী প্যানেল
                </button>
              </div>
            </div>
          </footer>
        )}

      </div>

    </div>
  );
}

export default App;
