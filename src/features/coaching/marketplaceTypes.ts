export interface FeePlan {
  courseName: string;
  duration: string;
  monthlyFee: number;
  admissionFee: number;
  features: string[];
  seatsAvailable?: number;
}

export interface TeacherFaculty {
  name: string;
  designation: string;
  institution: string;
  experience: string;
  avatar?: string;
}

export interface StudentReview {
  studentName: string;
  college: string;
  rating: number;
  date: string;
  comment: string;
  badge?: string;
}

export interface MarketplaceCoaching {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  bannerImage: string;
  division: string;
  district: string;
  thana: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  foundedYear: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  successRate: string;
  programs: string[];
  subjects: string[];
  feeRange: string;
  feeStructure: FeePlan[];
  facilities: string[];
  teachers: TeacherFaculty[];
  reviews: StudentReview[];
  featured?: boolean;
  verified?: boolean;
}

export type LeadStatus = 'new' | 'contacted' | 'enrolled' | 'cancelled';

export interface AdmissionLead {
  id: string;
  coachingId: string;
  coachingName: string;
  studentName: string;
  phone: string;
  email?: string;
  guardianName: string;
  guardianPhone: string;
  currentInstitution: string;
  classLevel: string;
  programInterest: string;
  preferredShift: 'সকাল (৮:০০ - ১২:০০)' | 'দুপুর (১২:০০ - ৩:০০)' | 'বিকাল (৩:০০ - ৭:০০)' | 'অনলাইন লাইভ ব্যাচ';
  targetExam: string;
  address: string;
  notes?: string;
  appliedAt: string;
  status: LeadStatus;
  adminNotes?: string;
}
