export type UserRole = 'parent' | 'student' | 'admin';

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswerIndex?: number;
  explanation: string;
  solutions?: string[];
  studentAnswer?: string;
  isCorrect?: boolean;
}

export interface AssignedTest {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  questionCount: number;
  durationMinutes: number;
  pin: string;
  createdAt: string;
  status: 'pending' | 'submitted' | 'reviewed';
  studentName: string;
  score?: number;
  totalMarks?: number;
  isPublished?: boolean;
  proctoringEnabled: boolean;
  proctoringLevel?: 1 | 2 | 3 | 4;
  aiGradingEnabled: boolean;
  proctoringFlags?: string[];
  parentComment?: string;
  questions: ExamQuestion[];
  submittedAt?: string;
  parentPhone?: string;
}

export interface StudentSubmission {
  testId: string;
  studentName: string;
  submittedAt: string;
  timeSpentSeconds: number;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  proctoringFlags: string[];
  status: 'submitted' | 'reviewed';
  isPublished: boolean;
  parentComment?: string;
  aiFeedback?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  testId?: string;
  isRead: boolean;
  forRole: 'parent' | 'student' | 'admin';
}

export interface AdminSystemStats {
  totalParents: number;
  totalExams: number;
  totalSubmissions: number;
  totalInstitutionPapers: number;
  unreviewedSubmissions: number;
  totalProctoringFlags: number;
  serverUptimeSeconds: number;
  status: string;
  aiStatus: string;
}

export interface ParentAccountSummary {
  id: string;
  phone: string;
  name: string;
  childName?: string;
  childClass?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  examsCreated: number;
  submissionsReceived: number;
  lastActive?: string;
}

export interface AdminBroadcastNotice {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  isActive: boolean;
  updatedAt?: string;
}

