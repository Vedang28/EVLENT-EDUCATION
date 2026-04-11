# Phase 6 Implementation Plan — EVLENT Education

**Project:** EVLENT Education LMS
**Phase:** 6 — Parent Portal, Mobile App & Platform Expansion
**GitHub:** https://github.com/Vedang28/EVLENT-EDUCATION
**Author:** [@Vedang28](https://github.com/Vedang28)
**Date:** 2026-04-11
**Workflow:** Run `/workflow Complete Phase 6` to execute this plan end-to-end

---

## Table of Contents

1. [Phase 6 Overview](#1-phase-6-overview)
2. [Current Status](#2-current-status)
3. [Features & Subtasks Breakdown](#3-features--subtasks-breakdown)
4. [Scaffolding Requirements](#4-scaffolding-requirements)
5. [Implementation Plan](#5-implementation-plan)
6. [Testing Plan](#6-testing-plan)
7. [Debugging Plan](#7-debugging-plan)
8. [Code Review Checklist](#8-code-review-checklist)
9. [Security & Quality Audit](#9-security--quality-audit)
10. [Git & Push Strategy](#10-git--push-strategy)
11. [File Inventory](#11-file-inventory)
12. [Verification Checklist](#12-verification-checklist)

---

## 1. Phase 6 Overview

Phase 6 expands the EVLENT Education platform with five major features that extend the audience (parents), the reach (mobile), the accessibility (i18n), the business model (payments), and the learning experience (AI tutoring).

| # | Feature | Description |
|---|---------|-------------|
| F1 | **Parent/Guardian Portal** | New `parent` role with read-only access to linked students' data — enrollments, grades, attendance, progress. Parent dashboard, child progress views, parent-teacher messaging. |
| F2 | **Mobile Application (React Native)** | Architecture plan for a separate React Native / Expo project sharing the same Supabase backend. Push notifications, offline caching, camera-based submissions, deep-linking. |
| F3 | **Multi-Language Support (i18n)** | `react-i18next` integration with English, Hindi, Marathi, Tamil translations. Language preference stored in `profiles`. All UI strings wrapped with `t()`. |
| F4 | **Payment Integration** | Razorpay (India) + Stripe (international) payment gateways. Course pricing, subscription plans, checkout flow, webhook handling via Supabase Edge Functions, invoice generation, payment history, admin fee dashboard. |
| F5 | **AI-Powered Tutoring** | Subject-specific chatbot using Claude API. Supabase Edge Function as proxy. Chat sessions persisted in DB. Content recommendations, practice question generation, AI performance insights. |

**Dependencies between features:**

| Feature | Depends On | Notes |
|---------|-----------|-------|
| F1 (Parent Portal) | Phases 1-5 complete | Needs grades, attendance, messaging, notifications |
| F2 (Mobile App) | Shared Supabase backend | Separate project; architecture plan only |
| F3 (i18n) | Independent | Touches nearly every UI file; can be done anytime |
| F4 (Payments) | Independent | Requires Supabase Edge Functions for webhook handling |
| F5 (AI Tutoring) | Independent | Benefits from Phase 4 content (subjects, quizzes) |

**Recommended execution order:** F3 (i18n, foundational) → F1 (parent portal) → F4 (payments) → F5 (AI tutoring) → F2 (mobile, architecture doc)

---

## 2. Current Status

| Feature | Status | What's Done | What Remains |
|---------|--------|-------------|--------------|
| **F1: Parent/Guardian Portal** | **NOT started** | — | Everything: DB schema, RLS policies, pages, hooks, sidebar, routes |
| **F2: Mobile Application** | **NOT started** | — | Architecture plan, project scaffold, shared code strategy |
| **F3: Multi-Language Support** | **NOT started** | — | i18n setup, translation files, `t()` wrapping, language selector |
| **F4: Payment Integration** | **NOT started** | — | DB tables, Edge Functions, checkout UI, webhook handling, admin dashboard |
| **F5: AI-Powered Tutoring** | **NOT started** | — | Edge Function proxy, chat UI, DB table, recommendation engine |

---

## 3. Features & Subtasks Breakdown

### F1: Parent/Guardian Portal

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F1.1 | Alter `app_role` ENUM to add `parent` | `ALTER TYPE public.app_role ADD VALUE 'parent'` | **TODO** |
| F1.2 | Create `parent_students` table | `id`, `parent_id`, `student_id`, `relationship`, `verified`, `linked_at` with RLS | **TODO** |
| F1.3 | RLS policies for parent read-only access | Parents can SELECT from `enrollments`, `submissions`, `lesson_progress`, `notifications`, `courses` where student_id is a linked child | **TODO** |
| F1.4 | Update `handle_new_user()` trigger | When admin creates a parent account, assign `parent` role instead of `student` | **TODO** |
| F1.5 | Update `admin-create-user` Edge Function | Accept `parent` as a valid role option | **TODO** |
| F1.6 | Create `useParentStudents` hook | Fetch linked students for the current parent user | **TODO** |
| F1.7 | Create `useChildData` hook | Fetch enrollments, grades, progress, upcoming items for a specific child | **TODO** |
| F1.8 | Update `useUserRole.ts` | Add `isParent` boolean to the return value; add `"parent"` to `AppRole` type | **TODO** |
| F1.9 | Create `ParentDashboard.tsx` page | Overview cards for each linked child: enrolled courses, completion %, recent grades, upcoming assignments/classes | **TODO** |
| F1.10 | Create `ChildProgress.tsx` page | Detailed view of a single child's course progress, grades, attendance, lesson completion | **TODO** |
| F1.11 | Create `ParentMessages.tsx` page | Parent-teacher messaging (extends Phase 5 direct messaging to include parent role) | **TODO** |
| F1.12 | Update `AppSidebar.tsx` | Add `parentNav` array with parent-specific nav items; show "Parent Portal" in Switch View section | **TODO** |
| F1.13 | Update `App.tsx` | Add `/parent`, `/parent/child/:studentId`, `/parent/messages` routes | **TODO** |
| F1.14 | Admin UI: manage parent-student links | Add parent-student linking section to `AdminUsers.tsx` (similar to teacher-student assignments) | **TODO** |
| F1.15 | Update `AdminUsers.tsx` create user dialog | Add `parent` as a role option in the create account dialog | **TODO** |
| F1.16 | Update `types.ts` | Add `parent_students` table types and update `app_role` enum to include `"parent"` | **TODO** |
| F1.17 | Notification triggers for parents | When a child gets a grade, new assignment, or new lesson, also notify linked parent(s) | **TODO** |

### F2: Mobile Application (React Native) — Architecture Plan

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F2.1 | Architecture decision document | Expo vs bare React Native, monorepo vs separate repo, shared code strategy | **TODO** |
| F2.2 | Project scaffold spec | Directory structure, key dependencies (`expo`, `@supabase/supabase-js`, `@react-navigation/native`, `expo-notifications`, `@react-native-async-storage/async-storage`) | **TODO** |
| F2.3 | Shared Supabase client config | Document how to share the same Supabase project URL + anon key; same RLS policies apply | **TODO** |
| F2.4 | Push notification architecture | Expo Notifications → `expo-notifications` → store device push tokens in new `device_tokens` table → Supabase Edge Function to send via Expo Push API | **TODO** |
| F2.5 | Offline caching strategy | AsyncStorage for lesson text content; SQLite via `expo-sqlite` for structured data; cache invalidation on reconnect | **TODO** |
| F2.6 | Camera-based submission flow | `expo-camera` → capture → `expo-file-system` → upload to Supabase Storage `submissions` bucket | **TODO** |
| F2.7 | Deep-linking specification | URL scheme `evlent://` + universal links; map to meeting URLs, course pages, notification targets | **TODO** |
| F2.8 | Screen inventory | List of mobile screens: Login, Dashboard, Course List, Course Detail, Lesson, Assignment, Grades, Live Class, Notifications, Profile | **TODO** |
| F2.9 | Teacher quick grading view spec | Mobile-optimized grading: swipe through submissions, tap to grade, quick feedback templates | **TODO** |
| F2.10 | DB migration: `device_tokens` table | `id`, `user_id`, `token`, `platform` (ios/android), `created_at`, `updated_at` | **TODO** |

### F3: Multi-Language Support (i18n)

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F3.1 | Install i18n dependencies | `react-i18next`, `i18next`, `i18next-browser-languagedetector` | **TODO** |
| F3.2 | Create i18n configuration file | `src/lib/i18n.ts` — initialize i18next with language detector, fallback to `en` | **TODO** |
| F3.3 | Import i18n config in `main.tsx` | Import `src/lib/i18n.ts` before app render | **TODO** |
| F3.4 | Create English translation file | `src/locales/en.json` — extract all UI strings from existing components | **TODO** |
| F3.5 | Create Hindi translation file | `src/locales/hi.json` — translate all keys | **TODO** |
| F3.6 | Create Marathi translation file | `src/locales/mr.json` — translate all keys | **TODO** |
| F3.7 | Create Tamil translation file | `src/locales/ta.json` — translate all keys | **TODO** |
| F3.8 | Add `language` column to `profiles` table | `ALTER TABLE public.profiles ADD COLUMN language TEXT NOT NULL DEFAULT 'en'` | **TODO** |
| F3.9 | Language selector on Profile page | Dropdown to select language; save to `profiles.language`; call `i18next.changeLanguage()` | **TODO** |
| F3.10 | Load saved language on auth | When user logs in, read `profiles.language` and set i18next language | **TODO** |
| F3.11 | Wrap Dashboard strings with `t()` | Replace all hardcoded strings in `Dashboard.tsx` | **TODO** |
| F3.12 | Wrap Courses page strings with `t()` | Replace all hardcoded strings in `Courses.tsx` | **TODO** |
| F3.13 | Wrap CourseDetail page strings with `t()` | Replace all hardcoded strings in `CourseDetail.tsx` | **TODO** |
| F3.14 | Wrap Grades page strings with `t()` | Replace all hardcoded strings in `Grades.tsx` | **TODO** |
| F3.15 | Wrap LiveClasses page strings with `t()` | Replace all hardcoded strings in `LiveClasses.tsx` | **TODO** |
| F3.16 | Wrap Notifications page strings with `t()` | Replace all hardcoded strings in `Notifications.tsx` | **TODO** |
| F3.17 | Wrap Profile page strings with `t()` | Replace all hardcoded strings in `Profile.tsx` | **TODO** |
| F3.18 | Wrap Calendar page strings with `t()` | Replace all hardcoded strings in `Calendar.tsx` | **TODO** |
| F3.19 | Wrap Timetable page strings with `t()` | Replace all hardcoded strings in `Timetable.tsx` | **TODO** |
| F3.20 | Wrap AppSidebar strings with `t()` | Replace all nav item titles, labels, and button text | **TODO** |
| F3.21 | Wrap AppLayout strings with `t()` | Replace header strings | **TODO** |
| F3.22 | Wrap Login/Register/Auth pages with `t()` | Replace all auth page strings | **TODO** |
| F3.23 | Wrap Teacher pages with `t()` | Replace all strings in `teacher/*.tsx` pages | **TODO** |
| F3.24 | Wrap Admin pages with `t()` | Replace all strings in `admin/*.tsx` pages | **TODO** |
| F3.25 | Wrap AssignmentPage strings with `t()` | Replace all hardcoded strings | **TODO** |
| F3.26 | Wrap LessonPage strings with `t()` | Replace all hardcoded strings | **TODO** |
| F3.27 | RTL support foundation | Add `dir` attribute to HTML based on language; configure Tailwind for logical properties (future-proofing) | **TODO** |
| F3.28 | Update `types.ts` | Add `language` column to `profiles` table type | **TODO** |

### F4: Payment Integration

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F4.1 | Create `payment_plans` table | `id`, `name`, `price`, `currency`, `interval`, `features` JSONB, `active` BOOLEAN | **TODO** |
| F4.2 | Create `payments` table | `id`, `user_id`, `plan_id`, `amount`, `currency`, `gateway`, `gateway_payment_id`, `status`, `created_at` | **TODO** |
| F4.3 | Create `subscriptions` table | `id`, `user_id`, `plan_id`, `status`, `current_period_start`, `current_period_end`, `gateway_subscription_id` | **TODO** |
| F4.4 | Add `price` and `currency` columns to `courses` | `ALTER TABLE public.courses ADD COLUMN price INTEGER DEFAULT 0, ADD COLUMN currency TEXT DEFAULT 'INR'` | **TODO** |
| F4.5 | RLS policies for payment tables | Students can read own payments/subscriptions; admins can read/write all; no direct inserts from client (webhook only) | **TODO** |
| F4.6 | Create `razorpay-checkout` Edge Function | Accept plan/course ID + user ID → create Razorpay order → return order_id to client | **TODO** |
| F4.7 | Create `razorpay-webhook` Edge Function | Verify Razorpay signature → insert into `payments` → update `subscriptions` → grant access (create enrollment) | **TODO** |
| F4.8 | Create `stripe-checkout` Edge Function | Accept plan/course ID + user ID → create Stripe Checkout Session → return session URL | **TODO** |
| F4.9 | Create `stripe-webhook` Edge Function | Verify Stripe signature → insert into `payments` → update `subscriptions` → grant access | **TODO** |
| F4.10 | Create `usePaymentPlans` hook | Fetch available payment plans from `payment_plans` table | **TODO** |
| F4.11 | Create `usePaymentHistory` hook | Fetch user's payment history with plan details | **TODO** |
| F4.12 | Create `useSubscription` hook | Fetch user's active subscription status | **TODO** |
| F4.13 | Create `Checkout.tsx` page | Display plan details, select gateway (Razorpay/Stripe), initiate checkout, handle redirect/callback | **TODO** |
| F4.14 | Create `PaymentHistory.tsx` page | Table of past payments with status, amount, date, invoice download link | **TODO** |
| F4.15 | Create `FeeDashboard.tsx` admin page | Revenue charts (Recharts), outstanding payments, collection rates, payment breakdown by gateway | **TODO** |
| F4.16 | Invoice generation | Supabase Edge Function: generate PDF invoice from payment record, store in Supabase Storage | **TODO** |
| F4.17 | Update course enrollment flow | If course has `price > 0`, redirect to checkout before enrollment | **TODO** |
| F4.18 | Update `App.tsx` with payment routes | Add `/checkout/:planId`, `/payments`, `/admin/fees` routes | **TODO** |
| F4.19 | Update `AppSidebar.tsx` | Add "Payments" nav item for students; add "Fees" nav item for admin | **TODO** |
| F4.20 | Update `types.ts` | Add `payment_plans`, `payments`, `subscriptions` table types; update `courses` type with `price`, `currency` | **TODO** |
| F4.21 | Razorpay client-side SDK integration | Load Razorpay checkout.js script dynamically; handle payment success/failure callbacks | **TODO** |

### F5: AI-Powered Tutoring

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F5.1 | Create `chat_sessions` table | `id`, `student_id`, `subject`, `messages` JSONB, `created_at`, `updated_at` | **TODO** |
| F5.2 | RLS policies for `chat_sessions` | Students can CRUD own sessions; teachers can read sessions of their students; admins can read all | **TODO** |
| F5.3 | Create `ai-tutor` Edge Function | Accept message + session context → call Claude API → return response; system prompt includes subject context | **TODO** |
| F5.4 | Create `ai-recommendations` Edge Function | Query `lesson_progress` + `submissions` for a student → identify weak areas → return recommendations | **TODO** |
| F5.5 | Create `ai-practice-questions` Edge Function | Accept lesson content → generate practice questions via Claude → return structured JSON | **TODO** |
| F5.6 | Create `ai-performance-insights` Edge Function | Aggregate student data → generate AI summary for teachers/parents → return formatted insights | **TODO** |
| F5.7 | Create `useAiChat` hook | Manage chat state, send messages to Edge Function, stream responses, persist to `chat_sessions` | **TODO** |
| F5.8 | Create `useAiRecommendations` hook | Fetch content recommendations for the current student | **TODO** |
| F5.9 | Create `AiTutor.tsx` page | Chat interface: message list, input box, subject selector, session history sidebar | **TODO** |
| F5.10 | Embed AI chat in lesson pages | Optional floating chat widget on `LessonPage.tsx` with lesson context pre-loaded | **TODO** |
| F5.11 | Practice questions component | Button on lesson page to generate practice questions; quiz-style UI for answering | **TODO** |
| F5.12 | Performance insights for teachers | Card on `TeacherDashboard.tsx` showing AI-generated class insights | **TODO** |
| F5.13 | Performance insights for parents | Card on `ParentDashboard.tsx` showing AI-generated child insights | **TODO** |
| F5.14 | Update `App.tsx` with tutor route | Add `/tutor` route | **TODO** |
| F5.15 | Update `AppSidebar.tsx` | Add "AI Tutor" nav item for students | **TODO** |
| F5.16 | Update `types.ts` | Add `chat_sessions` table type | **TODO** |
| F5.17 | Rate limiting | Implement per-user rate limiting in the `ai-tutor` Edge Function (e.g., 50 messages/hour) | **TODO** |
| F5.18 | Token usage tracking | Log token usage per session in `chat_sessions.messages` JSONB for cost monitoring | **TODO** |

---

## 4. Scaffolding Requirements

### New Files

| File Path | Feature | Purpose |
|-----------|---------|---------|
| `src/pages/parent/ParentDashboard.tsx` | F1 | Parent overview page with linked children cards |
| `src/pages/parent/ChildProgress.tsx` | F1 | Detailed child progress view |
| `src/pages/parent/ParentMessages.tsx` | F1 | Parent-teacher messaging interface |
| `src/hooks/useParentStudents.ts` | F1 | Fetch linked children for parent user |
| `src/hooks/useChildData.ts` | F1 | Fetch child's enrollments, grades, progress |
| `src/lib/i18n.ts` | F3 | i18next initialization and configuration |
| `src/locales/en.json` | F3 | English translation strings |
| `src/locales/hi.json` | F3 | Hindi translation strings |
| `src/locales/mr.json` | F3 | Marathi translation strings |
| `src/locales/ta.json` | F3 | Tamil translation strings |
| `src/pages/Checkout.tsx` | F4 | Payment checkout page |
| `src/pages/PaymentHistory.tsx` | F4 | Student/parent payment history |
| `src/pages/admin/FeeDashboard.tsx` | F4 | Admin revenue and fee dashboard |
| `src/hooks/usePaymentPlans.ts` | F4 | Fetch payment plans |
| `src/hooks/usePaymentHistory.ts` | F4 | Fetch user payment history |
| `src/hooks/useSubscription.ts` | F4 | Fetch active subscription |
| `src/pages/AiTutor.tsx` | F5 | AI chat interface page |
| `src/hooks/useAiChat.ts` | F5 | AI chat state management |
| `src/hooks/useAiRecommendations.ts` | F5 | Content recommendations hook |
| `src/components/AiChatWidget.tsx` | F5 | Floating chat widget for lesson pages |
| `src/components/PracticeQuestions.tsx` | F5 | Practice question generation UI |
| `supabase/migrations/2026XXXX_phase6_parent_portal.sql` | F1 | Parent role, parent_students table, RLS |
| `supabase/migrations/2026XXXX_phase6_i18n.sql` | F3 | Language column on profiles |
| `supabase/migrations/2026XXXX_phase6_payments.sql` | F4 | Payment tables, course pricing columns |
| `supabase/migrations/2026XXXX_phase6_ai_tutor.sql` | F5 | chat_sessions table |
| `supabase/migrations/2026XXXX_phase6_mobile_tokens.sql` | F2 | device_tokens table |
| `supabase/functions/razorpay-checkout/index.ts` | F4 | Create Razorpay order |
| `supabase/functions/razorpay-webhook/index.ts` | F4 | Handle Razorpay webhook |
| `supabase/functions/stripe-checkout/index.ts` | F4 | Create Stripe session |
| `supabase/functions/stripe-webhook/index.ts` | F4 | Handle Stripe webhook |
| `supabase/functions/ai-tutor/index.ts` | F5 | Claude API proxy |
| `supabase/functions/ai-recommendations/index.ts` | F5 | Content recommendations |
| `supabase/functions/ai-practice-questions/index.ts` | F5 | Practice question generation |
| `supabase/functions/ai-performance-insights/index.ts` | F5 | AI performance summaries |
| `supabase/functions/generate-invoice/index.ts` | F4 | PDF invoice generation |
| `docs/mobile-architecture.md` | F2 | Mobile app architecture document |
| `src/test/hooks/useParentStudents.test.ts` | F1 | Hook tests |
| `src/test/hooks/useChildData.test.ts` | F1 | Hook tests |
| `src/test/hooks/useAiChat.test.ts` | F5 | Hook tests |
| `src/test/hooks/usePaymentPlans.test.ts` | F4 | Hook tests |
| `src/test/i18n.test.ts` | F3 | i18n configuration tests |
| `src/test/pages/ParentDashboard.test.tsx` | F1 | Page render tests |
| `src/test/pages/AiTutor.test.tsx` | F5 | Page render tests |
| `src/test/pages/Checkout.test.tsx` | F4 | Page render tests |

### Modified Files

| File Path | Feature | Changes |
|-----------|---------|---------|
| `src/hooks/useUserRole.ts` | F1 | Add `"parent"` to `AppRole` type; add `isParent` to return |
| `src/components/AppSidebar.tsx` | F1, F3, F4, F5 | Add `parentNav` array; add payment/tutor nav items; wrap strings with `t()` |
| `src/components/AppLayout.tsx` | F3 | Wrap strings with `t()` |
| `src/App.tsx` | F1, F4, F5 | Add parent routes, payment routes, tutor route |
| `src/main.tsx` | F3 | Import `src/lib/i18n.ts` |
| `src/pages/Profile.tsx` | F3 | Add language selector dropdown; wrap strings with `t()` |
| `src/pages/Dashboard.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Courses.tsx` | F3, F4 | Wrap strings with `t()`; show course price if > 0 |
| `src/pages/CourseDetail.tsx` | F3, F4 | Wrap strings with `t()`; show price and "Enroll" vs "Buy" button |
| `src/pages/Grades.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/LiveClasses.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Notifications.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Calendar.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Timetable.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/LessonPage.tsx` | F3, F5 | Wrap strings with `t()`; add AI chat widget and practice questions button |
| `src/pages/AssignmentPage.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Login.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/Register.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/ForgotPassword.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/ResetPassword.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/TeacherDashboard.tsx` | F3, F5 | Wrap strings with `t()`; add AI insights card |
| `src/pages/teacher/TeacherCourses.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/CreateCourse.tsx` | F3, F4 | Wrap strings with `t()`; add price/currency fields |
| `src/pages/teacher/TeacherCourseDetail.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/TeacherSubmissions.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/AssignmentSubmissions.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/TeacherLiveClasses.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/teacher/TeacherStudents.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/admin/AdminDashboard.tsx` | F3 | Wrap strings with `t()` |
| `src/pages/admin/AdminUsers.tsx` | F1, F3 | Add parent role option; add parent-student linking section; wrap strings with `t()` |
| `src/pages/admin/AdminCourses.tsx` | F3 | Wrap strings with `t()` |
| `src/components/EnrolledCourseCard.tsx` | F3 | Wrap strings with `t()` |
| `src/components/NavLink.tsx` | F3 | No string changes needed (passes through) |
| `src/components/ProtectedRoute.tsx` | F3 | Minimal — no visible strings |
| `src/integrations/supabase/types.ts` | F1, F3, F4, F5 | Add `parent_students`, `payment_plans`, `payments`, `subscriptions`, `chat_sessions`, `device_tokens` table types; update `app_role` enum; add `language` to `profiles`; add `price`/`currency` to `courses` |
| `supabase/functions/admin-create-user/index.ts` | F1 | Accept `"parent"` as valid role |
| `package.json` | F3 | Add `react-i18next`, `i18next`, `i18next-browser-languagedetector` |

### New Dependencies

| Package | Version | Feature | Purpose |
|---------|---------|---------|---------|
| `react-i18next` | `^14.0.0` | F3 | React bindings for i18next |
| `i18next` | `^24.0.0` | F3 | Core i18n framework |
| `i18next-browser-languagedetector` | `^8.0.0` | F3 | Auto-detect browser language |

Note: F4 (Razorpay) loads the Razorpay script tag dynamically at runtime — no npm package needed for the client-side SDK. F5 (Claude API) is called server-side from Edge Functions — `@anthropic-ai/sdk` is imported via `esm.sh` in Deno, not installed in the frontend.

### Type Definitions

```typescript
// Addition to AppRole type in useUserRole.ts
export type AppRole = "student" | "teacher" | "admin" | "parent";

// parent_students table
interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
  relationship: "mother" | "father" | "guardian";
  verified: boolean;
  linked_at: string;
}

// payment_plans table
interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "monthly" | "quarterly" | "yearly" | "one_time";
  features: Record<string, any>;
  active: boolean;
  created_at: string;
}

// payments table
interface Payment {
  id: string;
  user_id: string;
  plan_id: string | null;
  course_id: string | null;
  amount: number;
  currency: string;
  gateway: "razorpay" | "stripe";
  gateway_payment_id: string;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
}

// subscriptions table
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "expired" | "past_due";
  current_period_start: string;
  current_period_end: string;
  gateway_subscription_id: string;
}

// chat_sessions table
interface ChatSession {
  id: string;
  student_id: string;
  subject: string;
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

// device_tokens table (for mobile push notifications)
interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: "ios" | "android";
  created_at: string;
  updated_at: string;
}

// Updated profiles table (add language)
// profiles.language: string (default 'en')

// Updated courses table (add price, currency)
// courses.price: number (default 0)
// courses.currency: string (default 'INR')
```

### DB Migrations Summary

| Migration | Tables/Columns | Feature |
|-----------|---------------|---------|
| `phase6_parent_portal.sql` | ALTER TYPE `app_role` ADD VALUE `'parent'`; CREATE TABLE `parent_students`; RLS policies for parent read access on `enrollments`, `submissions`, `lesson_progress`, `notifications`; Update notification triggers to also notify parents | F1 |
| `phase6_i18n.sql` | ALTER TABLE `profiles` ADD COLUMN `language` TEXT NOT NULL DEFAULT `'en'` | F3 |
| `phase6_payments.sql` | CREATE TABLE `payment_plans`, `payments`, `subscriptions`; ALTER TABLE `courses` ADD COLUMN `price`, `currency`; RLS policies | F4 |
| `phase6_ai_tutor.sql` | CREATE TABLE `chat_sessions`; RLS policies | F5 |
| `phase6_mobile_tokens.sql` | CREATE TABLE `device_tokens`; RLS policies | F2 |

---

## 5. Implementation Plan

### Step 1: Database Migrations (All Features)

Run all migration files in order. These are independent and can be applied in a single step.

| # | Subtask | File | Details |
|---|---------|------|---------|
| 1.1 | Add `parent` to `app_role` ENUM | `supabase/migrations/2026XXXX_phase6_parent_portal.sql` | `ALTER TYPE public.app_role ADD VALUE 'parent'` (irreversible in PostgreSQL — must be done via migration) |
| 1.2 | Create `parent_students` table with RLS | Same migration file | Table with `id`, `parent_id`, `student_id`, `relationship`, `verified`, `linked_at`; UNIQUE on `(parent_id, student_id)` |
| 1.3 | Add parent RLS policies on existing tables | Same migration file | SELECT policies on `enrollments`, `submissions`, `lesson_progress`, `notifications` for parent users via `parent_students` join |
| 1.4 | Update notification triggers to notify parents | Same migration file | Modify `notify_on_grade`, `notify_on_new_assignment`, `notify_on_new_lesson` to also insert notifications for linked parents |
| 1.5 | Add `language` column to `profiles` | `supabase/migrations/2026XXXX_phase6_i18n.sql` | `ALTER TABLE profiles ADD COLUMN language TEXT NOT NULL DEFAULT 'en'` |
| 1.6 | Create payment tables | `supabase/migrations/2026XXXX_phase6_payments.sql` | `payment_plans`, `payments`, `subscriptions` tables; add `price`/`currency` to `courses` |
| 1.7 | Create `chat_sessions` table | `supabase/migrations/2026XXXX_phase6_ai_tutor.sql` | Table with JSONB messages column |
| 1.8 | Create `device_tokens` table | `supabase/migrations/2026XXXX_phase6_mobile_tokens.sql` | For push notification tokens |

### Step 2: Update Supabase Types & Core Infrastructure

| # | Subtask | File | Details |
|---|---------|------|---------|
| 2.1 | Regenerate `types.ts` | `src/integrations/supabase/types.ts` | Run `supabase gen types typescript` or manually add all new table types, updated `app_role` enum, updated `profiles` and `courses` types |
| 2.2 | Update `useUserRole.ts` | `src/hooks/useUserRole.ts` | Add `"parent"` to `AppRole` union type; add `isParent: roles?.includes("parent") ?? false` to return |
| 2.3 | Update `admin-create-user` Edge Function | `supabase/functions/admin-create-user/index.ts` | Change role validation from `["student", "teacher"]` to `["student", "teacher", "parent"]`; when role is `parent`, insert `parent` into `user_roles` instead of `student` |

### Step 3: F3 — i18n Setup (Foundation — Touches All Files)

Implement i18n first since it touches every UI file and is foundational.

| # | Subtask | File | Details |
|---|---------|------|---------|
| 3.1 | Install dependencies | `package.json` | `npm install react-i18next i18next i18next-browser-languagedetector` |
| 3.2 | Create i18n config | `src/lib/i18n.ts` | Initialize i18next with `LanguageDetector` plugin, `en` fallback, load translation resources |
| 3.3 | Create English translations | `src/locales/en.json` | Extract every UI string from all components into structured JSON keys (e.g., `"dashboard.welcome": "Welcome back"`, `"sidebar.dashboard": "Dashboard"`, `"common.save": "Save Changes"`) |
| 3.4 | Create Hindi translations | `src/locales/hi.json` | Translate all keys to Hindi |
| 3.5 | Create Marathi translations | `src/locales/mr.json` | Translate all keys to Marathi |
| 3.6 | Create Tamil translations | `src/locales/ta.json` | Translate all keys to Tamil |
| 3.7 | Import i18n in entry point | `src/main.tsx` | Add `import "@/lib/i18n"` before React render |
| 3.8 | Wrap all component strings | All page and component files | Replace every hardcoded string with `t("key")` using `useTranslation()` hook |
| 3.9 | Language selector on Profile | `src/pages/Profile.tsx` | Add `Select` dropdown with language options; on change, update `profiles.language` and call `i18n.changeLanguage()` |
| 3.10 | Auto-load language on login | `src/contexts/AuthContext.tsx` or `src/components/AppLayout.tsx` | After auth state resolves, fetch `profiles.language` and set i18next language |
| 3.11 | RTL foundation | `index.html` or `App.tsx` | Add `dir` attribute dynamically based on language (not needed for en/hi/mr/ta but architecturally prepared) |

### Step 4: F1 — Parent Portal

| # | Subtask | File | Details |
|---|---------|------|---------|
| 4.1 | Create `useParentStudents` hook | `src/hooks/useParentStudents.ts` | Query `parent_students` joined with `profiles` for current parent's `user_id`; return linked children with names/emails |
| 4.2 | Create `useChildData` hook | `src/hooks/useChildData.ts` | Accept `studentId` param; query `enrollments` (with courses), `submissions` (with assignments), `lesson_progress`, `notifications` for that student; return structured child data |
| 4.3 | Create `ParentDashboard.tsx` | `src/pages/parent/ParentDashboard.tsx` | Use `useParentStudents` to list linked children; for each child show: enrolled course count, overall completion %, latest grade, upcoming assignment count; link to `/parent/child/:studentId` |
| 4.4 | Create `ChildProgress.tsx` | `src/pages/parent/ChildProgress.tsx` | Use `useChildData` with `studentId` from URL params; show tabbed view: Courses (with progress bars), Grades (table with course/assignment/score), Upcoming (assignments + live classes) |
| 4.5 | Create `ParentMessages.tsx` | `src/pages/parent/ParentMessages.tsx` | Messaging interface for parent to communicate with child's teachers; list teachers from child's enrolled courses; message input with send |
| 4.6 | Add `parentNav` to sidebar | `src/components/AppSidebar.tsx` | Add `parentNav` array: Dashboard (`/parent`), Notifications (`/notifications`), Profile (`/profile`); add "Parent Portal" to Switch View section; detect `/parent` path prefix for portal switching |
| 4.7 | Add parent routes to App | `src/App.tsx` | Add `<Route path="/parent" element={<ParentDashboard />} />`, `<Route path="/parent/child/:studentId" element={<ChildProgress />} />`, `<Route path="/parent/messages" element={<ParentMessages />} />` |
| 4.8 | Update AdminUsers for parent linking | `src/pages/admin/AdminUsers.tsx` | Add "Link Parent" dialog (similar to "Assign Student" dialog); select parent account + student account + relationship; insert into `parent_students`; show parent-student links section |
| 4.9 | Update admin create user | `src/pages/admin/AdminUsers.tsx` | Add `<SelectItem value="parent">Parent</SelectItem>` to role dropdown in create dialog |

### Step 5: F4 — Payment Integration

| # | Subtask | File | Details |
|---|---------|------|---------|
| 5.1 | Create `razorpay-checkout` Edge Function | `supabase/functions/razorpay-checkout/index.ts` | Verify auth; read `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from env; create order via Razorpay Orders API; return `order_id`, `amount`, `currency` |
| 5.2 | Create `razorpay-webhook` Edge Function | `supabase/functions/razorpay-webhook/index.ts` | Verify `x-razorpay-signature` header with HMAC-SHA256; on `payment.captured`, insert into `payments` table with status `completed`; create enrollment if course payment; update subscription if plan payment |
| 5.3 | Create `stripe-checkout` Edge Function | `supabase/functions/stripe-checkout/index.ts` | Read `STRIPE_SECRET_KEY`; create Checkout Session with `success_url` and `cancel_url`; return session URL |
| 5.4 | Create `stripe-webhook` Edge Function | `supabase/functions/stripe-webhook/index.ts` | Verify Stripe signature with `STRIPE_WEBHOOK_SECRET`; handle `checkout.session.completed` event; insert into `payments`; create enrollment / update subscription |
| 5.5 | Create `generate-invoice` Edge Function | `supabase/functions/generate-invoice/index.ts` | Accept `payment_id`; generate PDF with payment details; upload to Supabase Storage `invoices` bucket; return download URL |
| 5.6 | Create `usePaymentPlans` hook | `src/hooks/usePaymentPlans.ts` | Query `payment_plans` where `active = true` |
| 5.7 | Create `usePaymentHistory` hook | `src/hooks/usePaymentHistory.ts` | Query `payments` joined with `payment_plans` for current user |
| 5.8 | Create `useSubscription` hook | `src/hooks/useSubscription.ts` | Query `subscriptions` where `user_id = current user` and `status = 'active'` |
| 5.9 | Create `Checkout.tsx` page | `src/pages/Checkout.tsx` | Read `planId` from URL params; fetch plan details; show plan summary card; gateway toggle (Razorpay/Stripe); "Pay Now" button triggers Edge Function; handle Razorpay inline checkout or Stripe redirect |
| 5.10 | Create `PaymentHistory.tsx` page | `src/pages/PaymentHistory.tsx` | Table with columns: Date, Plan/Course, Amount, Status, Invoice; download invoice link per row |
| 5.11 | Create `FeeDashboard.tsx` admin page | `src/pages/admin/FeeDashboard.tsx` | Total revenue card; monthly revenue chart (Recharts BarChart); payments table with filters; collection rate stat |
| 5.12 | Update course enrollment flow | `src/pages/CourseDetail.tsx` | If `course.price > 0` and user not enrolled, show "Buy Course - Rs X" button instead of "Enroll"; redirect to `/checkout/course-:courseId` |
| 5.13 | Update `CreateCourse.tsx` | `src/pages/teacher/CreateCourse.tsx` | Add price and currency input fields to the course creation form |
| 5.14 | Add payment routes | `src/App.tsx` | Add `/checkout/:planId`, `/payments`, `/admin/fees` |
| 5.15 | Add nav items | `src/components/AppSidebar.tsx` | Add "Payments" to `studentNav`; add "Fees" to `adminNav` |
| 5.16 | Razorpay client SDK | `src/pages/Checkout.tsx` | Dynamically load `https://checkout.razorpay.com/v1/checkout.js`; create `new Razorpay(options)` and call `open()` |

### Step 6: F5 — AI-Powered Tutoring

| # | Subtask | File | Details |
|---|---------|------|---------|
| 6.1 | Create `ai-tutor` Edge Function | `supabase/functions/ai-tutor/index.ts` | Read `ANTHROPIC_API_KEY` from env; accept `{ sessionId, message, subject }` in body; fetch session history from `chat_sessions`; call Claude API with system prompt (subject-specific tutor) + message history; return assistant response; update `chat_sessions.messages` |
| 6.2 | Create `ai-recommendations` Edge Function | `supabase/functions/ai-recommendations/index.ts` | Accept `studentId`; query `lesson_progress` + `submissions` + `assignments`; identify lessons not completed and low-scoring submissions; call Claude to generate personalized study recommendations; return JSON |
| 6.3 | Create `ai-practice-questions` Edge Function | `supabase/functions/ai-practice-questions/index.ts` | Accept `lessonId`; fetch lesson content from `lessons`; call Claude to generate 5 practice questions (multiple choice or short answer); return structured JSON |
| 6.4 | Create `ai-performance-insights` Edge Function | `supabase/functions/ai-performance-insights/index.ts` | Accept `studentId` or `courseId`; aggregate performance data; call Claude to generate a summary paragraph; return text |
| 6.5 | Create `useAiChat` hook | `src/hooks/useAiChat.ts` | State: `messages`, `isLoading`, `sessionId`; `sendMessage(text)` calls `ai-tutor` Edge Function; `loadSession(id)` loads existing session; `createSession(subject)` creates new session in DB |
| 6.6 | Create `useAiRecommendations` hook | `src/hooks/useAiRecommendations.ts` | React Query hook calling `ai-recommendations` Edge Function for current user |
| 6.7 | Create `AiTutor.tsx` page | `src/pages/AiTutor.tsx` | Left sidebar: session list + "New Chat" button + subject selector; main area: message list (user messages right-aligned, assistant left-aligned) + input box; responsive layout |
| 6.8 | Create `AiChatWidget.tsx` | `src/components/AiChatWidget.tsx` | Floating button (bottom-right) that expands into a small chat window; pre-loads lesson context as system message |
| 6.9 | Create `PracticeQuestions.tsx` | `src/components/PracticeQuestions.tsx` | Button "Generate Practice Questions"; on click, call Edge Function; display questions in card format; user selects/types answers; show correct answers on submit |
| 6.10 | Embed in LessonPage | `src/pages/LessonPage.tsx` | Add `<AiChatWidget lessonId={lessonId} />` and `<PracticeQuestions lessonId={lessonId} />` at bottom of lesson content |
| 6.11 | Teacher insights card | `src/pages/teacher/TeacherDashboard.tsx` | Add "AI Insights" card that calls `ai-performance-insights` for the teacher's courses; display summary text |
| 6.12 | Parent insights card | `src/pages/parent/ParentDashboard.tsx` | Add "AI Insights" card for each child using `ai-performance-insights` |
| 6.13 | Add tutor route | `src/App.tsx` | Add `<Route path="/tutor" element={<AiTutor />} />` |
| 6.14 | Add sidebar nav | `src/components/AppSidebar.tsx` | Add `{ title: "AI Tutor", url: "/tutor", icon: Bot }` to `studentNav` |
| 6.15 | Rate limiting | `supabase/functions/ai-tutor/index.ts` | Query recent message count for user in last hour; reject if > 50 |
| 6.16 | Token tracking | `supabase/functions/ai-tutor/index.ts` | Read `usage` from Claude API response; append `{ tokens_used }` to session metadata |

### Step 7: F2 — Mobile App Architecture Document

| # | Subtask | File | Details |
|---|---------|------|---------|
| 7.1 | Write architecture document | `docs/mobile-architecture.md` | Decision: Expo managed workflow; separate repo `evlent-mobile`; shared Supabase backend |
| 7.2 | Document project structure | Same file | Directory layout: `src/screens/`, `src/navigation/`, `src/hooks/` (shared logic), `src/services/supabase.ts` |
| 7.3 | Document shared code strategy | Same file | Shared: Supabase client config, query keys, TypeScript types; NOT shared: UI components (React Native vs React DOM) |
| 7.4 | Document push notification flow | Same file | Device token registration → `device_tokens` table → Supabase DB trigger on `notifications` insert → Edge Function calls Expo Push API |
| 7.5 | Document offline caching | Same file | AsyncStorage for auth tokens; expo-sqlite for lesson content cache; NetInfo listener for reconnect sync |
| 7.6 | Document camera submission flow | Same file | expo-camera → expo-file-system → supabase.storage.from("submissions").upload() |
| 7.7 | Document deep linking | Same file | URL scheme + Android App Links / iOS Universal Links; route mapping table |
| 7.8 | Create `device_tokens` migration | `supabase/migrations/2026XXXX_phase6_mobile_tokens.sql` | Already covered in Step 1.8 |
| 7.9 | Document screen inventory | Same file | Login, Student Dashboard, Course List, Course Detail, Lesson Viewer, Assignment Submit, Grades, Live Class Join, Notifications, Profile, Teacher Grading |

---

## 6. Testing Plan

### Unit Tests

| Test File | Feature | What It Tests |
|-----------|---------|---------------|
| `src/test/hooks/useParentStudents.test.ts` | F1 | Returns linked students for parent user; returns empty array when no links; handles loading state |
| `src/test/hooks/useChildData.test.ts` | F1 | Returns enrollments, grades, progress for a given student ID; handles missing student |
| `src/test/hooks/usePaymentPlans.test.ts` | F4 | Returns active payment plans; filters inactive plans; handles empty state |
| `src/test/hooks/useAiChat.test.ts` | F5 | Sends message and receives response; maintains message history; handles errors gracefully |
| `src/test/i18n.test.ts` | F3 | i18n initializes with English as default; switching language updates translations; missing keys fall back to English; all locale files have same key structure |

### Component / Page Tests

| Test File | Feature | What It Tests |
|-----------|---------|---------------|
| `src/test/pages/ParentDashboard.test.tsx` | F1 | Renders linked children cards; shows empty state when no children linked; navigates to child detail on click |
| `src/test/pages/ChildProgress.test.tsx` | F1 | Renders course progress bars; shows grades table; displays upcoming assignments |
| `src/test/pages/AiTutor.test.tsx` | F5 | Renders chat interface; sends message on form submit; displays loading indicator; shows session history |
| `src/test/pages/Checkout.test.tsx` | F4 | Renders plan details; shows gateway selection; handles checkout initiation |
| `src/test/pages/PaymentHistory.test.tsx` | F4 | Renders payment table; shows empty state; formats currency correctly |
| `src/test/pages/FeeDashboard.test.tsx` | F4 | Renders revenue chart; displays stats cards; handles no data |
| `src/test/components/AiChatWidget.test.tsx` | F5 | Toggles open/closed; sends messages; shows in lesson context |
| `src/test/components/PracticeQuestions.test.tsx` | F5 | Generates questions on button click; displays question cards; shows answers on submit |

### Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/test/hooks/useParentStudents.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose -t "parent"

# Run tests with coverage
npx vitest run --coverage

# Run only Phase 6 tests
npx vitest run src/test/hooks/useParentStudents.test.ts src/test/hooks/useChildData.test.ts src/test/hooks/usePaymentPlans.test.ts src/test/hooks/useAiChat.test.ts src/test/i18n.test.ts src/test/pages/ParentDashboard.test.tsx src/test/pages/AiTutor.test.tsx src/test/pages/Checkout.test.tsx
```

### Test Setup Notes

- All tests use `vitest` with `jsdom` environment (configured in `vitest.config.ts`)
- Mock `supabase` client in all hook tests using `vi.mock("@/integrations/supabase/client")`
- Mock `AuthContext` to provide a fake user with appropriate roles
- For i18n tests, initialize i18next in test setup with inline translation resources
- For component tests, wrap components in `QueryClientProvider`, `AuthProvider`, `BrowserRouter`, and `I18nextProvider`

---

## 7. Debugging Plan

### Common Issues Table

| # | Issue | Symptom | Likely Cause | Fix |
|---|-------|---------|-------------|-----|
| D1 | Parent can't see child data | Empty dashboard / 403 errors in console | RLS policies not applied; `parent_students` row missing or `verified = false` | Check `parent_students` table for link; verify RLS policy joins are correct; check `has_role` returns true for parent |
| D2 | `ALTER TYPE ADD VALUE` fails | Migration error: "cannot be executed inside a transaction" | PostgreSQL enum alteration restriction | Ensure migration runs outside a transaction block or use `ALTER TYPE ... ADD VALUE IF NOT EXISTS` |
| D3 | i18n strings show keys instead of text | UI shows `"dashboard.welcome"` literal | Translation file not loaded; key misspelled; i18n not initialized before render | Check `src/lib/i18n.ts` imports; verify JSON key matches exactly; check browser console for i18next warnings |
| D4 | Language doesn't persist on reload | Language resets to English after refresh | `profiles.language` not read on auth load; `i18next-browser-languagedetector` overriding DB preference | Ensure language is fetched from `profiles` and set via `i18n.changeLanguage()` after auth resolves; set detector order to prioritize localStorage |
| D5 | Razorpay checkout fails | "Razorpay not defined" or blank popup | Script not loaded; wrong key ID; CSP blocking script | Verify script loaded before `new Razorpay()`; check `RAZORPAY_KEY_ID` env var; check Content-Security-Policy headers |
| D6 | Razorpay webhook not triggering | Payments stay in `pending` status | Webhook URL not configured in Razorpay Dashboard; Edge Function not deployed; signature verification failing | Check Razorpay Dashboard webhook URL; check Supabase Edge Function logs; verify `RAZORPAY_WEBHOOK_SECRET` matches |
| D7 | Stripe webhook signature invalid | 400 error in webhook function | Wrong `STRIPE_WEBHOOK_SECRET`; request body parsed before signature check | Ensure raw body is used for signature verification (not parsed JSON); verify env var matches Stripe Dashboard |
| D8 | AI tutor returns 500 | Chat sends but no response | `ANTHROPIC_API_KEY` not set; API rate limit exceeded; malformed request | Check Edge Function logs; verify env var; check Claude API status; validate request payload shape |
| D9 | AI chat not streaming | Full response appears at once after long delay | Streaming not implemented or Edge Function not returning streaming response | For initial implementation, accept non-streaming; for UX improvement, implement SSE from Edge Function |
| D10 | Parent role not appearing in admin UI | "Parent" option missing from create user dialog | `SelectItem` not added to the role dropdown | Verify `AdminUsers.tsx` has `<SelectItem value="parent">Parent</SelectItem>` |
| D11 | Payment table RLS blocks client inserts | Client-side insert to `payments` fails | By design — payments should only be inserted by Edge Functions using service role key | This is correct behavior; ensure checkout flow uses Edge Functions, not direct client inserts |
| D12 | Mobile push tokens not saving | `device_tokens` insert fails | RLS policy missing for INSERT; user not authenticated in mobile app | Add INSERT policy for authenticated users where `auth.uid() = user_id`; verify Supabase auth in mobile client |
| D13 | Translation files not loading | 404 on locale JSON files | Files not in correct path; Vite not bundling JSON | Use direct imports in `i18n.ts` (`import en from "@/locales/en.json"`) instead of HTTP fetch |
| D14 | Type errors after migration | TypeScript errors on new tables | `types.ts` not regenerated after migration | Run `supabase gen types typescript` or manually update types file |
| D15 | Parent notifications not firing | Parents don't receive notifications when child gets graded | Trigger function not updated to query `parent_students` | Verify `notify_on_grade()` trigger includes `INSERT INTO notifications SELECT ps.parent_id ... FROM parent_students ps WHERE ps.student_id = NEW.student_id` |

### Developer Commands

```bash
# Check Supabase migration status
npx supabase migration list

# Apply pending migrations
npx supabase db push

# Reset local database (destructive)
npx supabase db reset

# View Edge Function logs
npx supabase functions logs ai-tutor
npx supabase functions logs razorpay-webhook
npx supabase functions logs stripe-webhook

# Deploy a single Edge Function
npx supabase functions deploy ai-tutor
npx supabase functions deploy razorpay-checkout
npx supabase functions deploy razorpay-webhook

# Test Edge Function locally
npx supabase functions serve ai-tutor

# Regenerate TypeScript types from DB
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts

# Check Vite dev server
npm run dev

# Build and check for TypeScript errors
npm run build

# Lint check
npm run lint
```

### Browser DevTools Checks

| Check | How | What To Look For |
|-------|-----|-----------------|
| RLS policy failures | Network tab → filter by `rest/v1` | 403 or empty `[]` responses for parent queries |
| i18n loading | Console tab | `i18next` debug messages showing loaded namespaces and languages |
| Razorpay script load | Network tab → filter by `razorpay` | Verify `checkout.js` loads with 200; check for CSP violations in console |
| Stripe redirect | Network tab | Verify Edge Function returns `session_url`; check redirect happens |
| AI chat requests | Network tab → filter by `functions/v1/ai-tutor` | Check request payload, response time, response body |
| WebSocket notifications | Network tab → WS filter | Verify Supabase realtime subscription is active for parent's notifications |
| Translation keys | Elements panel | Search for untranslated strings; look for raw key text in rendered DOM |
| Payment webhook | Not visible in browser | Must check Supabase Edge Function logs or Razorpay/Stripe dashboard webhook delivery logs |
| Local storage | Application tab → Local Storage | Check `i18nextLng` key for saved language; check Supabase auth tokens |

---

## 8. Code Review Checklist

### Correctness

- [ ] `app_role` ENUM correctly includes `"parent"` and all existing roles still function
- [ ] `parent_students` RLS policies correctly restrict parents to only linked children's data
- [ ] Parent cannot modify any student data (read-only access enforced at DB level)
- [ ] Notification triggers correctly insert parent notifications for linked parent accounts
- [ ] `useUserRole` returns `isParent: true` only when user has `parent` role
- [ ] i18n `t()` function used consistently — no raw strings left in UI components
- [ ] All translation files (`en.json`, `hi.json`, `mr.json`, `ta.json`) have identical key structures
- [ ] Language preference saved to `profiles.language` and loaded on login
- [ ] Razorpay webhook signature verification uses correct HMAC algorithm
- [ ] Stripe webhook signature verification uses raw body (not parsed JSON)
- [ ] Payment status transitions are correct: `pending` → `completed` or `failed`
- [ ] Enrollment is only created after payment confirmation (not on checkout initiation)
- [ ] AI tutor Edge Function reads `ANTHROPIC_API_KEY` from environment (never hardcoded)
- [ ] Chat session messages are correctly appended (not overwritten) in JSONB column
- [ ] Rate limiting works correctly (rejects after threshold, resets after time window)
- [ ] All new routes are wrapped in `ProtectedRoute`
- [ ] Parent routes redirect to login if unauthenticated

### Code Quality

- [ ] All new hooks follow existing patterns (`useQuery` with `queryKey`, `enabled` flag, error handling)
- [ ] All new pages follow existing layout patterns (heading + description + card grid)
- [ ] No hardcoded Supabase URLs or API keys in frontend code
- [ ] No `any` types used without explicit justification
- [ ] All Edge Functions follow the existing pattern from `admin-create-user` (CORS headers, auth verification, error handling)
- [ ] Consistent use of `sonner` toast for success/error messages
- [ ] React Query cache invalidation happens on all mutations
- [ ] All new components use shadcn/ui primitives (Card, Button, Badge, Table, Dialog, etc.)
- [ ] Icons imported from `lucide-react` consistently
- [ ] No unused imports or dead code
- [ ] All async functions have try/catch error handling

### UI/UX

- [ ] Parent dashboard clearly shows which child's data is being viewed
- [ ] Language selector provides visual feedback (flag/label for each language)
- [ ] Checkout page shows clear pricing information before payment
- [ ] Payment history shows clear status indicators (green = completed, red = failed, yellow = pending)
- [ ] AI chat interface has clear message bubbles with user/assistant distinction
- [ ] Loading states shown during AI response generation
- [ ] Empty states shown when no data available (no children linked, no payments, no chat sessions)
- [ ] All new pages are responsive (mobile-friendly at 375px width)
- [ ] Sidebar correctly highlights active parent/payment/tutor nav items
- [ ] Portal switching works correctly between student/teacher/admin/parent views

### Performance

- [ ] React Query `staleTime` set appropriately (5 min for roles, 1 min for dynamic data)
- [ ] Translation files are imported statically (not fetched via HTTP) for instant loading
- [ ] Razorpay script loaded lazily (only on Checkout page)
- [ ] AI chat does not refetch entire session history on every message
- [ ] Payment plans query uses `staleTime` (plans don't change frequently)
- [ ] Parent data queries are scoped to specific child (not fetching all students)
- [ ] No N+1 query patterns in parent dashboard (batch fetch all children data)

---

## 9. Security & Quality Audit

### Security Checks

| # | Check | Details | Status |
|---|-------|---------|--------|
| S1 | API keys never in frontend | `ANTHROPIC_API_KEY`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RAZORPAY_WEBHOOK_SECRET` only in Supabase Edge Function environment | **TODO** |
| S2 | Razorpay key ID is the only client-side key | `RAZORPAY_KEY_ID` (public key) can be in frontend; secret key must NOT be | **TODO** |
| S3 | Webhook signature verification | Both Razorpay and Stripe webhooks verify cryptographic signatures before processing | **TODO** |
| S4 | Parent RLS read-only | Parents can only SELECT — no INSERT, UPDATE, DELETE policies on student data tables | **TODO** |
| S5 | Parent-student link verification | `parent_students.verified` field exists; admin must explicitly link accounts | **TODO** |
| S6 | Edge Function auth verification | All Edge Functions verify JWT token and check caller's role before proceeding | **TODO** |
| S7 | Payment amount validation | Server-side (Edge Function) determines payment amount — never trust client-submitted amount | **TODO** |
| S8 | AI prompt injection prevention | System prompt clearly delineates user messages; student input is treated as user content only | **TODO** |
| S9 | Rate limiting on AI endpoint | Prevent abuse with per-user message limits (50/hour) | **TODO** |
| S10 | No PII in AI requests | Do not send student emails or full names to external AI API; use anonymized identifiers | **TODO** |
| S11 | Supabase service role key only in Edge Functions | Service role key (`SUPABASE_SERVICE_ROLE_KEY`) never exposed to client | **TODO** |
| S12 | CORS headers on Edge Functions | Restrict origins in production (not `*`); allow `*` only in development | **TODO** |
| S13 | Input validation on all Edge Functions | Validate request body fields (type, length, format) before processing | **TODO** |
| S14 | SQL injection prevention | All queries use Supabase client parameterized queries — no raw SQL string concatenation | **TODO** |
| S15 | XSS prevention in chat | AI tutor responses rendered as text, not `dangerouslySetInnerHTML`; if Markdown, use sanitized renderer | **TODO** |

### Quality Checks

| # | Check | Details | Status |
|---|-------|---------|--------|
| Q1 | TypeScript strict mode | No `@ts-ignore` or `@ts-nocheck` comments added | **TODO** |
| Q2 | Translation completeness | Every key in `en.json` exists in `hi.json`, `mr.json`, `ta.json` | **TODO** |
| Q3 | No console.log in production | Remove all `console.log` statements from committed code | **TODO** |
| Q4 | Consistent error handling | All mutations use `onError` with toast notification | **TODO** |
| Q5 | Accessible UI | All interactive elements have proper ARIA labels; language selector has `aria-label` | **TODO** |
| Q6 | No hardcoded colors | All colors use Tailwind/shadcn theme tokens (`text-primary`, `bg-muted`, etc.) | **TODO** |
| Q7 | Responsive design | All new pages tested at 375px, 768px, and 1280px widths | **TODO** |
| Q8 | Edge Function error responses | All error responses include meaningful messages and appropriate HTTP status codes | **TODO** |
| Q9 | Database indexes | Add indexes on `parent_students(parent_id)`, `parent_students(student_id)`, `payments(user_id)`, `chat_sessions(student_id)` | **TODO** |
| Q10 | Migration idempotency | Migrations use `IF NOT EXISTS` and `IF EXISTS` where appropriate | **TODO** |

### Audit Procedure

1. **Before merging F1:** Run `SELECT * FROM parent_students` as a parent user — should return only own links. Try `INSERT INTO submissions` as parent — should fail with RLS error.
2. **Before merging F3:** Switch language to Hindi and navigate every page — verify no English strings remain in UI (except course content which stays in teacher's language).
3. **Before merging F4:** Test complete payment flow: checkout → gateway → webhook → enrollment created. Verify payment with invalid signature is rejected. Verify amount matches server-side calculation.
4. **Before merging F5:** Send 51 messages in one hour — verify 51st is rejected. Check that AI responses do not contain student PII from system prompt.
5. **Cross-feature:** Verify parent can see child's payment history. Verify parent receives notification when child is graded. Verify AI tutor works in Hindi when language is set to Hindi.

---

## 10. Git & Push Strategy

### Branch Strategy

```
main
 └── feature/phase-6-platform-expansion
      ├── feature/phase-6-f3-i18n              (merge first — foundational)
      ├── feature/phase-6-f1-parent-portal     (merge second)
      ├── feature/phase-6-f4-payments          (merge third)
      ├── feature/phase-6-f5-ai-tutor          (merge fourth)
      └── feature/phase-6-f2-mobile-arch       (merge last — documentation only)
```

### Commit Plan

| # | Branch | Commit Message | Files Changed |
|---|--------|---------------|---------------|
| C1 | `feature/phase-6-f3-i18n` | `feat(db): add language column to profiles table` | `supabase/migrations/2026XXXX_phase6_i18n.sql` |
| C2 | `feature/phase-6-f3-i18n` | `feat(i18n): add react-i18next setup and English translations` | `package.json`, `src/lib/i18n.ts`, `src/locales/en.json`, `src/main.tsx` |
| C3 | `feature/phase-6-f3-i18n` | `feat(i18n): add Hindi, Marathi, Tamil translations` | `src/locales/hi.json`, `src/locales/mr.json`, `src/locales/ta.json` |
| C4 | `feature/phase-6-f3-i18n` | `feat(i18n): wrap all page and component strings with t()` | All `src/pages/*.tsx`, `src/components/*.tsx` |
| C5 | `feature/phase-6-f3-i18n` | `feat(i18n): add language selector to Profile page` | `src/pages/Profile.tsx` |
| C6 | `feature/phase-6-f3-i18n` | `feat(i18n): auto-load saved language on authentication` | `src/contexts/AuthContext.tsx` or `src/components/AppLayout.tsx` |
| C7 | `feature/phase-6-f3-i18n` | `test(i18n): add i18n configuration and translation tests` | `src/test/i18n.test.ts` |
| C8 | `feature/phase-6-f1-parent-portal` | `feat(db): add parent role and parent_students table with RLS` | `supabase/migrations/2026XXXX_phase6_parent_portal.sql` |
| C9 | `feature/phase-6-f1-parent-portal` | `feat(types): update Supabase types for parent portal` | `src/integrations/supabase/types.ts`, `src/hooks/useUserRole.ts` |
| C10 | `feature/phase-6-f1-parent-portal` | `feat(parent): add useParentStudents and useChildData hooks` | `src/hooks/useParentStudents.ts`, `src/hooks/useChildData.ts` |
| C11 | `feature/phase-6-f1-parent-portal` | `feat(parent): add ParentDashboard, ChildProgress, ParentMessages pages` | `src/pages/parent/ParentDashboard.tsx`, `src/pages/parent/ChildProgress.tsx`, `src/pages/parent/ParentMessages.tsx` |
| C12 | `feature/phase-6-f1-parent-portal` | `feat(parent): add parent routes and sidebar navigation` | `src/App.tsx`, `src/components/AppSidebar.tsx` |
| C13 | `feature/phase-6-f1-parent-portal` | `feat(admin): add parent account creation and parent-student linking` | `src/pages/admin/AdminUsers.tsx`, `supabase/functions/admin-create-user/index.ts` |
| C14 | `feature/phase-6-f1-parent-portal` | `test(parent): add parent portal hook and page tests` | `src/test/hooks/useParentStudents.test.ts`, `src/test/hooks/useChildData.test.ts`, `src/test/pages/ParentDashboard.test.tsx` |
| C15 | `feature/phase-6-f4-payments` | `feat(db): add payment_plans, payments, subscriptions tables and course pricing` | `supabase/migrations/2026XXXX_phase6_payments.sql` |
| C16 | `feature/phase-6-f4-payments` | `feat(payments): add Razorpay checkout and webhook Edge Functions` | `supabase/functions/razorpay-checkout/index.ts`, `supabase/functions/razorpay-webhook/index.ts` |
| C17 | `feature/phase-6-f4-payments` | `feat(payments): add Stripe checkout and webhook Edge Functions` | `supabase/functions/stripe-checkout/index.ts`, `supabase/functions/stripe-webhook/index.ts` |
| C18 | `feature/phase-6-f4-payments` | `feat(payments): add invoice generation Edge Function` | `supabase/functions/generate-invoice/index.ts` |
| C19 | `feature/phase-6-f4-payments` | `feat(payments): add Checkout, PaymentHistory, FeeDashboard pages` | `src/pages/Checkout.tsx`, `src/pages/PaymentHistory.tsx`, `src/pages/admin/FeeDashboard.tsx` |
| C20 | `feature/phase-6-f4-payments` | `feat(payments): add payment hooks, routes, and sidebar nav` | `src/hooks/usePaymentPlans.ts`, `src/hooks/usePaymentHistory.ts`, `src/hooks/useSubscription.ts`, `src/App.tsx`, `src/components/AppSidebar.tsx` |
| C21 | `feature/phase-6-f4-payments` | `feat(payments): update course enrollment flow for paid courses` | `src/pages/CourseDetail.tsx`, `src/pages/teacher/CreateCourse.tsx` |
| C22 | `feature/phase-6-f4-payments` | `test(payments): add payment hook and page tests` | `src/test/hooks/usePaymentPlans.test.ts`, `src/test/pages/Checkout.test.tsx` |
| C23 | `feature/phase-6-f5-ai-tutor` | `feat(db): add chat_sessions table with RLS` | `supabase/migrations/2026XXXX_phase6_ai_tutor.sql` |
| C24 | `feature/phase-6-f5-ai-tutor` | `feat(ai): add ai-tutor, ai-recommendations, ai-practice-questions Edge Functions` | `supabase/functions/ai-tutor/index.ts`, `supabase/functions/ai-recommendations/index.ts`, `supabase/functions/ai-practice-questions/index.ts`, `supabase/functions/ai-performance-insights/index.ts` |
| C25 | `feature/phase-6-f5-ai-tutor` | `feat(ai): add useAiChat and useAiRecommendations hooks` | `src/hooks/useAiChat.ts`, `src/hooks/useAiRecommendations.ts` |
| C26 | `feature/phase-6-f5-ai-tutor` | `feat(ai): add AiTutor page with chat interface` | `src/pages/AiTutor.tsx` |
| C27 | `feature/phase-6-f5-ai-tutor` | `feat(ai): add AiChatWidget and PracticeQuestions components` | `src/components/AiChatWidget.tsx`, `src/components/PracticeQuestions.tsx` |
| C28 | `feature/phase-6-f5-ai-tutor` | `feat(ai): embed AI features in LessonPage and dashboards` | `src/pages/LessonPage.tsx`, `src/pages/teacher/TeacherDashboard.tsx`, `src/App.tsx`, `src/components/AppSidebar.tsx` |
| C29 | `feature/phase-6-f5-ai-tutor` | `test(ai): add AI tutor hook and page tests` | `src/test/hooks/useAiChat.test.ts`, `src/test/pages/AiTutor.test.tsx` |
| C30 | `feature/phase-6-f2-mobile-arch` | `docs(mobile): add React Native mobile app architecture document` | `docs/mobile-architecture.md` |
| C31 | `feature/phase-6-f2-mobile-arch` | `feat(db): add device_tokens table for push notifications` | `supabase/migrations/2026XXXX_phase6_mobile_tokens.sql` |

### Push Commands

```bash
# Create and switch to main feature branch
git checkout -b feature/phase-6-platform-expansion

# Create sub-branches (from the feature branch)
git checkout -b feature/phase-6-f3-i18n

# After completing F3 work:
git push -u origin feature/phase-6-f3-i18n

# Merge F3 into main feature branch
git checkout feature/phase-6-platform-expansion
git merge feature/phase-6-f3-i18n

# Repeat for each feature branch...
git checkout -b feature/phase-6-f1-parent-portal
# ... work ...
git push -u origin feature/phase-6-f1-parent-portal

git checkout -b feature/phase-6-f4-payments
# ... work ...
git push -u origin feature/phase-6-f4-payments

git checkout -b feature/phase-6-f5-ai-tutor
# ... work ...
git push -u origin feature/phase-6-f5-ai-tutor

git checkout -b feature/phase-6-f2-mobile-arch
# ... work ...
git push -u origin feature/phase-6-f2-mobile-arch

# Final push of consolidated branch
git checkout feature/phase-6-platform-expansion
git merge feature/phase-6-f1-parent-portal
git merge feature/phase-6-f4-payments
git merge feature/phase-6-f5-ai-tutor
git merge feature/phase-6-f2-mobile-arch
git push -u origin feature/phase-6-platform-expansion
```

### PR Template

```markdown
## Phase 6: Parent Portal, Mobile App & Platform Expansion

### Summary
- **F1:** Parent/Guardian Portal — new `parent` role, parent-student linking, read-only child progress dashboard
- **F2:** Mobile App Architecture — architecture document, `device_tokens` table for push notifications
- **F3:** Multi-Language Support — `react-i18next` with English, Hindi, Marathi, Tamil; language preference in profile
- **F4:** Payment Integration — Razorpay + Stripe gateways, course pricing, checkout flow, webhook handling, admin fee dashboard
- **F5:** AI-Powered Tutoring — Claude API chatbot, practice questions, content recommendations, performance insights

### Database Changes
- `ALTER TYPE app_role ADD VALUE 'parent'`
- New tables: `parent_students`, `payment_plans`, `payments`, `subscriptions`, `chat_sessions`, `device_tokens`
- New columns: `profiles.language`, `courses.price`, `courses.currency`
- New RLS policies for parent read-only access, payment table access
- Updated notification triggers to include parent notifications

### New Dependencies
- `react-i18next` — React i18n bindings
- `i18next` — i18n core framework
- `i18next-browser-languagedetector` — auto-detect browser language

### New Edge Functions
- `razorpay-checkout` — Create Razorpay payment orders
- `razorpay-webhook` — Handle Razorpay payment callbacks
- `stripe-checkout` — Create Stripe checkout sessions
- `stripe-webhook` — Handle Stripe payment callbacks
- `generate-invoice` — Generate PDF invoices
- `ai-tutor` — Claude API chat proxy
- `ai-recommendations` — Student content recommendations
- `ai-practice-questions` — Generate practice questions from lessons
- `ai-performance-insights` — AI-generated performance summaries

### Environment Variables Required
```
RAZORPAY_KEY_ID=<public key for frontend>
RAZORPAY_KEY_SECRET=<secret, Edge Function only>
RAZORPAY_WEBHOOK_SECRET=<Edge Function only>
STRIPE_SECRET_KEY=<Edge Function only>
STRIPE_WEBHOOK_SECRET=<Edge Function only>
ANTHROPIC_API_KEY=<Edge Function only>
```

### Test Plan
- [ ] All unit tests pass (`npm run test`)
- [ ] Parent can view linked child's data (read-only)
- [ ] Parent cannot modify any student data
- [ ] Language switches correctly and persists across sessions
- [ ] All pages render correctly in Hindi/Marathi/Tamil
- [ ] Razorpay checkout → webhook → enrollment flow works end-to-end
- [ ] Stripe checkout → webhook → enrollment flow works end-to-end
- [ ] AI tutor responds with contextual answers
- [ ] Rate limiting blocks excessive AI requests
- [ ] All new pages are responsive
- [ ] Build succeeds without TypeScript errors (`npm run build`)
```

---

## 11. File Inventory

### New Files (38 files)

| # | File Path | Feature | Purpose |
|---|-----------|---------|---------|
| 1 | `src/pages/parent/ParentDashboard.tsx` | F1 | Parent overview page |
| 2 | `src/pages/parent/ChildProgress.tsx` | F1 | Child detail progress page |
| 3 | `src/pages/parent/ParentMessages.tsx` | F1 | Parent-teacher messaging |
| 4 | `src/hooks/useParentStudents.ts` | F1 | Fetch linked children |
| 5 | `src/hooks/useChildData.ts` | F1 | Fetch child data |
| 6 | `src/lib/i18n.ts` | F3 | i18next configuration |
| 7 | `src/locales/en.json` | F3 | English translations |
| 8 | `src/locales/hi.json` | F3 | Hindi translations |
| 9 | `src/locales/mr.json` | F3 | Marathi translations |
| 10 | `src/locales/ta.json` | F3 | Tamil translations |
| 11 | `src/pages/Checkout.tsx` | F4 | Payment checkout |
| 12 | `src/pages/PaymentHistory.tsx` | F4 | Payment history |
| 13 | `src/pages/admin/FeeDashboard.tsx` | F4 | Admin fee dashboard |
| 14 | `src/hooks/usePaymentPlans.ts` | F4 | Fetch payment plans |
| 15 | `src/hooks/usePaymentHistory.ts` | F4 | Fetch payment history |
| 16 | `src/hooks/useSubscription.ts` | F4 | Fetch subscription status |
| 17 | `src/pages/AiTutor.tsx` | F5 | AI chat page |
| 18 | `src/hooks/useAiChat.ts` | F5 | AI chat hook |
| 19 | `src/hooks/useAiRecommendations.ts` | F5 | Recommendations hook |
| 20 | `src/components/AiChatWidget.tsx` | F5 | Floating chat widget |
| 21 | `src/components/PracticeQuestions.tsx` | F5 | Practice question UI |
| 22 | `supabase/migrations/2026XXXX_phase6_parent_portal.sql` | F1 | Parent DB schema |
| 23 | `supabase/migrations/2026XXXX_phase6_i18n.sql` | F3 | Language column |
| 24 | `supabase/migrations/2026XXXX_phase6_payments.sql` | F4 | Payment tables |
| 25 | `supabase/migrations/2026XXXX_phase6_ai_tutor.sql` | F5 | Chat sessions table |
| 26 | `supabase/migrations/2026XXXX_phase6_mobile_tokens.sql` | F2 | Device tokens table |
| 27 | `supabase/functions/razorpay-checkout/index.ts` | F4 | Razorpay order creation |
| 28 | `supabase/functions/razorpay-webhook/index.ts` | F4 | Razorpay webhook handler |
| 29 | `supabase/functions/stripe-checkout/index.ts` | F4 | Stripe session creation |
| 30 | `supabase/functions/stripe-webhook/index.ts` | F4 | Stripe webhook handler |
| 31 | `supabase/functions/generate-invoice/index.ts` | F4 | PDF invoice generation |
| 32 | `supabase/functions/ai-tutor/index.ts` | F5 | Claude API proxy |
| 33 | `supabase/functions/ai-recommendations/index.ts` | F5 | Content recommendations |
| 34 | `supabase/functions/ai-practice-questions/index.ts` | F5 | Practice question generation |
| 35 | `supabase/functions/ai-performance-insights/index.ts` | F5 | Performance summaries |
| 36 | `docs/mobile-architecture.md` | F2 | Mobile architecture doc |
| 37 | `src/test/hooks/useParentStudents.test.ts` | F1 | Hook tests |
| 38 | `src/test/hooks/useChildData.test.ts` | F1 | Hook tests |
| 39 | `src/test/hooks/useAiChat.test.ts` | F5 | Hook tests |
| 40 | `src/test/hooks/usePaymentPlans.test.ts` | F4 | Hook tests |
| 41 | `src/test/i18n.test.ts` | F3 | i18n tests |
| 42 | `src/test/pages/ParentDashboard.test.tsx` | F1 | Page tests |
| 43 | `src/test/pages/AiTutor.test.tsx` | F5 | Page tests |
| 44 | `src/test/pages/Checkout.test.tsx` | F4 | Page tests |

### Modified Files (32 files)

| # | File Path | Features | Changes Summary |
|---|-----------|----------|----------------|
| 1 | `src/hooks/useUserRole.ts` | F1 | Add `"parent"` to `AppRole`; add `isParent` |
| 2 | `src/components/AppSidebar.tsx` | F1, F3, F4, F5 | Add `parentNav`; add payment/tutor nav; `t()` wrapping |
| 3 | `src/components/AppLayout.tsx` | F3 | `t()` wrapping |
| 4 | `src/App.tsx` | F1, F4, F5 | Add parent, payment, tutor routes |
| 5 | `src/main.tsx` | F3 | Import i18n config |
| 6 | `src/pages/Profile.tsx` | F3 | Language selector; `t()` wrapping |
| 7 | `src/pages/Dashboard.tsx` | F3 | `t()` wrapping |
| 8 | `src/pages/Courses.tsx` | F3, F4 | `t()` wrapping; show course price |
| 9 | `src/pages/CourseDetail.tsx` | F3, F4 | `t()` wrapping; paid enrollment flow |
| 10 | `src/pages/Grades.tsx` | F3 | `t()` wrapping |
| 11 | `src/pages/LiveClasses.tsx` | F3 | `t()` wrapping |
| 12 | `src/pages/Notifications.tsx` | F3 | `t()` wrapping |
| 13 | `src/pages/Calendar.tsx` | F3 | `t()` wrapping |
| 14 | `src/pages/Timetable.tsx` | F3 | `t()` wrapping |
| 15 | `src/pages/LessonPage.tsx` | F3, F5 | `t()` wrapping; AI chat widget + practice questions |
| 16 | `src/pages/AssignmentPage.tsx` | F3 | `t()` wrapping |
| 17 | `src/pages/Login.tsx` | F3 | `t()` wrapping |
| 18 | `src/pages/Register.tsx` | F3 | `t()` wrapping |
| 19 | `src/pages/ForgotPassword.tsx` | F3 | `t()` wrapping |
| 20 | `src/pages/ResetPassword.tsx` | F3 | `t()` wrapping |
| 21 | `src/pages/teacher/TeacherDashboard.tsx` | F3, F5 | `t()` wrapping; AI insights card |
| 22 | `src/pages/teacher/TeacherCourses.tsx` | F3 | `t()` wrapping |
| 23 | `src/pages/teacher/CreateCourse.tsx` | F3, F4 | `t()` wrapping; price/currency fields |
| 24 | `src/pages/teacher/TeacherCourseDetail.tsx` | F3 | `t()` wrapping |
| 25 | `src/pages/teacher/TeacherSubmissions.tsx` | F3 | `t()` wrapping |
| 26 | `src/pages/teacher/AssignmentSubmissions.tsx` | F3 | `t()` wrapping |
| 27 | `src/pages/teacher/TeacherLiveClasses.tsx` | F3 | `t()` wrapping |
| 28 | `src/pages/teacher/TeacherStudents.tsx` | F3 | `t()` wrapping |
| 29 | `src/pages/admin/AdminDashboard.tsx` | F3 | `t()` wrapping |
| 30 | `src/pages/admin/AdminUsers.tsx` | F1, F3 | Parent role/linking; `t()` wrapping |
| 31 | `src/pages/admin/AdminCourses.tsx` | F3 | `t()` wrapping |
| 32 | `src/components/EnrolledCourseCard.tsx` | F3 | `t()` wrapping |
| 33 | `src/integrations/supabase/types.ts` | F1, F3, F4, F5 | All new table types + updated types |
| 34 | `supabase/functions/admin-create-user/index.ts` | F1 | Accept `parent` role |
| 35 | `package.json` | F3 | i18n dependencies |

### Infrastructure Files

| File | Purpose |
|------|---------|
| `supabase/config.toml` | May need Edge Function configuration updates |
| `vite.config.ts` | No changes needed |
| `vitest.config.ts` | No changes needed |
| `tsconfig.app.json` | No changes needed |
| `tailwind.config.ts` | No changes needed (unless adding RTL plugin) |

### Reference Files (Read-Only — Used as Patterns)

| File | Used As Pattern For |
|------|-------------------|
| `src/hooks/useUserRole.ts` | Hook structure, React Query pattern |
| `src/hooks/useCourseProgress.ts` | Data fetching hook pattern |
| `src/hooks/useRealtimeNotifications.ts` | Realtime subscription pattern |
| `src/pages/Dashboard.tsx` | Page layout, card grid, data queries |
| `src/pages/admin/AdminUsers.tsx` | Admin CRUD UI, dialogs, tables, mutations |
| `src/components/AppSidebar.tsx` | Navigation structure, role-based rendering |
| `supabase/functions/admin-create-user/index.ts` | Edge Function pattern (CORS, auth, service role) |
| `supabase/migrations/20260309031013_*.sql` | Migration pattern (table + RLS policies) |
| `src/test/example.test.ts` | Test file structure |

---

## 12. Verification Checklist

### F1: Parent/Guardian Portal
- [ ] `app_role` ENUM includes `"parent"` value
- [ ] `parent_students` table exists with correct columns and constraints
- [ ] RLS policies allow parent read-only access to linked child's enrollments
- [ ] RLS policies allow parent read-only access to linked child's submissions
- [ ] RLS policies allow parent read-only access to linked child's lesson_progress
- [ ] RLS policies allow parent read-only access to linked child's notifications
- [ ] RLS policies prevent parent from INSERT/UPDATE/DELETE on student data
- [ ] `useUserRole` returns `isParent: true` for parent users
- [ ] `useParentStudents` hook returns linked children
- [ ] `useChildData` hook returns child's enrollments, grades, progress
- [ ] `ParentDashboard.tsx` renders correctly with linked children
- [ ] `ParentDashboard.tsx` shows empty state when no children linked
- [ ] `ChildProgress.tsx` shows course progress, grades, upcoming items
- [ ] `ParentMessages.tsx` allows messaging child's teachers
- [ ] Parent sidebar nav shows correct items
- [ ] Portal switching works: Student <-> Parent <-> Admin
- [ ] Admin can create parent accounts
- [ ] Admin can link parent to student
- [ ] Admin can unlink parent from student
- [ ] Parent notification triggers fire when child gets graded
- [ ] Parent notification triggers fire when child gets new assignment
- [ ] Routes `/parent`, `/parent/child/:studentId`, `/parent/messages` work

### F2: Mobile App Architecture
- [ ] `docs/mobile-architecture.md` document is complete
- [ ] Architecture document covers: tech stack, directory structure, shared code strategy
- [ ] Architecture document covers: push notification flow
- [ ] Architecture document covers: offline caching strategy
- [ ] Architecture document covers: camera submission flow
- [ ] Architecture document covers: deep linking specification
- [ ] Architecture document covers: screen inventory
- [ ] `device_tokens` table migration is ready
- [ ] `device_tokens` RLS policies are correct

### F3: Multi-Language Support
- [ ] `react-i18next`, `i18next`, `i18next-browser-languagedetector` installed
- [ ] `src/lib/i18n.ts` initializes correctly with language detector
- [ ] `src/locales/en.json` contains all UI strings
- [ ] `src/locales/hi.json` contains all translated strings
- [ ] `src/locales/mr.json` contains all translated strings
- [ ] `src/locales/ta.json` contains all translated strings
- [ ] All four locale files have identical key structures
- [ ] `profiles.language` column exists in database
- [ ] Language selector on Profile page works and saves preference
- [ ] Language preference loads on authentication
- [ ] `Dashboard.tsx` — all strings use `t()`
- [ ] `Courses.tsx` — all strings use `t()`
- [ ] `CourseDetail.tsx` — all strings use `t()`
- [ ] `Grades.tsx` — all strings use `t()`
- [ ] `LiveClasses.tsx` — all strings use `t()`
- [ ] `Notifications.tsx` — all strings use `t()`
- [ ] `Profile.tsx` — all strings use `t()`
- [ ] `Calendar.tsx` — all strings use `t()`
- [ ] `Timetable.tsx` — all strings use `t()`
- [ ] `LessonPage.tsx` — all strings use `t()`
- [ ] `AssignmentPage.tsx` — all strings use `t()`
- [ ] `Login.tsx` — all strings use `t()`
- [ ] `Register.tsx` — all strings use `t()`
- [ ] `ForgotPassword.tsx` — all strings use `t()`
- [ ] `ResetPassword.tsx` — all strings use `t()`
- [ ] `AppSidebar.tsx` — all strings use `t()`
- [ ] `AppLayout.tsx` — all strings use `t()`
- [ ] All teacher pages — all strings use `t()`
- [ ] All admin pages — all strings use `t()`
- [ ] Switching to Hindi renders all UI text in Hindi
- [ ] Course content remains in teacher's language (not translated)

### F4: Payment Integration
- [ ] `payment_plans` table exists with correct schema
- [ ] `payments` table exists with correct schema
- [ ] `subscriptions` table exists with correct schema
- [ ] `courses.price` and `courses.currency` columns exist
- [ ] RLS policies prevent direct client inserts to `payments`
- [ ] `razorpay-checkout` Edge Function creates order successfully
- [ ] `razorpay-webhook` Edge Function verifies signature correctly
- [ ] `razorpay-webhook` inserts payment record on success
- [ ] `razorpay-webhook` creates enrollment for course payments
- [ ] `stripe-checkout` Edge Function creates session successfully
- [ ] `stripe-webhook` Edge Function verifies signature correctly
- [ ] `stripe-webhook` inserts payment record on success
- [ ] `stripe-webhook` creates enrollment for course payments
- [ ] `generate-invoice` Edge Function produces PDF
- [ ] `Checkout.tsx` renders plan details and gateway selection
- [ ] Razorpay inline checkout opens and processes payment
- [ ] Stripe checkout redirects to Stripe and returns
- [ ] `PaymentHistory.tsx` shows payment records with correct data
- [ ] `FeeDashboard.tsx` shows revenue charts and stats
- [ ] Free courses (`price = 0`) use normal enrollment flow
- [ ] Paid courses redirect to checkout before enrollment
- [ ] `CreateCourse.tsx` has price and currency fields
- [ ] Routes `/checkout/:planId`, `/payments`, `/admin/fees` work
- [ ] Sidebar shows "Payments" for students, "Fees" for admin
- [ ] Environment variables documented and not hardcoded

### F5: AI-Powered Tutoring
- [ ] `chat_sessions` table exists with correct schema
- [ ] RLS policies allow students to CRUD own sessions
- [ ] `ai-tutor` Edge Function calls Claude API successfully
- [ ] `ai-tutor` Edge Function reads API key from environment
- [ ] `ai-tutor` Edge Function implements rate limiting (50 messages/hour)
- [ ] `ai-recommendations` Edge Function returns study suggestions
- [ ] `ai-practice-questions` Edge Function generates questions from lesson content
- [ ] `ai-performance-insights` Edge Function generates summary text
- [ ] `useAiChat` hook sends messages and receives responses
- [ ] `useAiChat` hook persists sessions to database
- [ ] `AiTutor.tsx` renders chat interface with session sidebar
- [ ] `AiTutor.tsx` shows loading state during AI response
- [ ] `AiChatWidget.tsx` toggles open/closed on lesson pages
- [ ] `PracticeQuestions.tsx` generates and displays questions
- [ ] Teacher dashboard shows AI insights card
- [ ] Parent dashboard shows AI insights card for each child
- [ ] Route `/tutor` works
- [ ] Sidebar shows "AI Tutor" for students
- [ ] No student PII sent to external AI API
- [ ] Token usage tracked in session metadata

### Tests
- [ ] `npm run test` passes with all new tests
- [ ] `npm run build` succeeds without TypeScript errors
- [ ] `npm run lint` passes without new warnings
- [ ] All hook tests mock Supabase client correctly
- [ ] All page tests render without errors
- [ ] i18n tests verify key structure consistency

### Git
- [ ] All changes committed with descriptive messages
- [ ] No secrets or API keys in committed code
- [ ] No `console.log` statements in committed code
- [ ] Branch pushed to origin
- [ ] PR created with complete description

---

### Critical Files for Implementation
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/integrations/supabase/types.ts` -- central type definitions that must be updated for all five features (new tables, updated enums, new columns)
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/App.tsx` -- routing hub where all new routes (parent, payment, tutor) must be registered
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/components/AppSidebar.tsx` -- navigation structure that must accommodate parent nav, payment nav, and AI tutor nav
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/hooks/useUserRole.ts` -- role system that must be extended with the `parent` role
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/supabase/functions/admin-create-user/index.ts` -- Edge Function pattern to follow for all new Edge Functions (payments, AI tutor)