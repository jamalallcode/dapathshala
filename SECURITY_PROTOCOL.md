# 🚨 MANDATORY AUTO-EXECUTION SECURITY PROTOCOL
> **CRITICAL SYSTEM INSTRUCTION FOR GEMINI / AI STUDIO:**
> THIS FILE IS PERMANENTLY ACTIVE. BEFORE EXECUTING ANY USER PROMPT, ACTION, OR FILE EDIT, YOU MUST READ AND COMPLY WITH THIS ENTIRE PROTOCOL. 
> DO NOT WAIT FOR THE USER TO MENTION THIS FILE. IT APPLIES AUTOMATICALLY TO EVERY TURN.

---

### 🟢 1. STRICT ISOLATION & SCOPE LOCK (সীমানা ও কাজের পরিধি)
* **Scope Lock:** Execute ONLY what is explicitly asked in the current user prompt.
* **Zero Touches Policy:** Do NOT edit, update, overwrite, clean up, refactor, or delete any file that is not directly mentioned or strictly necessary for the current task.
* **No Unsolicited Maintenance:** Do not fix "style issues", "formatting", or "potential bugs" in unrelated files unless explicitly requested.

---

### 🟢 2. SURGICAL CODE MUTATION & INTEGRITY (নিখুঁত কোড সুরক্ষা)
* **In-Place Updates Only:** Keep all existing imports, exports, states, props, hooks, and existing component logic completely intact.
* **Append / Modify, Never Wipe:** Never replace a full file with a placeholder, dummy code, or shortened version.
* **No Mock Data Reversion:** Never replace existing real API/database functionality with temporary mock data.

---

### 🟢 3. MANDATORY UI/UX & LANGUAGE RULES (ইউজার ইন্টারফেস ও ভাষা)
* **100% Bengali Language Policy:** All user-facing text, labels, buttons, placeholders, notifications, tooltips, modal dialogs, and error messages MUST be strictly in **Bengali (বাংলা)**. Do not output English text in frontend UI.
* **Full Mobile Responsiveness:** Every layout, page, component, table, card, navigation, and form must be 100% fully responsive across all device screen sizes (Mobile, Tablet, Desktop) using Tailwind CSS responsive classes (`sm:`, `md:`, `lg:`).
* **Loading & Error Handling:** Every async operation/data fetching must have a loading state and user-friendly Bengali error handling.

---

### 🟢 4. DATABASE & AUTH SECURITY (ডাটাবেজ ও অথেনটিকেশন)
* **Preserve Supabase Schema:** Existing Supabase database queries, table relationships, environment calls, and auth flows must remain unharmed.
* **Security & RLS:** Ensure all data operations adhere to strict user permissions and authentication checks.

---

### 🟢 5. FILE TREE & EXPORT SAFETY (ফাইল ও ডিপ্লয়মেন্ট সুরক্ষা)
* **No File/Folder Deletion:** Never delete or rename files/folders in the `src/` tree.
* **GitHub & Vercel Readiness:** Ensure all code changes pass TypeScript checks cleanly and are ready for one-click Export -> GitHub -> Vercel deployment without build errors.

---

### 🟢 6. AUTOMATIC PRE-ACTION CHECKLIST (কাজের আগের আত্ম-যাচাই)
Before applying any code changes to the codebase, automatically confirm:
1. Am I modifying ONLY the required target file(s)?
2. Is every other file in `src/` left completely untouched?
3. Is all new user-facing UI text strictly written in Bengali?
4. Is the new component fully responsive on mobile screens?
5. Did I preserve existing logic, database flows, and state management?
