export type UserRole = 
  | 'general_student' 
  | 'madrasah_student'
  | 'guardian' 
  | 'coaching_manager' 
  | 'university_candidate' 
  | 'departmental_examinee' 
  | 'admin'
  | 'parent'
  | 'child';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  points?: number;
  linkedAccounts?: string[]; // IDs of linked children or parents
}

export interface ExamAssignment {
  id: string;
  parentId: string;
  childId: string;
  subject: string;
  chapter: string;
  class: string;
  duration: number; // minutes
  scheduledFor?: string; // ISO date
  status: 'pending' | 'active' | 'submitted' | 'reviewed';
  config: {
    mcqCount: number;
    creativeCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  questions?: any[];
  submission?: {
    answers: any[];
    submittedAt: string;
    aiScore?: number;
    aiFeedback?: string;
    parentScore?: number;
    parentFeedback?: string;
    parentComments?: { id: string; text: string; position: number }[];
  };
}

export interface LinkRequest {
  id: string;
  fromId: string;
  fromName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  duration: number; // in minutes
  subject: string;
  totalMarks?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index
  explanation?: string;
}

export interface ExamResult {
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number; // in seconds
  answers: Record<string, number>; // questionId -> selectedOptionIndex
}

export interface Note {
  id: string;
  title: string;
  author: string;
  price: number;
  subject: string;
  rating: number;
  previewUrl: string;
}

export interface Candidate {
  id: string;
  name: string;
  division: string;
  position: string;
  votes: number;
}
