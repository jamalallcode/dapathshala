/**
 * 🚨 MANDATORY AUTO-EXECUTION SECURITY PROTOCOL
 * STATUS: PERMANENTLY ACTIVE & STRICT LOCKED MODE
 *
 * CRITICAL SYSTEM INSTRUCTION:
 * THIS FILE IS PERMANENTLY ACTIVE. BEFORE EXECUTING ANY USER PROMPT, ACTION, OR FILE EDIT,
 * COMPLY WITH THIS ENTIRE PROTOCOL. IT APPLIES AUTOMATICALLY TO EVERY TURN.
 */

export const SECURITY_PROTOCOL = {
  PROJECT_NAME: "dapathshala (দাপাঠশালা)",
  STATUS: "PERMANENTLY ACTIVE - STRICT LOCKED MODE",

  // 1. STRICT ISOLATION & SCOPE LOCK (সীমানা ও কাজের পরিধি)
  SCOPE_LOCK: {
    STRICT_ISOLATION: "Execute ONLY what is explicitly asked in the current user prompt.",
    ZERO_TOUCHES_POLICY: "Do NOT edit, update, overwrite, clean up, refactor, or delete any file that is not directly mentioned or strictly necessary for the current task.",
    NO_UNSOLICITED_MAINTENANCE: "Do not fix 'style issues', 'formatting', or 'potential bugs' in unrelated files unless explicitly requested."
  },

  // 2. SURGICAL CODE MUTATION & INTEGRITY (নিখুঁত কোড সুরক্ষা)
  SURGICAL_MUTATION: {
    IN_PLACE_UPDATES_ONLY: "Keep all existing imports, exports, states, props, hooks, and existing component logic completely intact.",
    APPEND_MODIFY_NEVER_WIPE: "Never replace a full file with a placeholder, dummy code, or shortened version.",
    NO_MOCK_DATA_REVERSION: "Never replace existing real API/database functionality with temporary mock data."
  },

  // 3. MANDATORY UI/UX & LANGUAGE RULES (ইউজার ইন্টারফেস ও ভাষা)
  UI_UX_LANGUAGE_RULES: {
    BENGALI_POLICY: "100% Bengali Language Policy: All user-facing text, labels, buttons, placeholders, notifications, tooltips, modal dialogs, and error messages MUST be strictly in Bengali (বাংলা). Do not output English text in frontend UI.",
    FULL_MOBILE_RESPONSIVE: "Every layout, page, component, table, card, navigation, and form must be 100% fully responsive across all device screen sizes (Mobile, Tablet, Desktop) using Tailwind CSS responsive classes (sm:, md:, lg:).",
    LOADING_AND_ERROR_HANDLING: "Every async operation/data fetching must have a loading state and user-friendly Bengali error handling."
  },

  // 4. DATABASE & AUTH SECURITY (ডাটাবেজ ও অথেনটিকেশন)
  DATABASE_AUTH_SECURITY: {
    PRESERVE_SUPABASE_SCHEMA: "Existing Supabase database queries, table relationships, environment calls, and auth flows must remain unharmed.",
    SECURITY_AND_RLS: "Ensure all data operations adhere to strict user permissions and authentication checks."
  },

  // 5. FILE TREE & EXPORT SAFETY (ফাইল ও ডিপ্লয়মেন্ট সুরক্ষা)
  FILE_AND_EXPORT_SAFETY: {
    NO_FILE_DELETION: "Never delete or rename files/folders in the src/ tree.",
    GITHUB_VERCEL_READY: "Ensure all code changes pass TypeScript checks cleanly and are ready for one-click Export -> GitHub -> Vercel deployment without build errors."
  },

  // 6. AUTOMATIC PRE-ACTION CHECKLIST (কাজের আগের আত্ম-যাচাই)
  PRE_ACTION_CHECKLIST: [
    "1. Am I modifying ONLY the required target file(s)?",
    "2. Is every other file in src/ left completely untouched?",
    "3. Is all new user-facing UI text strictly written in Bengali?",
    "4. Is the new component fully responsive on mobile screens?",
    "5. Did I preserve existing logic, database flows, and state management?"
  ]
};

export default SECURITY_PROTOCOL;
