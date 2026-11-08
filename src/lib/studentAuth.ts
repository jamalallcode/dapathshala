// Clean, robust authentication & registration for Students (শিক্ষার্থী / সন্তান)

export interface StudentUser {
  id: string;
  phone: string;
  name: string;
  studentClass: string;
  avatar?: string;
  role: 'student';
  createdAt: string;
}

interface StoredStudentAccount {
  id: string;
  phone: string;
  name: string;
  studentClass: string;
  avatar?: string;
  passwordHash: string;
  createdAt: string;
}

const STUDENT_USERS_KEY = 'dapathshala_student_accounts_v1';
const CURRENT_STUDENT_KEY = 'dapathshala_current_student_auth_v1';

// Convert Bengali numerals to standard English digits
export function normalizeStudentPhone(raw: string): string {
  if (!raw) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const normalized = raw
    .trim()
    .replace(/[০-৯]/g, (digit) => bnToEn[digit] || digit)
    .replace(/[^0-9+]/g, '');

  if (normalized.startsWith('+880')) {
    return '0' + normalized.slice(4);
  }
  if (normalized.startsWith('880')) {
    return '0' + normalized.slice(3);
  }
  return normalized;
}

// Validate 11-digit Bangladeshi mobile number
export function validateStudentPhone(phone: string): { valid: boolean; message?: string } {
  const clean = normalizeStudentPhone(phone);
  if (!clean) {
    return { valid: false, message: 'দয়া করে শিক্ষার্থীর ১১-সংখ্যার মোবাইল নম্বর দিন' };
  }
  if (!/^01[3-9]\d{8}$/.test(clean)) {
    return { valid: false, message: 'সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)' };
  }
  return { valid: true };
}

// Simple deterministic hash for local client-side authentication
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 's_h_' + Math.abs(hash).toString(36);
}

// Get all stored student accounts
function getStoredStudentAccounts(): Record<string, StoredStudentAccount> {
  try {
    const raw = localStorage.getItem(STUDENT_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save student accounts
function saveStoredStudentAccounts(accounts: Record<string, StoredStudentAccount>) {
  try {
    localStorage.setItem(STUDENT_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save student accounts:', e);
  }
}

// Get Currently Logged-in Student
export function getCurrentStudent(): StudentUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentUser;
  } catch {
    return null;
  }
}

// Check if student is logged in
export function isStudentLoggedIn(): boolean {
  return getCurrentStudent() !== null;
}

// Set Currently Logged-in Student
export function setCurrentStudent(user: StudentUser | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_STUDENT_KEY);
    }
    window.dispatchEvent(new Event('dapathshala_student_auth_changed'));
  } catch (e) {
    console.error('Failed to update current student session:', e);
  }
}

// Register a new Student
export async function registerStudent(
  phone: string,
  password: string,
  name: string,
  studentClass: string
): Promise<{ success: boolean; user?: StudentUser; error?: string }> {
  const phoneValidation = validateStudentPhone(phone);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.message };
  }

  const cleanPhone = normalizeStudentPhone(phone);
  const cleanName = name.trim();
  const cleanClass = studentClass.trim() || '৮ম শ্রেণি';

  if (!cleanName) {
    return { success: false, error: 'দয়া করে শিক্ষার্থীর নাম লিখুন' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' };
  }

  const accounts = getStoredStudentAccounts();
  if (accounts[cleanPhone]) {
    return { 
      success: false, 
      error: 'এই মোবাইল নম্বরে ইতোমধ্যে একটি শিক্ষার্থী অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।' 
    };
  }

  const newStudent: StoredStudentAccount = {
    id: 'student_' + Date.now(),
    phone: cleanPhone,
    name: cleanName,
    studentClass: cleanClass,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString()
  };

  accounts[cleanPhone] = newStudent;
  saveStoredStudentAccounts(accounts);

  const publicUser: StudentUser = {
    id: newStudent.id,
    phone: newStudent.phone,
    name: newStudent.name,
    studentClass: newStudent.studentClass,
    role: 'student',
    createdAt: newStudent.createdAt
  };

  setCurrentStudent(publicUser);
  return { success: true, user: publicUser };
}

// Login an existing Student
export async function loginStudent(
  phone: string,
  password: string
): Promise<{ success: boolean; user?: StudentUser; error?: string }> {
  const cleanPhone = normalizeStudentPhone(phone);
  if (!cleanPhone) {
    return { success: false, error: 'দয়া করে আপনার নিবন্ধিত মোবাইল নম্বর দিন' };
  }

  if (!password) {
    return { success: false, error: 'পাসওয়ার্ড লিখুন' };
  }

  const accounts = getStoredStudentAccounts();
  const account = accounts[cleanPhone];

  if (!account) {
    return { 
      success: false, 
      error: 'এই নম্বরে কোনো শিক্ষার্থী অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে প্রথমে রেজিস্ট্রেশন করুন।' 
    };
  }

  const expectedHash = simpleHash(password);
  if (account.passwordHash !== expectedHash) {
    return { success: false, error: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' };
  }

  const publicUser: StudentUser = {
    id: account.id,
    phone: account.phone,
    name: account.name,
    studentClass: account.studentClass,
    avatar: account.avatar,
    role: 'student',
    createdAt: account.createdAt
  };

  setCurrentStudent(publicUser);
  return { success: true, user: publicUser };
}

// Logout Student
export function logoutStudent() {
  setCurrentStudent(null);
}
