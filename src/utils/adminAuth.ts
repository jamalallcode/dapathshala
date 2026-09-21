export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  lastLogin: string;
}

const ADMIN_EMAIL = 'dapathshala.info@gmail.com';
const ADMIN_PASSCODES = ['admin2026', 'dapathshala2026', 'admin123', '2026'];

export const checkIsAdmin = (): boolean => {
  try {
    // 1. Direct admin session flag
    const adminSession = localStorage.getItem('dapathshala_admin_session');
    if (adminSession === 'true') {
      return true;
    }

    // 2. Check logged-in user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (
        parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        parsed.category === 'admin' ||
        parsed.role === 'admin'
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking admin status', e);
  }
  return false;
};

export const verifyAdminCredentials = (inputPasscode: string, inputEmail?: string): boolean => {
  const cleanPass = inputPasscode.trim();
  const cleanEmail = (inputEmail || '').trim().toLowerCase();

  // Allow passcode match
  const passMatch = ADMIN_PASSCODES.includes(cleanPass);
  const emailMatch = !cleanEmail || cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail === 'admin';

  if (passMatch && emailMatch) {
    // Save admin session
    localStorage.setItem('dapathshala_admin_session', 'true');
    const adminUserObj = {
      name: 'প্রধান অ্যাডমিন (DaPathshala)',
      email: ADMIN_EMAIL,
      role: 'admin',
      category: 'admin',
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(adminUserObj));
    // Trigger custom event so Navbar and components re-render immediately
    window.dispatchEvent(new Event('auth_state_changed'));
    return true;
  }

  return false;
};

export const logoutAdminSession = () => {
  localStorage.removeItem('dapathshala_admin_session');
  // If the logged in user is the admin, reset user to guest/student or clear
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || parsed.role === 'admin') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  window.dispatchEvent(new Event('auth_state_changed'));
};
