// Clean, modern mobile number & password authentication for Parents (অভিভাবক)

export interface ParentUser {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  childName?: string;
  childClass?: string;
  defaultDurationMinutes?: number;
  proctoringStrictness?: 'standard' | 'high';
  role: 'parent';
  createdAt: string;
}

interface StoredParentAccount {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  childName?: string;
  childClass?: string;
  defaultDurationMinutes?: number;
  proctoringStrictness?: 'standard' | 'high';
  passwordHash: string;
  createdAt: string;
}

const PARENT_USERS_KEY = 'dapathshala_parent_accounts_v1';
const CURRENT_PARENT_KEY = 'dapathshala_current_parent_auth_v1';

// Convert Bengali numerals to standard English digits
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const normalized = raw
    .trim()
    .replace(/[০-৯]/g, (digit) => bnToEn[digit] || digit)
    .replace(/[^0-9+]/g, '');

  // Handle +880 or 880 prefix
  if (normalized.startsWith('+880')) {
    return '0' + normalized.slice(4);
  }
  if (normalized.startsWith('880')) {
    return '0' + normalized.slice(3);
  }
  return normalized;
}

// Validate 11-digit Bangladeshi mobile number
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const clean = normalizePhone(phone);
  if (!clean) {
    return { valid: false, message: 'দয়া করে আপনার ১১-সংখ্যার মোবাইল নম্বর দিন' };
  }
  if (!/^01[3-9]\d{8}$/.test(clean)) {
    return { valid: false, message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)' };
  }
  return { valid: true };
}

// Get all stored parent accounts
function getStoredParentAccounts(): Record<string, StoredParentAccount> {
  try {
    const raw = localStorage.getItem(PARENT_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save accounts
function saveStoredParentAccounts(accounts: Record<string, StoredParentAccount>) {
  try {
    localStorage.setItem(PARENT_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save parent accounts:', e);
  }
}

// Get Currently Logged-in Parent
export function getCurrentParent(): ParentUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_PARENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ParentUser;
  } catch {
    return null;
  }
}

// Set Currently Logged-in Parent
export function setCurrentParent(user: ParentUser | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_PARENT_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_PARENT_KEY);
    }
    window.dispatchEvent(new CustomEvent('dapathshala_parent_auth_changed', { detail: user }));
  } catch (e) {
    console.error('Failed to update current parent session:', e);
  }
}

// Logout Parent
export function logoutParent() {
  setCurrentParent(null);
}

// Update Parent Profile (Name, Child Name, Child Class, Preferences)
export function updateParentProfile(updates: Partial<ParentUser>): { success: boolean; user?: ParentUser; error?: string } {
  try {
    const current = getCurrentParent();
    if (!current) {
      return { success: false, error: 'কোনো অভিভাবক অ্যাকাউন্ট সক্রিয় নেই' };
    }
    const accounts = getStoredParentAccounts();
    const account = accounts[current.phone];

    const updatedUser: ParentUser = {
      ...current,
      ...updates,
      phone: current.phone,
      role: 'parent'
    };

    if (account) {
      accounts[current.phone] = {
        ...account,
        ...updates,
        phone: current.phone
      };
      saveStoredParentAccounts(accounts);
    }

    setCurrentParent(updatedUser);
    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { success: false, error: err?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' };
  }
}

// Change Parent Password
export function changeParentPassword(currentPasswordRaw: string, newPasswordRaw: string): { success: boolean; error?: string } {
  try {
    const current = getCurrentParent();
    if (!current) {
      return { success: false, error: 'কোনো অভিভাবক অ্যাকাউন্ট সক্রিয় নেই' };
    }
    const accounts = getStoredParentAccounts();
    const account = accounts[current.phone];
    if (!account) {
      return { success: false, error: 'অ্যাকাউন্ট রেকর্ড পাওয়া যায়নি' };
    }

    const currentPassword = currentPasswordRaw.trim();
    const newPassword = newPasswordRaw.trim();

    if (account.passwordHash !== currentPassword) {
      return { success: false, error: 'বর্তমান পাসওয়ার্ড সঠিক নয়' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' };
    }

    account.passwordHash = newPassword;
    accounts[current.phone] = account;
    saveStoredParentAccounts(accounts);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' };
  }
}

// Register Parent (Mobile, Password & Name)
export async function registerParent(phoneRaw: string, passwordRaw: string, nameRaw?: string): Promise<{ success: boolean; user?: ParentUser; error?: string }> {
  const phone = normalizePhone(phoneRaw);
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.message };
  }

  const name = (nameRaw || '').trim();
  if (!name) {
    return { success: false, error: 'দয়া করে অভিভাবকের পূর্ণ নাম লিখুন' };
  }

  const password = passwordRaw.trim();
  if (!password || password.length < 4) {
    return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' };
  }

  const accounts = getStoredParentAccounts();
  if (accounts[phone]) {
    return { 
      success: false, 
      error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। দয়া করে "লগইন" করুন।' 
    };
  }

  const newAccount: StoredParentAccount = {
    id: `parent_${phone}_${Date.now()}`,
    phone,
    name,
    passwordHash: password, // client storage
    createdAt: new Date().toISOString()
  };

  accounts[phone] = newAccount;
  saveStoredParentAccounts(accounts);

  const user: ParentUser = {
    id: newAccount.id,
    phone: newAccount.phone,
    name: newAccount.name,
    role: 'parent',
    createdAt: newAccount.createdAt
  };

  setCurrentParent(user);

  // Sync to backend asynchronously if server available
  try {
    fetch('/api/auth/parent-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, name, id: newAccount.id })
    }).catch(() => {});
  } catch {}

  return { success: true, user };
}

// Login Parent (Only Mobile & Password)
export async function loginParent(phoneRaw: string, passwordRaw: string): Promise<{ success: boolean; user?: ParentUser; error?: string }> {
  const phone = normalizePhone(phoneRaw);
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.message };
  }

  const password = passwordRaw.trim();
  if (!password) {
    return { success: false, error: 'আপনার পাসওয়ার্ড লিখুন' };
  }

  const accounts = getStoredParentAccounts();
  const account = accounts[phone];

  // Also check backend if not in local storage
  if (!account) {
    try {
      const res = await fetch('/api/auth/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.user) {
          accounts[phone] = {
            id: data.user.id,
            phone: data.user.phone,
            name: data.user.name || '',
            childName: data.user.childName,
            childClass: data.user.childClass,
            passwordHash: password,
            createdAt: data.user.createdAt || new Date().toISOString()
          };
          saveStoredParentAccounts(accounts);
          const user: ParentUser = {
            id: data.user.id,
            phone: data.user.phone,
            name: data.user.name || '',
            childName: data.user.childName,
            childClass: data.user.childClass,
            role: 'parent',
            createdAt: accounts[phone].createdAt
          };
          setCurrentParent(user);
          return { success: true, user };
        }
      }
    } catch {}

    return { 
      success: false, 
      error: 'এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে "রেজিস্টার" করুন।' 
    };
  }

  if (account.passwordHash !== password) {
    return { success: false, error: 'পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।' };
  }

  const user: ParentUser = {
    id: account.id,
    phone: account.phone,
    name: account.name || '',
    avatar: account.avatar,
    childName: account.childName,
    childClass: account.childClass,
    defaultDurationMinutes: account.defaultDurationMinutes,
    proctoringStrictness: account.proctoringStrictness,
    role: 'parent',
    createdAt: account.createdAt
  };

  setCurrentParent(user);
  return { success: true, user };
}
