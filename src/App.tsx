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
  fetchTestFromServer,
  fetchSubmissionFromServer 
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

  // Check URL query parameters on load across devices (e.g. ?pin=997080 or ?reviewPin=997080)
  useEffect(() => {
    // Robust helper to extract params from either window.location.search or window.location.hash
    const getParam = (key: string): string | null => {
      try {
        const searchVal = new URLSearchParams(window.location.search).get(key);
        if (searchVal) return searchVal;
        if (window.location.hash && window.location.hash.includes('?')) {
          const hashQuery = window.location.hash.split('?')[1];
          const hashVal = new URLSearchParams(hashQuery).get(key);
          if (hashVal) return hashVal;
        }
      } catch {}
      return null;
    };

    const pin = getParam('pin');
    const testId = getParam('testId');
    const reviewPin = getParam('reviewPin') || getParam('reviewId');
    const examData = getParam('exam') || getParam('testData') || getParam('data');
    const subData = getParam('subData') || getParam('submission');
    const view = getParam('view');

    if (view === 'dashboard' && !pin && !examData) {
      setActiveView('dashboard');
      return;
    }

    const initFromParams = async () => {
      // 1. If child shared completed submission with parent via URL (?subData=... or ?submission=...)
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

      // 1.2 If parent opens short review link with ?reviewPin=997080
      if (reviewPin) {
        const tests = getStoredTests();
        let matched = tests.find(t => t.pin === reviewPin || t.id === reviewPin);
        if (!matched) {
          const serverSub = await fetchSubmissionFromServer(reviewPin);
          if (serverSub) {
            matched = serverSub;
            saveStoredTests([serverSub, ...tests]);
          }
        }
        if (matched) {
          setCurrentRole('parent');
          setActiveTest(matched);
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
          } else {
            saveStoredTests(tests.map(t => (t.id === decodedTest.id || t.pin === decodedTest.pin) ? decodedTest : t));
          }
          setCurrentRole('student');
          setActiveTest(decodedTest);
          setActiveView('exam');
          return;
        }
      }

      // 3. If standard pin or testId is provided in URL (?pin=997080)
      if (pin || testId) {
        const queryKey = (pin || testId || '').trim();
        const tests = getStoredTests();
        let matched = tests.find(t => t.pin === queryKey || t.id === queryKey);
        
        // ALWAYS fetch the latest test or submission from server to get updated review status, marks & parent comments
        if (pin) {
          let serverTest = await fetchTestFromServer(pin);
          if (!serverTest || (serverTest.status !== 'submitted' && serverTest.status !== 'reviewed')) {
            const subData = await fetchSubmissionFromServer(pin);
            if (subData && (subData.status === 'submitted' || subData.status === 'reviewed')) {
              serverTest = subData;
            }
          }
          if (serverTest) {
            matched = serverTest;
            const updated = tests.some(t => t.id === serverTest.id || t.pin === serverTest.pin)
              ? tests.map(t => (t.id === serverTest.id || t.pin === serverTest.pin) ? serverTest : t)
              : [serverTest, ...tests];
            saveStoredTests(updated);
          }
        }

        if (matched) {
          setCurrentRole('student');
          setActiveTest(matched);
          setActiveView('exam');
          return;
        }
      }
    };

    initFromParams();
  }, []);

  // Always ensure page starts at the very top (0, 0) whenever view changes so header is never partially covered
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }, [activeView, currentRole]);

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
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
  };

  const handleNavigateDashboard = () => {
    try {
      if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      // Sandboxed iframe pushState fallback
    }
    setActiveTest(null);
    setActiveView('dashboard');
  };

  const handleRoleChange = (role: UserRole) => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
    setCurrentRole(role);
    if (activeView === 'landing') {
      setActiveView('dashboard');
    }
  };

  const handleSelectRoleFromLanding = (role: UserRole) => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {}
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
