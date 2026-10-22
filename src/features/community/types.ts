export type SubjectType = 
  | 'পদার্থবিজ্ঞান' 
  | 'রসায়ন' 
  | 'উচ্চতর গণিত' 
  | 'জীববিজ্ঞান' 
  | 'আইসিটি' 
  | 'বাংলা ও ইংরেজি' 
  | 'সাধারণ জ্ঞান';

export interface CommunityAnswer {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorCoaching: string;
  isTeacher?: boolean;
  content: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  isAccepted?: boolean;
  createdAt: string;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  content: string;
  subject: SubjectType;
  grade: string;
  authorName: string;
  authorAvatar?: string;
  authorCoaching: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  answers: CommunityAnswer[];
  createdAt: string;
  views: number;
  hasAcceptedAnswer: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: SubjectType;
}

export interface PeerFriend {
  id: string;
  name: string;
  institution: string;
  avatar: string;
  status: 'online' | 'in_game' | 'offline';
  rating: number; // e.g. 1450
  wins: number;
  matchesPlayed: number;
}

export interface ChallengePlayer {
  id: string;
  name: string;
  institution: string;
  avatar: string;
  score: number;
  correctCount: number;
  speedBonus: number;
  streakBonus: number;
  answers: (number | null)[];
}

export interface ChallengeBattle {
  id: string;
  subject: SubjectType;
  questions: QuizQuestion[];
  player1: ChallengePlayer;
  player2: ChallengePlayer;
  createdAt: string;
  status: 'active' | 'scanning' | 'finished';
  winnerId: string | 'draw';
}
