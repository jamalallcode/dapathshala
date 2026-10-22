import { User, UserRole } from '../types';
import { supabase } from '../supabase';

const USERS_STORAGE_KEY = 'dapathshala_registered_users';
const CURRENT_USER_KEY = 'dapathshala_current_user';

export const ROLE_LABELS: Record<string, string> = {
  general_student: 'শিক্ষার্থী',
  madrasah_student: 'মাদ্রাসা শিক্ষার্থী',
  guardian: 'অভিভাবক',
  coaching_manager: 'কোচিং ম্যানেজার',
  university_candidate: 'বিশ্ববিদ্যালয় পরীক্ষার্থী',
  departmental_examinee: 'বিভাগীয় পরীক্ষার্থী',
  admin: 'অ্যাডমিন',
  parent: 'অভিভাবক',
  child: 'শিক্ষার্থী'
};

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  points?: number;
  avatar?: string;
  registeredAt: string;
}

// Initial seed accounts for testing and default roles
const SEED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user_owner_admin',
    name: 'অ্যাপ ওনার / প্রধান অ্যাডমিন',
    email: 'websitetogather@gmail.com',
    role: 'admin',
    points: 9999,
    registeredAt: new Date().toISOString()
  },
  {
    id: 'user_admin_demo',
    name: 'সুপার অ্যাডমিন',
    email: 'admin@dapathshala.com',
    role: 'admin',
    points: 5000,
    registeredAt: new Date().toISOString()
  },
  {
    id: 'user_parent_jamal',
    name: 'জামাল উদ্দিন',
    email: 'jamaluddinkh3424@gmail.com',
    role: 'parent',
    points: 1500,
    registeredAt: new Date().toISOString()
  },
  {
    id: 'user_parent_demo',
    name: 'অভিভাবক ইউজার',
    email: 'parent@dapathshala.com',
    role: 'parent',
    points: 1250,
    registeredAt: new Date().toISOString()
  },
  {
    id: 'user_student_demo',
    name: 'তানভীর আহমেদ',
    email: 'student@dapathshala.com',
    role: 'general_student',
    points: 850,
    registeredAt: new Date().toISOString()
  }
];

export const getRegisteredAccounts = (): RegisteredAccount[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let accounts: RegisteredAccount[] = SEED_ACCOUNTS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Merge missing seed accounts into stored accounts
        const existingEmails = new Set(parsed.map((a: any) => a.email.toLowerCase()));
        const missingSeeds = SEED_ACCOUNTS.filter(s => !existingEmails.has(s.email.toLowerCase()));
        accounts = [...parsed, ...missingSeeds];
      }
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  } catch {
    return SEED_ACCOUNTS;
  }
};

export const findAccountByEmail = (email: string): RegisteredAccount | null => {
  if (!email || !email.trim()) return null;
  const accounts = getRegisteredAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.find(a => a.email.toLowerCase() === normalized) || null;
};

export const saveRegisteredAccount = (account: RegisteredAccount): void => {
  const accounts = getRegisteredAccounts();
  const normalizedEmail = account.email.trim().toLowerCase();
  const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === normalizedEmail);
  
  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...account };
  } else {
    accounts.push(account);
  }
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
};

export const saveCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save current user:', err);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const clearCurrentUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('auth_session_resume');
  } catch (err) {
    console.error('Failed to clear current user:', err);
  }
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}): Promise<User> => {
  const normalizedEmail = data.email.trim().toLowerCase();
  const isOwnerOrAdmin = normalizedEmail === 'websitetogather@gmail.com' || normalizedEmail.includes('admin') || data.role === 'admin';
  const assignedRole: UserRole = isOwnerOrAdmin ? 'admin' : data.role;
  
  const newAccount: RegisteredAccount = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: data.name.trim() || (isOwnerOrAdmin ? 'মালিক / অ্যাডমিন' : 'ব্যবহারকারী'),
    email: normalizedEmail,
    role: assignedRole,
    password: data.password,
    points: isOwnerOrAdmin ? 9999 : 100,
    registeredAt: new Date().toISOString()
  };

  // Attempt Supabase if available
  if (supabase) {
    try {
      const { data: sbData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password || 'password123',
        options: {
          data: { name: newAccount.name, role: newAccount.role }
        }
      });
      if (!error && sbData?.user) {
        newAccount.id = sbData.user.id;
      }
    } catch (sbErr) {
      console.warn('Supabase signup bypassed or offline:', sbErr);
    }
  }

  saveRegisteredAccount(newAccount);

  const user: User = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    role: newAccount.role,
    points: newAccount.points
  };

  saveCurrentUser(user);
  return user;
};

export const loginUser = async (
  email: string,
  password?: string,
  fallbackRole?: UserRole
): Promise<User> => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findAccountByEmail(normalizedEmail);
  const isOwnerOrAdmin = normalizedEmail === 'websitetogather@gmail.com' || normalizedEmail.includes('admin') || fallbackRole === 'admin';

  // Try Supabase first if available
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || '',
      });
      if (!error && data?.user) {
        const role = (data.user.user_metadata?.role as UserRole) || (isOwnerOrAdmin ? 'admin' : (existing?.role || fallbackRole || 'general_student'));
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || existing?.name || (isOwnerOrAdmin ? 'মালিক / অ্যাডমিন' : normalizedEmail.split('@')[0]),
          email: data.user.email || normalizedEmail,
          role,
          points: data.user.user_metadata?.points || existing?.points || (isOwnerOrAdmin ? 9999 : 150)
        };
        saveCurrentUser(user);
        return user;
      }
    } catch (sbErr) {
      console.warn('Supabase signin offline or unreachable, using local fallback:', sbErr);
    }
  }

  // Resilient fallback: If user was registered before or typed email
  const userRole: UserRole = (isOwnerOrAdmin ? 'admin' : (existing?.role || fallbackRole || (normalizedEmail.includes('parent') ? 'parent' : 'general_student')));
  const userName = existing?.name || (isOwnerOrAdmin ? 'মালিক / সুপার অ্যাডমিন' : normalizedEmail.split('@')[0]);

  const user: User = {
    id: existing?.id || (isOwnerOrAdmin ? 'user_owner_admin' : 'usr_' + Math.random().toString(36).substr(2, 9)),
    name: userName,
    email: normalizedEmail,
    role: userRole,
    points: existing?.points || (isOwnerOrAdmin ? 9999 : 100)
  };

  // If newly registered on the fly
  if (!existing) {
    saveRegisteredAccount({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password,
      points: user.points,
      registeredAt: new Date().toISOString()
    });
  }

  saveCurrentUser(user);
  return user;
};
