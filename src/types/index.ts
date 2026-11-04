export type UserRole = 'parent' | 'student';
export type ExamTrack = 'academic' | 'bcs' | 'medical' | 'varsity' | 'engineering';

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
  track?: ExamTrack;
  subject?: string;
  topic?: string;
  examSource?: string;
  year?: number;
  negativeMarkValue?: number;
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
  aiGradingEnabled: boolean;
  proctoringFlags?: string[];
  parentComment?: string;
  questions: ExamQuestion[];
  track?: ExamTrack;
  negativeMarking?: number;
  examSource?: string;
  year?: number;
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
  negativeMarkDeductions?: number;
  correctCount?: number;
  incorrectCount?: number;
  skippedCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  testId?: string;
  isRead: boolean;
  forRole: 'parent' | 'student';
}

export interface CompetitiveExamSeed {
  id: string;
  title: string;
  track: ExamTrack;
  trackLabel: string;
  badge: string;
  subject: string;
  year?: number;
  questionCount: number;
  durationMinutes: number;
  negativeMark: number;
  description: string;
  questions: ExamQuestion[];
}

