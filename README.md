# DaPathshala AI Education - Deployment Guide

এই অ্যাপ্লিকেশনটি GitHub এবং Vercel-এ ডেপ্লয় করার জন্য সম্পূর্ণভাবে প্রস্তুত করা হয়েছে। নিচে ধাপে ধাপে নির্দেশিকা দেওয়া হলো:

## ১. GitHub-এ কোড পুশ করা (Push to GitHub)

১. আপনার কম্পিউটারে একটি নতুন ফোল্ডার তৈরি করুন এবং এই প্রজেক্টের সব ফাইল সেখানে কপি করুন।
২. টার্মিনালে নিচের কমান্ডগুলো রান করুন:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
৩. GitHub-এ একটি নতুন রিপোজিটরি তৈরি করুন এবং সেটি আপনার লোকাল কোডের সাথে কানেক্ট করুন:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## ২. Vercel-এ ডেপ্লয় করা (Deploy to Vercel)

১. [Vercel](https://vercel.com/) এ লগইন করুন।
২. **Add New** > **Project** এ ক্লিক করুন।
৩. আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
৪. **Environment Variables** সেকশনে নিচের ভেরিয়েবলগুলো যুক্ত করুন:
   - `GEMINI_API_KEY`: আপনার Gemini API Key
   - `JWT_SECRET`: একটি সিক্রেট কী (যেমন: `my_super_secret_key`)
   - `NODE_ENV`: `production`
৫. **Deploy** বাটনে ক্লিক করুন।

## ৩. কাস্টম ডোমেইন যুক্ত করা (Custom Domain)

১. Vercel ড্যাশবোর্ডে আপনার প্রজেক্টে যান।
২. **Settings** > **Domains** এ ক্লিক করুন।
৩. আপনার ডোমেইন নাম (যেমন: `ldapathshala.com`) লিখুন এবং **Add** এ ক্লিক করুন।
৪. আপনার ডোমেইন প্রোভাইডারের (যেমন: Namecheap, GoDaddy) DNS সেটিংসে গিয়ে Vercel-এর দেওয়া CNAME বা A রেকর্ড যুক্ত করুন।

## ⚠️ গুরুত্বপূর্ণ সতর্কতা (Database Note)

এই অ্যাপটি বর্তমানে **SQLite** (`better-sqlite3`) ব্যবহার করছে। Vercel-এর ফাইল সিস্টেম "Ephemeral" (অস্থায়ী), তাই প্রতিবার অ্যাপ রিস্টার্ট বা নতুন ডেপ্লয়মেন্টের সময় আপনার ডেটাবেসের ডেটা মুছে যাবে।

**সমাধান:**
- **Production-এর জন্য:** Supabase, PlanetScale, বা MongoDB Atlas-এর মতো কোনো এক্সটার্নাল ডেটাবেস ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।
- অথবা, অ্যাপটি **Render** বা **Railway**-তে ডেপ্লয় করতে পারেন যেখানে "Persistent Disk" সাপোর্ট আছে।

## ৫. 404: NOT_FOUND এরর সমাধান (Fixing 404 Error)

যদি আপনি Vercel-এ ডেপ্লয় করার পর `404: NOT_FOUND` এরর দেখেন, তবে নিচের সেটিংসগুলো চেক করুন:

১. **Vercel Project Settings:**
   - Vercel ড্যাশবোর্ডে গিয়ে আপনার প্রজেক্ট সিলেক্ট করুন।
   - **Settings** > **General** এ যান।
   - **Build & Development Settings** সেকশনে:
     - **Framework Preset:** `Vite` সিলেক্ট করুন।
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist` (এটি খুবই গুরুত্বপূর্ণ)।
     - **Install Command:** `npm install`

২. **Environment Variables:**
   - নিশ্চিত করুন যে `JWT_SECRET` এবং `GEMINI_API_KEY` সেট করা আছে।

৩. **Redeploy:**
   - সেটিংস সেভ করার পর **Deployments** ট্যাবে গিয়ে লেটেস্ট ডেপ্লয়মেন্টটি **Redeploy** করুন।

**নোট:** আমি প্রজেক্টের স্ট্রাকচার এমনভাবে আপডেট করেছি যাতে এটি ভারসেলের "Zero Config" সাপোর্ট করে। এখন সরাসরি গিটহাবে আপলোড করলেই কাজ করবে।

## ⚠️ গুরুত্বপূর্ণ সতর্কতা (Database Note)
Vercel-এ `better-sqlite3` (SQLite) সরাসরি কাজ করবে না কারণ ভারসেল ফাইল সেভ করতে দেয় না। প্রোডাকশনের জন্য অবশ্যই **Supabase (PostgreSQL)** বা **MongoDB Atlas** ব্যবহার করুন।

---
শুভকামনা আপনার প্রজেক্টের জন্য!
