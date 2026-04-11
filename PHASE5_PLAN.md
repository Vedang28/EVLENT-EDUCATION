# Phase 5 Implementation Plan — EVLENT Education

**Project:** EVLENT Education LMS
**Phase:** 5 — Communication, Analytics & Reporting
**GitHub:** https://github.com/Vedang28/EVLENT-EDUCATION
**Author:** [@Vedang28](https://github.com/Vedang28)
**Date:** 2026-04-11
**Workflow:** Run `/workflow Complete Phase 5` to execute this plan end-to-end

---

## Table of Contents

1. [Phase 5 Overview](#1-phase-5-overview)
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

## 1. Phase 5 Overview

Phase 5 adds nine features spanning communication tools, analytics dashboards, and reporting capabilities:

| # | Feature | Description |
|---|---------|-------------|
| F1 | **Discussion Forums** | Per-course threaded discussion board with pinning, search, and teacher moderation |
| F2 | **In-Class Chat** | Real-time chat panel on live class sessions via Supabase Realtime |
| F3 | **Announcement System** | Teacher announcements per course with notification trigger and student dashboard display |
| F4 | **Direct Messaging** | 1-to-1 real-time messaging between users with read receipts and conversations sidebar |
| F5 | **Advanced Analytics Dashboard** | Progress trends, engagement heatmaps, subject-wise performance, platform health metrics |
| F6 | **Student Progress Reports** | Per-student detailed view with lesson completion %, scores, attendance, engagement |
| F7 | **Teacher Performance Metrics** | Grading turnaround, course activity frequency, submission/completion rates |
| F8 | **Attendance Tracking** | Automated + manual attendance per live class with reports and student profile integration |
| F9 | **Report Cards & Bulk User Import** | PDF report card generation with grading scales + CSV bulk user import with validation |

**Dependencies between features:**
- F1 (forums) and F2 (chat) are independent of each other
- F3 (announcements) is independent but adds a new DB trigger to the notifications system from Phase 3
- F4 (messaging) is independent but complex (two new tables, real-time subscriptions)
- F5 (analytics) depends on existing data from Phases 1-4 (enrollments, lesson_progress, submissions, live_classes)
- F6 (progress reports) depends on F5 analytics hooks for data aggregation
- F7 (teacher metrics) depends on existing submission/grading data from Phases 1-4
- F8 (attendance) requires live class infrastructure from Phase 2 (live_classes table)
- F9 (report cards) depends on F6 (progress data) + F8 (attendance data)

**Recommended implementation order:** F1 → F2 → F3 → F8 → F4 → F5 → F6 → F7 → F9

---

## 2. Current Status

| Feature | Status | What's Done | What Remains |
|---------|--------|-------------|--------------|
| **F1: Discussion Forums** | **NOT started** | — | Full implementation: DB table, RLS, page, components, hook |
| **F2: In-Class Chat** | **NOT started** | — | Full implementation: DB table, realtime channel, chat component, hook |
| **F3: Announcement System** | **NOT started** | — | Full implementation: DB table, trigger, teacher UI, student UI |
| **F4: Direct Messaging** | **NOT started** | — | Full implementation: 2 DB tables, realtime, pages, hooks |
| **F5: Advanced Analytics Dashboard** | **NOT started** | AdminDashboard has basic stats/charts | Full analytics pages for all 3 roles with Recharts visualizations |
| **F6: Student Progress Reports** | **NOT started** | — | Full implementation: teacher page, data aggregation |
| **F7: Teacher Performance Metrics** | **NOT started** | — | Full implementation: admin page, metric calculations |
| **F8: Attendance Tracking** | **NOT started** | — | Full implementation: DB table, tracking logic, manager component, hook |
| **F9: Report Cards & Bulk Import** | **NOT started** | — | Full implementation: PDF generation, CSV import, 2 admin pages |

---

## 3. Features & Subtasks Breakdown

### F1: Discussion Forums

| # | Subtask | File | Status |
|---|---------|------|--------|
| F1.1 | Create `forum_posts` table migration (id, course_id, author_id, parent_id, title, body, pinned, created_at) | `supabase/migrations/20260411_phase5_forum_posts.sql` | **TODO** |
| F1.2 | Add RLS policies: enrolled students + course teacher read/write; teachers pin/delete; admins all | `supabase/migrations/20260411_phase5_forum_posts.sql` | **TODO** |
| F1.3 | Enable Supabase Realtime for `forum_posts` | `supabase/migrations/20260411_phase5_forum_posts.sql` | **TODO** |
| F1.4 | Update `src/integrations/supabase/types.ts` with `forum_posts` table types | `src/integrations/supabase/types.ts` | **TODO** |
| F1.5 | Create `useForumPosts` hook (fetch posts by course_id, create post, delete post, toggle pin) | `src/hooks/useForumPosts.ts` | **TODO** |
| F1.6 | Create `ForumPost` component (display post with author, time, body, pin badge, reply count) | `src/components/ForumPost.tsx` | **TODO** |
| F1.7 | Create `ForumReplyForm` component (textarea + submit button for threaded replies) | `src/components/ForumReplyForm.tsx` | **TODO** |
| F1.8 | Create `ForumPage` page (post list, create new post dialog, search input, threaded view) | `src/pages/ForumPage.tsx` | **TODO** |
| F1.9 | Add `/courses/:courseId/forum` route to `App.tsx` | `src/App.tsx` | **TODO** |
| F1.10 | Add "Discussion" tab to `CourseDetail.tsx` Tabs component | `src/pages/CourseDetail.tsx` | **TODO** |
| F1.11 | Add forum search filtering (filter posts by title/body text match) | `src/pages/ForumPage.tsx` | **TODO** |
| F1.12 | Add teacher pin/delete controls to ForumPost component | `src/components/ForumPost.tsx` | **TODO** |

### F2: In-Class Chat

| # | Subtask | File | Status |
|---|---------|------|--------|
| F2.1 | Create `chat_messages` table migration (id, live_class_id, sender_id, message, sent_at) | `supabase/migrations/20260411_phase5_chat_messages.sql` | **TODO** |
| F2.2 | Add RLS policies: enrolled students + teacher of the course can read/write; teachers can delete | `supabase/migrations/20260411_phase5_chat_messages.sql` | **TODO** |
| F2.3 | Enable Supabase Realtime for `chat_messages` | `supabase/migrations/20260411_phase5_chat_messages.sql` | **TODO** |
| F2.4 | Update `src/integrations/supabase/types.ts` with `chat_messages` table types | `src/integrations/supabase/types.ts` | **TODO** |
| F2.5 | Create `useLiveClassChat` hook (subscribe to realtime channel, fetch history, send message, delete message) | `src/hooks/useLiveClassChat.ts` | **TODO** |
| F2.6 | Create `LiveClassChat` component (message list with ScrollArea, input form, sender names, timestamps) | `src/components/LiveClassChat.tsx` | **TODO** |
| F2.7 | Integrate `LiveClassChat` into `LiveClasses.tsx` upcoming class cards (expandable chat panel) | `src/pages/LiveClasses.tsx` | **TODO** |
| F2.8 | Integrate `LiveClassChat` into `TeacherLiveClasses.tsx` (chat panel with delete moderation) | `src/pages/teacher/TeacherLiveClasses.tsx` | **TODO** |
| F2.9 | Auto-scroll to latest message on new message arrival | `src/components/LiveClassChat.tsx` | **TODO** |

### F3: Announcement System

| # | Subtask | File | Status |
|---|---------|------|--------|
| F3.1 | Create `announcements` table migration (id, course_id, teacher_id, title, body, pinned, created_at) | `supabase/migrations/20260411_phase5_announcements.sql` | **TODO** |
| F3.2 | Add RLS policies: enrolled students + course teacher can read; teachers can write for own courses; admins all | `supabase/migrations/20260411_phase5_announcements.sql` | **TODO** |
| F3.3 | Create `notify_on_announcement()` trigger function to insert notifications for all enrolled students | `supabase/migrations/20260411_phase5_announcements.sql` | **TODO** |
| F3.4 | Update `src/integrations/supabase/types.ts` with `announcements` table types | `src/integrations/supabase/types.ts` | **TODO** |
| F3.5 | Create `AnnouncementManager` teacher component (create, edit, pin, delete announcements) | `src/components/teacher/AnnouncementManager.tsx` | **TODO** |
| F3.6 | Create `AnnouncementCard` component (display title, body, pin badge, course name, timestamp) | `src/components/AnnouncementCard.tsx` | **TODO** |
| F3.7 | Integrate `AnnouncementManager` into `TeacherCourseDetail.tsx` as a new tab | `src/pages/teacher/TeacherCourseDetail.tsx` | **TODO** |
| F3.8 | Add announcements section to student `Dashboard.tsx` (prominent card showing latest announcements) | `src/pages/Dashboard.tsx` | **TODO** |
| F3.9 | Add "Announcements" tab to student `CourseDetail.tsx` | `src/pages/CourseDetail.tsx` | **TODO** |

### F4: Direct Messaging

| # | Subtask | File | Status |
|---|---------|------|--------|
| F4.1 | Create `conversations` table migration (id, participant1_id, participant2_id, created_at) | `supabase/migrations/20260411_phase5_direct_messages.sql` | **TODO** |
| F4.2 | Create `direct_messages` table migration (id, conversation_id, sender_id, message, is_read, sent_at) | `supabase/migrations/20260411_phase5_direct_messages.sql` | **TODO** |
| F4.3 | Add RLS policies: only participants can read/write their conversations and messages | `supabase/migrations/20260411_phase5_direct_messages.sql` | **TODO** |
| F4.4 | Enable Supabase Realtime for `direct_messages` | `supabase/migrations/20260411_phase5_direct_messages.sql` | **TODO** |
| F4.5 | Update `src/integrations/supabase/types.ts` with `conversations` and `direct_messages` types | `src/integrations/supabase/types.ts` | **TODO** |
| F4.6 | Create `useConversations` hook (list conversations for current user, create new conversation, get unread counts) | `src/hooks/useConversations.ts` | **TODO** |
| F4.7 | Create `useDirectMessages` hook (fetch messages for conversation, send message, mark as read, realtime subscription) | `src/hooks/useDirectMessages.ts` | **TODO** |
| F4.8 | Create `Messages` page (conversations sidebar + message thread view + new conversation dialog) | `src/pages/Messages.tsx` | **TODO** |
| F4.9 | Add `/messages` and `/messages/:conversationId` routes to `App.tsx` | `src/App.tsx` | **TODO** |
| F4.10 | Add "Messages" link to `studentNav`, `teacherNav`, and `adminNav` in `AppSidebar.tsx` | `src/components/AppSidebar.tsx` | **TODO** |
| F4.11 | Implement read receipts: mark messages as read when conversation is opened | `src/hooks/useDirectMessages.ts` | **TODO** |
| F4.12 | Show unread message count badge in sidebar nav | `src/components/AppSidebar.tsx` | **TODO** |

### F5: Advanced Analytics Dashboard

| # | Subtask | File | Status |
|---|---------|------|--------|
| F5.1 | Create `useStudentAnalytics` hook (lesson completion trends, assignment score trends, engagement data) | `src/hooks/useStudentAnalytics.ts` | **TODO** |
| F5.2 | Create `useTeacherAnalytics` hook (student performance per course, submission rates, class participation) | `src/hooks/useTeacherAnalytics.ts` | **TODO** |
| F5.3 | Create `useAdminAnalytics` hook (platform health: active users, daily sign-ins, course activity) | `src/hooks/useAdminAnalytics.ts` | **TODO** |
| F5.4 | Create `StudentAnalytics` page (line charts for lesson completion over time, assignment scores over time, engagement heatmap) | `src/pages/analytics/StudentAnalytics.tsx` | **TODO** |
| F5.5 | Create `TeacherAnalytics` page (bar charts for subject-wise performance, submission rates per course) | `src/pages/analytics/TeacherAnalytics.tsx` | **TODO** |
| F5.6 | Create `AdminAnalytics` page (platform health metrics cards, active users line chart, course activity bar chart) | `src/pages/analytics/AdminAnalytics.tsx` | **TODO** |
| F5.7 | Build engagement heatmap component (day-of-week x hour grid using Recharts or custom CSS grid) | `src/components/analytics/EngagementHeatmap.tsx` | **TODO** |
| F5.8 | Add `/analytics` route for students, `/teacher/analytics` for teachers, `/admin/analytics` for admins | `src/App.tsx` | **TODO** |
| F5.9 | Add "Analytics" link to all three nav arrays in `AppSidebar.tsx` | `src/components/AppSidebar.tsx` | **TODO** |

### F6: Student Progress Reports

| # | Subtask | File | Status |
|---|---------|------|--------|
| F6.1 | Create `useStudentProgressReport` hook (aggregate lesson completion %, assignment scores with trends, attendance %, engagement metrics for a specific student) | `src/hooks/useStudentProgressReport.ts` | **TODO** |
| F6.2 | Create `StudentProgressReport` page (summary cards, progress charts, assignment history table, attendance summary) | `src/pages/teacher/StudentProgressReport.tsx` | **TODO** |
| F6.3 | Add `/teacher/students/:studentId/report` route to `App.tsx` | `src/App.tsx` | **TODO** |
| F6.4 | Add "View Report" link to each student row in `TeacherStudents.tsx` | `src/pages/teacher/TeacherStudents.tsx` | **TODO** |
| F6.5 | Add print/export button to `StudentProgressReport` page | `src/pages/teacher/StudentProgressReport.tsx` | **TODO** |

### F7: Teacher Performance Metrics

| # | Subtask | File | Status |
|---|---------|------|--------|
| F7.1 | Create `useTeacherMetrics` hook (grading turnaround time, course activity frequency, submission/completion rates per course) | `src/hooks/useTeacherMetrics.ts` | **TODO** |
| F7.2 | Create `TeacherMetrics` page (metric cards, turnaround time chart, course activity timeline, completion rate bar chart) | `src/pages/admin/TeacherMetrics.tsx` | **TODO** |
| F7.3 | Add `/admin/teachers/:teacherId/metrics` route to `App.tsx` | `src/App.tsx` | **TODO** |
| F7.4 | Add "View Metrics" link to teacher rows in `AdminUsers.tsx` (filter by teacher role) | `src/pages/admin/AdminUsers.tsx` | **TODO** |

### F8: Attendance Tracking

| # | Subtask | File | Status |
|---|---------|------|--------|
| F8.1 | Create `attendance` table migration (id, live_class_id, student_id, joined_at, left_at, duration_minutes) | `supabase/migrations/20260411_phase5_attendance.sql` | **TODO** |
| F8.2 | Add RLS policies: students can read own attendance; teachers can read/write for their courses; admins can read all | `supabase/migrations/20260411_phase5_attendance.sql` | **TODO** |
| F8.3 | Update `src/integrations/supabase/types.ts` with `attendance` table types | `src/integrations/supabase/types.ts` | **TODO** |
| F8.4 | Create `useAttendance` hook (fetch attendance by class/student/course, record join/leave, manual override) | `src/hooks/useAttendance.ts` | **TODO** |
| F8.5 | Create `AttendanceManager` teacher component (class attendance list, manual check-in/out, duration display) | `src/components/teacher/AttendanceManager.tsx` | **TODO** |
| F8.6 | Integrate `AttendanceManager` into `TeacherLiveClasses.tsx` (per-class attendance management) | `src/pages/teacher/TeacherLiveClasses.tsx` | **TODO** |
| F8.7 | Add attendance percentage to student profile (query attendance across all classes) | `src/pages/Profile.tsx` | **TODO** |
| F8.8 | Create attendance report view (filter by course, student, time period) | `src/components/teacher/AttendanceManager.tsx` | **TODO** |

### F9: Report Cards & Bulk User Import

| # | Subtask | File | Status |
|---|---------|------|--------|
| F9.1 | Install `jspdf` dependency for PDF generation | `package.json` | **TODO** |
| F9.2 | Create `useReportCardData` hook (aggregate all student data: courses, grades, attendance, teacher remarks) | `src/hooks/useReportCardData.ts` | **TODO** |
| F9.3 | Create `ReportCards` admin page (student selector, grading scale config, preview, download/print) | `src/pages/admin/ReportCards.tsx` | **TODO** |
| F9.4 | Build PDF generation utility (configurable grading scales: percentage, letter grade, GPA; subject-wise breakdown) | `src/lib/generateReportCard.ts` | **TODO** |
| F9.5 | Create `BulkImport` admin page (CSV upload dropzone, column mapping UI, validation preview, duplicate detection, import execution) | `src/pages/admin/BulkImport.tsx` | **TODO** |
| F9.6 | Build CSV parser utility (parse CSV, validate columns, detect duplicates by email) | `src/lib/csvParser.ts` | **TODO** |
| F9.7 | Add `/admin/report-cards` and `/admin/bulk-import` routes to `App.tsx` | `src/App.tsx` | **TODO** |
| F9.8 | Add "Report Cards" and "Bulk Import" links to `adminNav` in `AppSidebar.tsx` | `src/components/AppSidebar.tsx` | **TODO** |

---

## 4. Scaffolding Requirements

### 4.1 New Files to Create

| File | Type | Purpose |
|------|------|---------|
| `supabase/migrations/20260411_phase5_forum_posts.sql` | Migration | forum_posts table + RLS + realtime |
| `supabase/migrations/20260411_phase5_chat_messages.sql` | Migration | chat_messages table + RLS + realtime |
| `supabase/migrations/20260411_phase5_announcements.sql` | Migration | announcements table + RLS + notification trigger |
| `supabase/migrations/20260411_phase5_direct_messages.sql` | Migration | conversations + direct_messages tables + RLS + realtime |
| `supabase/migrations/20260411_phase5_attendance.sql` | Migration | attendance table + RLS |
| `src/hooks/useForumPosts.ts` | Hook | Forum CRUD + search |
| `src/hooks/useLiveClassChat.ts` | Hook | Realtime chat subscription + history |
| `src/hooks/useConversations.ts` | Hook | Conversations list + create |
| `src/hooks/useDirectMessages.ts` | Hook | DM send/receive/read with realtime |
| `src/hooks/useStudentAnalytics.ts` | Hook | Student progress/engagement data aggregation |
| `src/hooks/useTeacherAnalytics.ts` | Hook | Teacher analytics data aggregation |
| `src/hooks/useAdminAnalytics.ts` | Hook | Platform health metrics aggregation |
| `src/hooks/useStudentProgressReport.ts` | Hook | Per-student report data aggregation |
| `src/hooks/useTeacherMetrics.ts` | Hook | Teacher performance metrics |
| `src/hooks/useAttendance.ts` | Hook | Attendance tracking CRUD |
| `src/hooks/useReportCardData.ts` | Hook | Report card data aggregation |
| `src/pages/ForumPage.tsx` | Page | Per-course discussion forum |
| `src/pages/Messages.tsx` | Page | Direct messaging with conversations sidebar |
| `src/pages/analytics/StudentAnalytics.tsx` | Page | Student analytics dashboard |
| `src/pages/analytics/TeacherAnalytics.tsx` | Page | Teacher analytics dashboard |
| `src/pages/analytics/AdminAnalytics.tsx` | Page | Admin analytics dashboard |
| `src/pages/teacher/StudentProgressReport.tsx` | Page | Per-student detailed report |
| `src/pages/admin/TeacherMetrics.tsx` | Page | Teacher performance metrics |
| `src/pages/admin/ReportCards.tsx` | Page | Report card generation |
| `src/pages/admin/BulkImport.tsx` | Page | CSV bulk user import |
| `src/components/ForumPost.tsx` | Component | Forum post display with threading |
| `src/components/ForumReplyForm.tsx` | Component | Reply form for forum threads |
| `src/components/LiveClassChat.tsx` | Component | Realtime chat panel |
| `src/components/AnnouncementCard.tsx` | Component | Announcement display card |
| `src/components/teacher/AnnouncementManager.tsx` | Component | Teacher announcement CRUD |
| `src/components/teacher/AttendanceManager.tsx` | Component | Attendance tracking UI |
| `src/components/analytics/EngagementHeatmap.tsx` | Component | Heatmap visualization |
| `src/lib/generateReportCard.ts` | Utility | PDF report card generation |
| `src/lib/csvParser.ts` | Utility | CSV parsing and validation |
| `src/test/hooks/useForumPosts.test.ts` | Test | Forum hook tests |
| `src/test/hooks/useLiveClassChat.test.ts` | Test | Chat hook tests |
| `src/test/hooks/useConversations.test.ts` | Test | Conversations hook tests |
| `src/test/hooks/useDirectMessages.test.ts` | Test | DM hook tests |
| `src/test/hooks/useAttendance.test.ts` | Test | Attendance hook tests |
| `src/test/pages/ForumPage.test.tsx` | Test | Forum page component tests |
| `src/test/pages/Messages.test.tsx` | Test | Messages page component tests |
| `src/test/pages/StudentAnalytics.test.tsx` | Test | Student analytics tests |
| `src/test/pages/ReportCards.test.tsx` | Test | Report cards page tests |
| `src/test/pages/BulkImport.test.tsx` | Test | Bulk import page tests |
| `src/test/lib/csvParser.test.ts` | Test | CSV parser unit tests |

### 4.2 Existing Files to Modify

| File | Change |
|------|--------|
| `src/integrations/supabase/types.ts` | Add type definitions for `forum_posts`, `chat_messages`, `announcements`, `conversations`, `direct_messages`, `attendance` tables |
| `src/App.tsx` | Add 11 new routes (forum, messages, analytics x3, progress report, teacher metrics, report cards, bulk import) |
| `src/components/AppSidebar.tsx` | Add Messages, Analytics nav links to all three nav arrays; add Report Cards, Bulk Import to adminNav |
| `src/pages/CourseDetail.tsx` | Add "Discussion" and "Announcements" tabs |
| `src/pages/Dashboard.tsx` | Add prominent announcements section |
| `src/pages/LiveClasses.tsx` | Integrate LiveClassChat component on class cards |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Add Announcements tab with AnnouncementManager |
| `src/pages/teacher/TeacherLiveClasses.tsx` | Integrate LiveClassChat + AttendanceManager |
| `src/pages/teacher/TeacherStudents.tsx` | Add "View Report" link per student row |
| `src/pages/admin/AdminUsers.tsx` | Add "View Metrics" link for teacher rows |
| `src/pages/Profile.tsx` | Add attendance percentage display |
| `package.json` | Add `jspdf` dependency |

### 4.3 New Dependencies

| Dependency | Version | Purpose | Install Command |
|------------|---------|---------|-----------------|
| `jspdf` | `^2.5.x` | PDF generation for report cards | `npm install jspdf` |
| `jspdf-autotable` | `^3.8.x` | Table rendering in PDFs | `npm install jspdf-autotable` |

**Already installed (no action needed):** `recharts`, `date-fns`, `@tanstack/react-query`, `sonner`, `zod`, `lucide-react`, all shadcn/ui components.

### 4.4 Type Definitions

```typescript
// forum_posts table
interface ForumPost {
  id: string;
  course_id: string;
  author_id: string;
  parent_id: string | null;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

// chat_messages table
interface ChatMessage {
  id: string;
  live_class_id: string;
  sender_id: string;
  message: string;
  sent_at: string;
}

// announcements table
interface Announcement {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

// conversations table
interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
}

// direct_messages table
interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  sent_at: string;
}

// attendance table
interface Attendance {
  id: string;
  live_class_id: string;
  student_id: string;
  joined_at: string;
  left_at: string | null;
  duration_minutes: number | null;
}

// Analytics types (not DB tables — computed in hooks)
interface ProgressTrend {
  date: string;
  completionPercent: number;
}

interface ScoreTrend {
  date: string;
  score: number;
  maxScore: number;
}

interface EngagementCell {
  dayOfWeek: number; // 0=Mon ... 6=Sun
  hour: number;      // 0-23
  count: number;
}

interface SubjectPerformance {
  courseTitle: string;
  averageScore: number;
  maxPossible: number;
}

// Report card types
interface GradingScale {
  type: "percentage" | "letter" | "gpa";
}

interface ReportCardEntry {
  courseName: string;
  assignmentScores: { title: string; score: number; maxScore: number }[];
  averagePercent: number;
  letterGrade: string;
  gpa: number;
  teacherRemarks: string;
  attendancePercent: number;
}

// CSV import types
interface CSVRow {
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  [key: string]: string;
}

interface ImportValidation {
  valid: CSVRow[];
  errors: { row: number; field: string; message: string }[];
  duplicates: { row: number; email: string }[];
}
```

### 4.5 DB Migrations

**Migration 1: `forum_posts`**
```sql
CREATE TABLE public.forum_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_forum_posts_course ON public.forum_posts(course_id);
CREATE INDEX idx_forum_posts_parent ON public.forum_posts(parent_id);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Enrolled students + course teacher can read
CREATE POLICY "forum_posts_read" ON public.forum_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = forum_posts.course_id AND e.student_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = forum_posts.course_id AND c.teacher_id = auth.uid())
  OR public.has_role('admin', auth.uid())
);

-- Enrolled students + course teacher can insert
CREATE POLICY "forum_posts_insert" ON public.forum_posts FOR INSERT WITH CHECK (
  auth.uid() = author_id AND (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = forum_posts.course_id AND e.student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = forum_posts.course_id AND c.teacher_id = auth.uid())
  )
);

-- Teachers can update (pin) their course posts; authors can update own posts
CREATE POLICY "forum_posts_update" ON public.forum_posts FOR UPDATE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = forum_posts.course_id AND c.teacher_id = auth.uid())
  OR public.has_role('admin', auth.uid())
);

-- Teachers can delete; admins can delete; authors can delete own
CREATE POLICY "forum_posts_delete" ON public.forum_posts FOR DELETE USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = forum_posts.course_id AND c.teacher_id = auth.uid())
  OR public.has_role('admin', auth.uid())
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
```

**Migration 2: `chat_messages`**
```sql
CREATE TABLE public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  live_class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_class ON public.chat_messages(live_class_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_read" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.live_classes lc
    JOIN public.enrollments e ON e.course_id = lc.course_id
    WHERE lc.id = chat_messages.live_class_id AND e.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_messages.live_class_id AND lc.teacher_id = auth.uid()
  )
  OR public.has_role('admin', auth.uid())
);

CREATE POLICY "chat_messages_insert" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      JOIN public.enrollments e ON e.course_id = lc.course_id
      WHERE lc.id = chat_messages.live_class_id AND e.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_messages.live_class_id AND lc.teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "chat_messages_delete" ON public.chat_messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_messages.live_class_id AND lc.teacher_id = auth.uid()
  )
  OR public.has_role('admin', auth.uid())
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
```

**Migration 3: `announcements`**
```sql
CREATE TABLE public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_course ON public.announcements(course_id);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_read" ON public.announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = announcements.course_id AND e.student_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = announcements.course_id AND c.teacher_id = auth.uid())
  OR public.has_role('admin', auth.uid())
);

CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT WITH CHECK (
  auth.uid() = teacher_id
  AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = announcements.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE USING (
  auth.uid() = teacher_id OR public.has_role('admin', auth.uid())
);

CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE USING (
  auth.uid() = teacher_id OR public.has_role('admin', auth.uid())
);

-- Notification trigger: notify all enrolled students on new announcement
CREATE OR REPLACE FUNCTION public.notify_on_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  SELECT e.student_id,
         'New announcement in your course: "' || NEW.title || '"',
         'announcement'
  FROM public.enrollments e
  WHERE e.course_id = NEW.course_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_announcement
AFTER INSERT ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.notify_on_announcement();
```

**Migration 4: `conversations` + `direct_messages`**
```sql
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (participant1_id, participant2_id),
  CONSTRAINT different_participants CHECK (participant1_id <> participant2_id)
);

CREATE INDEX idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant2_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_read" ON public.conversations FOR SELECT USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT WITH CHECK (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

CREATE TABLE public.direct_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dm_conversation ON public.direct_messages(conversation_id);
CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dm_read" ON public.direct_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

CREATE POLICY "dm_insert" ON public.direct_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

CREATE POLICY "dm_update" ON public.direct_messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
  )
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
```

**Migration 5: `attendance`**
```sql
CREATE TABLE public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  live_class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  duration_minutes integer,
  CONSTRAINT unique_attendance UNIQUE (live_class_id, student_id)
);

CREATE INDEX idx_attendance_class ON public.attendance(live_class_id);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_read_own" ON public.attendance FOR SELECT USING (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = attendance.live_class_id AND lc.teacher_id = auth.uid()
  )
  OR public.has_role('admin', auth.uid())
);

CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT WITH CHECK (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = attendance.live_class_id AND lc.teacher_id = auth.uid()
  )
);

CREATE POLICY "attendance_update" ON public.attendance FOR UPDATE USING (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = attendance.live_class_id AND lc.teacher_id = auth.uid()
  )
);
```

### 4.5 Existing Patterns to Reuse

| Pattern | Source File | Reuse In |
|---------|------------|----------|
| Realtime channel subscription + cache invalidation | `src/hooks/useRealtimeNotifications.ts` | F2 (chat), F4 (DM) |
| Role-based enrollment query | `src/pages/LiveClasses.tsx:12-19` | F1, F3, F5, F6, F8 |
| `useMutation` + `queryClient.invalidateQueries` | `src/pages/Notifications.tsx:26-31` | All CRUD hooks |
| Tabs with TabsContent | `src/pages/CourseDetail.tsx:99-104` | F1 (forum tab), F3 (announcements tab) |
| Recharts BarChart/PieChart | `src/pages/admin/AdminDashboard.tsx:5` | F5, F6, F7 |
| `supabase.channel().on("postgres_changes", ...)` | `src/hooks/useRealtimeNotifications.ts:28-58` | F2, F4 |
| Loading spinner pattern | `src/pages/CourseDetail.tsx:68-72` | All new pages |
| Empty state pattern | `src/pages/Notifications.tsx:63-66` | All new pages |
| Dialog for forms | `src/pages/teacher/TeacherCourseDetail.tsx:14` | F1 (new post), F3 (new announcement), F4 (new conversation) |
| `format` / `formatDistanceToNow` from date-fns | `src/pages/Dashboard.tsx:9` | All components with timestamps |
| `toast` from sonner for mutation feedback | `src/pages/teacher/TeacherCourseDetail.tsx:15` | All mutation hooks |

---

## 5. Implementation Plan

### Step 1: Database Migrations (30 min)

Apply all 5 migrations in order. Each migration creates a table, indexes, RLS policies, and (where applicable) triggers and realtime.

| Task | File | Details |
|------|------|---------|
| F1.1-F1.3 | `supabase/migrations/20260411_phase5_forum_posts.sql` | forum_posts table + RLS + indexes + realtime publication |
| F2.1-F2.3 | `supabase/migrations/20260411_phase5_chat_messages.sql` | chat_messages table + RLS + indexes + realtime publication |
| F3.1-F3.3 | `supabase/migrations/20260411_phase5_announcements.sql` | announcements table + RLS + `notify_on_announcement()` trigger |
| F4.1-F4.4 | `supabase/migrations/20260411_phase5_direct_messages.sql` | conversations + direct_messages tables + RLS + realtime |
| F8.1-F8.2 | `supabase/migrations/20260411_phase5_attendance.sql` | attendance table + RLS + indexes |

### Step 2: Update Supabase Types (15 min)

| Task | File | Details |
|------|------|---------|
| F1.4, F2.4, F3.4, F4.5, F8.3 | `src/integrations/supabase/types.ts` | Add Row/Insert/Update type definitions for all 6 new tables (forum_posts, chat_messages, announcements, conversations, direct_messages, attendance) to the `Database["public"]["Tables"]` object |

### Step 3: Install New Dependencies (5 min)

| Task | Details |
|------|---------|
| F9.1 | Run `npm install jspdf jspdf-autotable` |
| Add jspdf type declarations | Run `npm install -D @types/jspdf` if needed (jspdf includes its own types) |

### Step 4: Discussion Forums — F1 (1.5 hours)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F1.5 | `useForumPosts` hook | `src/hooks/useForumPosts.ts` | Accept `courseId`. Fetch top-level posts (`parent_id IS NULL`) ordered by pinned desc + created_at desc. Fetch replies per post. Mutations for createPost, deletePost, togglePin. Use `useQuery` + `useMutation` + `queryClient.invalidateQueries`. |
| F1.6 | `ForumPost` component | `src/components/ForumPost.tsx` | Props: post data, replies array, isTeacher, onDelete, onTogglePin, onReply. Render author name (join profiles), time via `formatDistanceToNow`, body text, pin badge, reply count. Expand/collapse replies. Teacher gets pin/delete buttons. |
| F1.7 | `ForumReplyForm` component | `src/components/ForumReplyForm.tsx` | Props: parentId, courseId, onSubmit. Textarea + Submit button. Uses `react-hook-form` + `zod` for validation (body required, min 1 char). Calls createPost mutation with parent_id set. |
| F1.8 | `ForumPage` page | `src/pages/ForumPage.tsx` | URL param: `courseId`. Search input (local filter on title/body). "New Post" button opens Dialog with title + body fields. Post list with ForumPost components. Loading/empty states. |
| F1.9 | Route | `src/App.tsx` | Add `<Route path="/courses/:courseId/forum" element={<ForumPage />} />` inside protected routes |
| F1.10 | CourseDetail tab | `src/pages/CourseDetail.tsx` | Add `<TabsTrigger value="forum">Discussion</TabsTrigger>` + `<TabsContent>` with link to `/courses/:courseId/forum` or inline post list |
| F1.11 | Search | `src/pages/ForumPage.tsx` | Local filtering: `posts.filter(p => p.title.toLowerCase().includes(search) \|\| p.body.toLowerCase().includes(search))` |
| F1.12 | Teacher controls | `src/components/ForumPost.tsx` | Conditionally render pin/delete DropdownMenu buttons when `isTeacher` is true |

### Step 5: In-Class Chat — F2 (1 hour)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F2.5 | `useLiveClassChat` hook | `src/hooks/useLiveClassChat.ts` | Accept `liveClassId`. Use `useQuery` to fetch chat history. Subscribe to `supabase.channel('chat-' + liveClassId)` with `postgres_changes` on `chat_messages` filtered by `live_class_id`. On INSERT, invalidate query. Mutation for `sendMessage`. Teacher-only mutation for `deleteMessage`. Join with `profiles` to get sender names. |
| F2.6 | `LiveClassChat` component | `src/components/LiveClassChat.tsx` | Props: `liveClassId`, `isTeacher`. Render messages in `ScrollArea` (max-height 400px). Each message shows sender name, time, text. Teacher sees delete button per message. Input form at bottom with send button. Auto-scroll ref on new messages via `useEffect` + `scrollIntoView`. |
| F2.7 | Student integration | `src/pages/LiveClasses.tsx` | Add expandable chat section (Collapsible) to each upcoming class card. Only show for classes with meeting_url (active sessions). |
| F2.8 | Teacher integration | `src/pages/teacher/TeacherLiveClasses.tsx` | Same pattern but with `isTeacher={true}` for delete moderation. |
| F2.9 | Auto-scroll | `src/components/LiveClassChat.tsx` | `useRef` on messages container bottom. `useEffect` watching `messages.length` to call `ref.current?.scrollIntoView({ behavior: 'smooth' })`. |

### Step 6: Announcement System — F3 (1 hour)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F3.5 | `AnnouncementManager` | `src/components/teacher/AnnouncementManager.tsx` | Props: `courseId`. Fetch announcements for course. Create/edit/pin/delete mutations. Dialog for create/edit with title + body fields (react-hook-form + zod). Pin toggle button. Delete with AlertDialog confirmation. |
| F3.6 | `AnnouncementCard` | `src/components/AnnouncementCard.tsx` | Props: announcement data, courseName. Render Card with title, body (truncated to 3 lines), pin Badge, course name, timestamp via `formatDistanceToNow`. |
| F3.7 | Teacher tab | `src/pages/teacher/TeacherCourseDetail.tsx` | Add "Announcements" TabsTrigger + TabsContent containing `<AnnouncementManager courseId={courseId} />`. |
| F3.8 | Dashboard section | `src/pages/Dashboard.tsx` | New Card in the 3-column grid: "Latest Announcements". Query announcements for enrolled courses, ordered by created_at desc, limit 5. Map each to AnnouncementCard. |
| F3.9 | Student tab | `src/pages/CourseDetail.tsx` | Add "Announcements" TabsTrigger + TabsContent. Fetch announcements for the course. Display with AnnouncementCard. Pinned announcements appear first. |

### Step 7: Attendance Tracking — F8 (1 hour)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F8.4 | `useAttendance` hook | `src/hooks/useAttendance.ts` | Accept `liveClassId` or `studentId` or `courseId`. Queries: fetch attendance by class, by student, by course. Mutations: recordJoin (upsert with joined_at), recordLeave (update left_at + compute duration_minutes), manualOverride (teacher sets duration_minutes). |
| F8.5 | `AttendanceManager` | `src/components/teacher/AttendanceManager.tsx` | Props: `liveClassId`. Fetch enrolled students + their attendance for this class. Table: student name, joined_at, left_at, duration, status (Present/Absent). Manual check-in button per student. Edit duration dialog. |
| F8.6 | Teacher integration | `src/pages/teacher/TeacherLiveClasses.tsx` | Add "Attendance" expandable section per past class. Contains AttendanceManager component. |
| F8.7 | Profile attendance | `src/pages/Profile.tsx` | Query all attendance records for current user. Compute: total classes attended / total classes available. Display as percentage with Progress bar. |
| F8.8 | Report filters | `src/components/teacher/AttendanceManager.tsx` | Add date range picker and course selector for filtering. Summary stats: total classes, avg attendance %, students with <75% attendance flagged. |

### Step 8: Direct Messaging — F4 (2 hours)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F4.6 | `useConversations` hook | `src/hooks/useConversations.ts` | Fetch conversations where user is participant1 or participant2. Join with profiles to get other participant's name. Include last message preview + unread count per conversation. Mutation: createConversation (ensure participants are ordered to avoid duplicates — always put smaller UUID as participant1). |
| F4.7 | `useDirectMessages` hook | `src/hooks/useDirectMessages.ts` | Accept `conversationId`. Fetch messages ordered by sent_at asc. Realtime subscription via `supabase.channel('dm-' + conversationId)` on INSERT. markAsRead mutation: update `is_read = true` for all messages in conversation where sender_id != current user. sendMessage mutation. |
| F4.8 | `Messages` page | `src/pages/Messages.tsx` | Two-panel layout: left sidebar with conversation list (ScrollArea), right panel with message thread. Use `useParams` for conversationId. "New Message" button opens Dialog with user search (profiles query) to start conversation. Each conversation shows other user's name, last message preview, unread badge. Message thread shows messages with sender alignment (own = right, other = left). Input form at bottom. |
| F4.9 | Routes | `src/App.tsx` | Add `<Route path="/messages" element={<Messages />} />` and `<Route path="/messages/:conversationId" element={<Messages />} />` inside protected routes |
| F4.10 | Sidebar nav | `src/components/AppSidebar.tsx` | Add `{ title: "Messages", url: "/messages", icon: MessageCircle }` to all three nav arrays (import `MessageCircle` from lucide-react) |
| F4.11 | Read receipts | `src/hooks/useDirectMessages.ts` | On hook mount (when conversation is opened), call markAsRead mutation. Show double-check icon for read messages in UI. |
| F4.12 | Unread badge | `src/components/AppSidebar.tsx` | Create small `useUnreadDMCount` inline query. Display Badge with count next to Messages nav link (same pattern as the notification system). |

### Step 9: Advanced Analytics — F5 (2 hours)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F5.1 | `useStudentAnalytics` hook | `src/hooks/useStudentAnalytics.ts` | Query lesson_progress grouped by date for completion trend line. Query submissions with grades + graded_at for score trend line. Query lesson_progress + submissions timestamps for engagement heatmap (group by day-of-week + hour). Query submissions per course for subject-wise performance. |
| F5.2 | `useTeacherAnalytics` hook | `src/hooks/useTeacherAnalytics.ts` | Query all enrollments for teacher's courses for student counts. Query submissions for teacher's courses for submission rates. Query lesson_progress for completion rates per course. Aggregate by course. |
| F5.3 | `useAdminAnalytics` hook | `src/hooks/useAdminAnalytics.ts` | Query profiles count for total users. Query enrollments grouped by date for daily activity. Query submissions grouped by date. Query user_roles for role distribution. Query courses grouped by status for course health. |
| F5.4 | `StudentAnalytics` page | `src/pages/analytics/StudentAnalytics.tsx` | Summary cards (total courses, avg score, lessons completed, attendance %). LineChart for lesson completion over time (date x-axis, % y-axis). LineChart for assignment scores over time. EngagementHeatmap component. BarChart for subject-wise performance comparison. |
| F5.5 | `TeacherAnalytics` page | `src/pages/analytics/TeacherAnalytics.tsx` | Summary cards (total students, total courses, avg submission rate, avg completion rate). BarChart: submission rates per course. BarChart: completion rates per course. LineChart: new enrollments over time. |
| F5.6 | `AdminAnalytics` page | `src/pages/analytics/AdminAnalytics.tsx` | Summary cards (total users, active today, total courses, total enrollments). LineChart: daily sign-ins / active users. BarChart: course activity (enrollments, submissions per course). PieChart: role distribution. Table: top 5 most active courses. |
| F5.7 | Engagement heatmap | `src/components/analytics/EngagementHeatmap.tsx` | CSS Grid: 7 columns (Mon-Sun) x 24 rows (hours). Each cell colored by activity count (0 = gray, low = light green, high = dark green). Tooltip on hover showing count. Built with CSS grid + inline styles (no extra dependency). |
| F5.8 | Routes | `src/App.tsx` | Add `/analytics` (student), `/teacher/analytics`, `/admin/analytics` |
| F5.9 | Sidebar nav | `src/components/AppSidebar.tsx` | Add `{ title: "Analytics", url: "/analytics", icon: TrendingUp }` to studentNav, `{ title: "Analytics", url: "/teacher/analytics", icon: TrendingUp }` to teacherNav, `{ title: "Analytics", url: "/admin/analytics", icon: TrendingUp }` to adminNav |

### Step 10: Student Progress Reports — F6 (1 hour)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F6.1 | `useStudentProgressReport` hook | `src/hooks/useStudentProgressReport.ts` | Accept `studentId`. Query enrollments for student. For each course: query lesson_progress for completion %, query submissions for scores + trends, query attendance for attendance %. Compute overall GPA, engagement score. |
| F6.2 | `StudentProgressReport` page | `src/pages/teacher/StudentProgressReport.tsx` | URL param: `studentId`. Header with student name + email. Summary cards (overall completion %, overall avg score, attendance %, engagement score). Per-course breakdown table: course name, lessons done, avg score, attendance. LineChart: score trends over time. Progress bars for each course completion. |
| F6.3 | Route | `src/App.tsx` | Add `<Route path="/teacher/students/:studentId/report" element={<StudentProgressReport />} />` |
| F6.4 | Link from TeacherStudents | `src/pages/teacher/TeacherStudents.tsx` | Add `<Link to={/teacher/students/${student.id}/report}>View Report</Link>` button in each student row |
| F6.5 | Print/export | `src/pages/teacher/StudentProgressReport.tsx` | Add `window.print()` button. Add `print:hidden` classes on interactive elements. |

### Step 11: Teacher Performance Metrics — F7 (1 hour)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F7.1 | `useTeacherMetrics` hook | `src/hooks/useTeacherMetrics.ts` | Accept `teacherId`. Query courses for teacher. Query submissions + graded_at for turnaround (avg of graded_at - submitted_at in hours). Query lessons + assignments created grouped by week for activity frequency. Query submissions per course for completion rates (submitted / enrolled). |
| F7.2 | `TeacherMetrics` page | `src/pages/admin/TeacherMetrics.tsx` | URL param: `teacherId`. Header with teacher name. Summary cards (avg turnaround hours, courses taught, total students, avg completion rate). BarChart: turnaround time per course. LineChart: content creation frequency over time. BarChart: submission/completion rates per course. |
| F7.3 | Route | `src/App.tsx` | Add `<Route path="/admin/teachers/:teacherId/metrics" element={<TeacherMetrics />} />` |
| F7.4 | Link from AdminUsers | `src/pages/admin/AdminUsers.tsx` | For rows where role includes "teacher", add `<Link to={/admin/teachers/${user.user_id}/metrics}>View Metrics</Link>` button |

### Step 12: Report Cards & Bulk Import — F9 (2 hours)

| # | Subtask | File | Details |
|---|---------|------|---------|
| F9.2 | `useReportCardData` hook | `src/hooks/useReportCardData.ts` | Accept `studentId`. Aggregate all courses with grades, attendance, completion. Compute letter grades (A/B/C/D/F based on percentage) and GPA (4.0 scale). Return ReportCardEntry[] array. |
| F9.3 | `ReportCards` page | `src/pages/admin/ReportCards.tsx` | Student selector (Select dropdown querying profiles). Grading scale toggle (percentage/letter/GPA). Preview section showing report card data in a Table. "Download PDF" button calling generateReportCard. "Print" button. |
| F9.4 | PDF generator | `src/lib/generateReportCard.ts` | Use `jspdf` + `jspdf-autotable`. Header: school name, student name, date. Table: subject, score, grade, remarks. Footer: overall GPA, attendance %, signature line. Configurable grading scale parameter. Returns Blob for download. |
| F9.5 | `BulkImport` page | `src/pages/admin/BulkImport.tsx` | File input for CSV. Column mapping UI: show detected columns, map to name/email/role. Validation preview: show valid rows (green), errors (red), duplicates (yellow). "Import" button that creates auth users via Supabase admin API (or inserts into profiles + user_roles if auth is separate). Progress indicator during import. |
| F9.6 | CSV parser | `src/lib/csvParser.ts` | Parse CSV text to rows. Validate required columns (name, email, role). Validate email format. Detect duplicates by email (within CSV + against existing profiles). Return ImportValidation object. |
| F9.7 | Routes | `src/App.tsx` | Add `/admin/report-cards` and `/admin/bulk-import` routes |
| F9.8 | Sidebar nav | `src/components/AppSidebar.tsx` | Add `{ title: "Report Cards", url: "/admin/report-cards", icon: FileText }` and `{ title: "Bulk Import", url: "/admin/bulk-import", icon: Upload }` to adminNav |

### Step 13: Update App.tsx Routes (15 min)

All new routes added to `src/App.tsx` inside the protected `<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>` block:

```
Student routes:
  /courses/:courseId/forum        → ForumPage
  /messages                       → Messages
  /messages/:conversationId       → Messages
  /analytics                      → StudentAnalytics

Teacher routes:
  /teacher/analytics              → TeacherAnalytics
  /teacher/students/:studentId/report → StudentProgressReport

Admin routes:
  /admin/analytics                → AdminAnalytics
  /admin/teachers/:teacherId/metrics → TeacherMetrics
  /admin/report-cards             → ReportCards
  /admin/bulk-import              → BulkImport
```

### Step 14: Tests (2 hours)

See [Section 6: Testing Plan](#6-testing-plan) for full details.

### Step 15: Debugging & Manual QA (1 hour)

See [Section 7: Debugging Plan](#7-debugging-plan) for full details.

### Step 16: Review & Audit (30 min)

See [Section 8](#8-code-review-checklist) and [Section 9](#9-security--quality-audit) for full details.

### Step 17: Commit & Push (15 min)

See [Section 10: Git & Push Strategy](#10-git--push-strategy) for full details.

---

## 6. Testing Plan

### 6.1 Unit Tests -- Hooks

**File:** `src/test/hooks/useForumPosts.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns empty posts when course has no forum posts` | Mock Supabase to return empty → expect `posts: []` |
| `fetches top-level posts ordered by pinned then created_at` | Mock forum_posts data → verify ordering |
| `fetches replies for a specific parent post` | Mock posts with parent_id → verify threaded grouping |
| `createPost mutation inserts and invalidates cache` | Call createPost → verify insert called + invalidateQueries |
| `deletePost mutation removes post and invalidates cache` | Call deletePost → verify delete called |
| `togglePin mutation updates pinned flag` | Call togglePin → verify update called with toggled boolean |
| `search filters posts by title and body` | Provide search term → verify filtered results |

**File:** `src/test/hooks/useLiveClassChat.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns empty messages for class with no chat` | Mock empty → expect `messages: []` |
| `fetches chat history ordered by sent_at` | Mock messages → verify ascending order |
| `sendMessage mutation inserts and invalidates cache` | Call sendMessage → verify insert + invalidation |
| `deleteMessage mutation removes message (teacher only)` | Call deleteMessage → verify delete called |
| `subscribes to realtime channel on mount` | Verify `supabase.channel` called with correct filter |
| `unsubscribes from realtime channel on unmount` | Verify `removeChannel` called on cleanup |

**File:** `src/test/hooks/useConversations.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns empty conversations for new user` | Mock empty → expect `conversations: []` |
| `fetches conversations where user is participant` | Mock data → verify both participant1 and participant2 matches |
| `includes other participant profile name` | Mock with profile join → verify name present |
| `includes last message preview per conversation` | Verify last message text shown |
| `includes unread count per conversation` | Mock unread messages → verify count |
| `createConversation orders participant IDs to avoid duplicates` | Call with (B, A) → verify insert uses (A, B) |

**File:** `src/test/hooks/useDirectMessages.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns messages for conversation ordered by sent_at` | Mock messages → verify order |
| `sendMessage inserts with correct conversation_id and sender_id` | Call sendMessage → verify insert params |
| `markAsRead updates is_read for other user messages` | Call markAsRead → verify update filter |
| `subscribes to realtime channel for conversation` | Verify channel subscription |
| `unsubscribes on unmount` | Verify cleanup |

**File:** `src/test/hooks/useAttendance.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns empty attendance for class with no records` | Mock empty → expect `[]` |
| `fetches attendance records for a specific live class` | Mock data → verify filter by live_class_id |
| `recordJoin creates new attendance record` | Call recordJoin → verify upsert |
| `recordLeave updates left_at and computes duration` | Call recordLeave → verify update params |
| `manualOverride sets duration_minutes directly` | Call override → verify update |

**File:** `src/test/lib/csvParser.test.ts`

| Test Case | Description |
|-----------|-------------|
| `parses valid CSV with header row` | Input CSV string → expect correct row objects |
| `detects missing required columns` | CSV without email column → error |
| `validates email format` | Invalid email → error for that row |
| `detects duplicate emails within CSV` | Two rows with same email → duplicates array |
| `handles empty rows gracefully` | CSV with blank lines → skipped |
| `trims whitespace from values` | Values with spaces → trimmed |
| `validates role values` | Invalid role → error for that row |

### 6.2 Component Tests -- Pages

**File:** `src/test/pages/ForumPage.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders page title and search input` | Verify heading + input in DOM |
| `renders "New Post" button` | Verify button exists |
| `shows loading spinner while fetching` | Mock loading → verify spinner |
| `shows empty state when no posts` | Mock empty → verify "No discussions yet" |
| `renders forum posts with title and body` | Mock posts → verify content |
| `search input filters displayed posts` | Type in search → verify filtered list |
| `teacher sees pin and delete buttons` | Mock teacher role → verify buttons |
| `student does not see pin button` | Mock student role → verify no pin button |

**File:** `src/test/pages/Messages.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders conversations sidebar and message panel` | Verify both panels in DOM |
| `shows "New Message" button` | Verify button exists |
| `shows empty state when no conversations` | Mock empty → verify "No messages yet" |
| `renders conversation list with participant names` | Mock conversations → verify names |
| `shows unread badge on conversations with unread messages` | Mock unread → verify badge |
| `clicking conversation loads message thread` | Mock click → verify messages displayed |
| `message input form is present` | Verify input + send button |

**File:** `src/test/pages/StudentAnalytics.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders summary stat cards` | Verify cards for courses, score, completion, attendance |
| `shows loading state while fetching` | Mock loading → verify spinner |
| `renders line chart for lesson completion` | Verify chart container in DOM |
| `renders line chart for assignment scores` | Verify chart container |
| `renders engagement heatmap` | Verify heatmap grid in DOM |
| `renders bar chart for subject performance` | Verify chart container |

**File:** `src/test/pages/ReportCards.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders student selector dropdown` | Verify Select component |
| `renders grading scale toggle` | Verify percentage/letter/GPA options |
| `shows empty state when no student selected` | Verify "Select a student" message |
| `renders report card preview table` | Mock data → verify table rows |
| `Download PDF button is present` | Verify button exists |
| `Print button is present` | Verify button exists |

**File:** `src/test/pages/BulkImport.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders file upload input` | Verify file input in DOM |
| `shows validation preview after CSV upload` | Mock file → verify preview table |
| `highlights error rows in red` | Mock validation errors → verify styling |
| `highlights duplicate rows in yellow` | Mock duplicates → verify styling |
| `Import button is disabled when errors exist` | Mock errors → verify disabled state |
| `shows progress indicator during import` | Mock importing state → verify progress |

### 6.3 Test Commands

```bash
# Run all tests
npm run test

# Run in watch mode during development
npm run test:watch

# Run only Phase 5 tests
npx vitest run src/test/hooks/useForumPosts.test.ts src/test/hooks/useLiveClassChat.test.ts src/test/hooks/useConversations.test.ts src/test/hooks/useDirectMessages.test.ts src/test/hooks/useAttendance.test.ts src/test/lib/csvParser.test.ts src/test/pages/ForumPage.test.tsx src/test/pages/Messages.test.tsx src/test/pages/StudentAnalytics.test.tsx src/test/pages/ReportCards.test.tsx src/test/pages/BulkImport.test.tsx

# Run with coverage
npx vitest run --coverage

# Type check
npx tsc --noEmit
```

---

## 7. Debugging Plan

### 7.1 Common Issues & How to Debug

| Issue | Debugging Steps |
|-------|-----------------|
| **Forum posts not loading** | 1. Check DevTools Network tab for Supabase REST call to `forum_posts`. 2. Verify `course_id` param is correct. 3. Check RLS — user must be enrolled or be the teacher. 4. Check Supabase Dashboard → Logs → PostgREST for RLS denials. |
| **Chat messages not appearing in real-time** | 1. Check `supabase.channel()` subscription in DevTools Console — look for `subscribed` event. 2. Verify `chat_messages` is in `supabase_realtime` publication (check migration). 3. Send a message and check Network tab for WebSocket frames. 4. Verify `postgres_changes` filter uses correct `live_class_id`. |
| **Announcements not triggering notifications** | 1. Insert announcement via Supabase Dashboard → check if notification row appears in `notifications` table. 2. Check trigger function `notify_on_announcement()` exists in Database → Functions. 3. Verify enrollments exist for the course. 4. Check PostgREST logs for trigger errors. |
| **Direct messages RLS blocking** | 1. Verify conversation exists between the two participants. 2. Check that `participant1_id` and `participant2_id` are ordered correctly (smaller UUID first). 3. Test RLS policy in SQL Editor: `SET request.jwt.claims = '{"sub":"<user-uuid>"}'::jsonb; SELECT * FROM direct_messages;` |
| **Analytics charts showing no data** | 1. Check that underlying tables (lesson_progress, submissions) have data. 2. Log the hook's query results in DevTools. 3. Verify date range calculations in hooks (startOfMonth/endOfMonth or similar). 4. Check Recharts data format — requires `[{ name: string, value: number }]` structure. |
| **Engagement heatmap empty** | 1. Log the activity data from hook. 2. Verify timestamp parsing — `getDay()` and `getHours()` on parsed dates. 3. Check timezone: Supabase returns UTC, local display may differ. |
| **Attendance not recording** | 1. Check `attendance` table for records. 2. Verify upsert constraint (`unique_attendance` on live_class_id + student_id). 3. Check RLS — student must be enrolled in the course associated with the live class. |
| **PDF generation failing** | 1. Check browser console for jspdf errors. 2. Verify `jspdf` and `jspdf-autotable` are installed. 3. Test with minimal data first. 4. Check that font encoding supports special characters. |
| **CSV import validation errors** | 1. Log parsed CSV rows. 2. Check for BOM characters in CSV (UTF-8 BOM). 3. Verify delimiter detection (comma vs semicolon). 4. Check email regex pattern. |
| **Realtime subscription memory leak** | 1. Verify cleanup function calls `supabase.removeChannel(channel)`. 2. Check that `useEffect` dependency array is correct. 3. Look for multiple subscriptions in DevTools (Supabase logs multiple channel joins). |

### 7.2 Development Server Commands

```bash
# Start dev server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Check lint on all new files
npx eslint src/pages/ForumPage.tsx src/pages/Messages.tsx src/pages/analytics/*.tsx src/pages/teacher/StudentProgressReport.tsx src/pages/admin/TeacherMetrics.tsx src/pages/admin/ReportCards.tsx src/pages/admin/BulkImport.tsx src/components/ForumPost.tsx src/components/ForumReplyForm.tsx src/components/LiveClassChat.tsx src/components/AnnouncementCard.tsx src/components/teacher/AnnouncementManager.tsx src/components/teacher/AttendanceManager.tsx src/components/analytics/EngagementHeatmap.tsx src/hooks/useForumPosts.ts src/hooks/useLiveClassChat.ts src/hooks/useConversations.ts src/hooks/useDirectMessages.ts src/hooks/useStudentAnalytics.ts src/hooks/useTeacherAnalytics.ts src/hooks/useAdminAnalytics.ts src/hooks/useStudentProgressReport.ts src/hooks/useTeacherMetrics.ts src/hooks/useAttendance.ts src/hooks/useReportCardData.ts src/lib/generateReportCard.ts src/lib/csvParser.ts

# Build check
npm run build
```

### 7.3 Browser DevTools Checks

- **React Query DevTools:** Inspect query states for all new query keys (forum-posts, chat-messages, conversations, direct-messages, analytics-*, attendance, report-card-data). Check for stale/error/loading states.
- **Network Tab:** Filter by `rest/v1` to see Supabase REST calls. Verify correct table names and filter parameters in URLs. Check for 403 (RLS denied) or 400 (bad request) responses.
- **WebSocket Tab:** Verify Supabase Realtime connections for chat_messages and direct_messages channels. Look for `postgres_changes` events arriving.
- **Console:** Check for React warnings (missing key props, useEffect dependency array warnings, multiple subscriptions).
- **Application Tab:** Verify `localStorage` has Supabase session token (required for RLS).
- **Responsive Mode:** Test Messages page at 375px (conversations should stack vertically). Test analytics charts at various widths.

---

## 8. Code Review Checklist

### Functional Correctness
- [ ] Forum posts are threaded correctly (parent_id references work, replies nest under parent)
- [ ] Forum search filters both title and body, case-insensitive
- [ ] Chat realtime subscription correctly filters by `live_class_id`
- [ ] Chat auto-scroll triggers on new message arrival
- [ ] Announcement notification trigger fires for all enrolled students (not teacher)
- [ ] Conversations unique constraint prevents duplicate conversations between same pair
- [ ] Direct message `is_read` updates only for non-sender messages
- [ ] Analytics date aggregations use correct timezone handling (parseISO → local)
- [ ] Engagement heatmap correctly maps `getDay()` (0=Sun) to grid position (0=Mon)
- [ ] Attendance duration_minutes is computed as diff between joined_at and left_at
- [ ] Report card GPA calculation is correct (4.0 scale: A=4, B=3, C=2, D=1, F=0)
- [ ] CSV parser handles edge cases: BOM, trailing commas, quoted fields with commas
- [ ] All `enabled` flags on dependent queries prevent premature fetching
- [ ] All mutations call `queryClient.invalidateQueries` with correct query keys

### Code Quality
- [ ] Follows existing patterns from `useRealtimeNotifications.ts` for realtime hooks
- [ ] Follows existing patterns from `Dashboard.tsx` and `AdminDashboard.tsx` for data fetching
- [ ] No unused imports or variables in any new file
- [ ] TypeScript types are explicit — no unnecessary `any` (match existing patterns for Supabase joins)
- [ ] Query keys are unique and include all variable dependencies
- [ ] Hook return types are clean and well-typed
- [ ] Components accept explicit props interfaces
- [ ] Utility functions in `src/lib/` are pure and independently testable
- [ ] Consistent naming: `use<Feature>` for hooks, `<Name>Page.tsx` for pages, `<Name>.tsx` for components

### UI/UX
- [ ] Loading spinners match existing design (`h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent`)
- [ ] Empty states match existing design (icon + message centered)
- [ ] Cards use consistent `space-y-6 max-w-4xl` or `max-w-6xl` page wrapper
- [ ] Color-coded badges have text labels (not relying solely on color)
- [ ] Chat messages are visually distinct for own vs. other (alignment or background color)
- [ ] Conversation sidebar highlights active conversation
- [ ] Analytics charts have proper axis labels and tooltips
- [ ] Heatmap has legend explaining color scale
- [ ] Report card PDF is clean and printable
- [ ] Bulk import shows clear validation feedback (green/red/yellow rows)
- [ ] All new pages are responsive (test at 375px, 768px, 1024px)

### Performance
- [ ] Realtime subscriptions clean up on unmount (no memory leaks)
- [ ] Chat scroll does not cause layout thrashing (use `scrollIntoView` not `scrollTop` recalculation)
- [ ] Analytics queries use `staleTime` to avoid excessive re-fetching (30s-60s)
- [ ] CSV parsing for large files does not block main thread (consider chunking for 1000+ rows)
- [ ] PDF generation for large report cards does not freeze UI (consider async/web worker for large batches)
- [ ] Forum post list uses pagination or virtual scrolling if >50 posts
- [ ] Direct message history loads only last 50 messages initially (load more on scroll up)

---

## 9. Security & Quality Audit

### 9.1 Security Checks

| Check | Expected Result |
|-------|-----------------|
| **Forum RLS** | Students can only read/write in courses they're enrolled in. Teachers can pin/delete in their courses only. Admins have full access. Verify by testing queries as different roles in Supabase SQL Editor. |
| **Chat RLS** | Only enrolled students and the teacher of the course can read/write chat messages for a live class. Teacher can delete any message. No cross-class message leakage. |
| **Announcement RLS** | Only course teacher can create announcements. Students can read for enrolled courses only. Teachers cannot create announcements for other teachers' courses. |
| **DM RLS** | Only conversation participants can read/write messages. No user can read another pair's conversation. Verify unique constraint prevents conversation duplication. |
| **Attendance RLS** | Students see only own attendance. Teachers see attendance for their courses. Admins see all. Students cannot modify other students' attendance. |
| **No raw HTML rendering** | No `dangerouslySetInnerHTML` in forum posts, chat messages, announcements, or DMs. All user content rendered as plain text. |
| **XSS prevention** | Forum body, chat message, announcement body, DM message — all displayed via React JSX (auto-escaped). No `eval()` or `innerHTML`. |
| **CSV import validation** | All imported emails validated. Roles restricted to `student`/`teacher`/`admin` enum. No SQL injection possible (Supabase parameterized queries). |
| **PDF generation** | Report card PDF generated client-side — no sensitive data sent to external services. |
| **Auth guard** | All new pages render inside `ProtectedRoute` → unauthenticated users cannot access any Phase 5 features. |
| **Meeting URL handling** | All `target="_blank"` links include `rel="noopener noreferrer"` (consistent with existing `LiveClasses.tsx` pattern). |

### 9.2 Quality Checks

| Check | Expected Result |
|-------|-----------------|
| **TypeScript strict** | No new `any` types except for Supabase join patterns (matching existing convention). All new interfaces explicitly defined. |
| **No console.log** | Remove all debug logging before commit. |
| **Error handling** | All queries return `[]` or `null` on error (consistent with existing `?? []` pattern). All mutations show `toast.error()` on failure. |
| **Accessibility** | Forum posts have proper heading hierarchy. Chat messages have ARIA labels. Analytics charts have alt text descriptions. Tables have proper `<th>` headers. All interactive elements are keyboard-focusable. |
| **Bundle size** | Only `jspdf` + `jspdf-autotable` added as new dependencies (~300KB gzipped). All other features use existing dependencies. |
| **Timezone consistency** | All date comparisons use `parseISO` → local Date → date-fns functions. No raw string comparisons. |
| **Realtime cleanup** | Every `supabase.channel().subscribe()` has a corresponding `supabase.removeChannel()` in useEffect cleanup. |

### 9.3 Audit Procedure

1. **Static analysis:** Run `npx tsc --noEmit` — zero errors expected
2. **Lint check:** Run ESLint on all changed/new files — zero warnings
3. **Test suite:** Run `npm run test` — all tests passing
4. **Build check:** Run `npm run build` — zero warnings/errors
5. **Manual RLS test:** For each new table, test read/write as student, teacher, admin in Supabase SQL Editor
6. **Realtime test:** Open two browser tabs, send a chat message / DM in one, verify it appears in the other
7. **Manual walkthrough:** Read every new file top-to-bottom for logic errors
8. **Cross-reference with spec:** Verify each feature item matches the Phase 5 requirements
9. **Responsive check:** Test all new pages at 375px, 768px, 1024px, 1440px

---

## 10. Git & Push Strategy

### 10.1 Branch Strategy

```
main (current) → feature/phase5-communication-analytics (new branch)
```

### 10.2 Commit Plan

| # | Commit Message | Files Changed |
|---|----------------|---------------|
| 1 | `chore: add Phase 5 database migrations for forum, chat, announcements, DM, attendance` | `supabase/migrations/20260411_phase5_*.sql` (5 files) |
| 2 | `chore: update Supabase types with Phase 5 table definitions` | `src/integrations/supabase/types.ts` |
| 3 | `chore: install jspdf and jspdf-autotable for report card generation` | `package.json`, `package-lock.json` |
| 4 | `feat: add discussion forums with threaded replies and teacher moderation` | `src/hooks/useForumPosts.ts`, `src/components/ForumPost.tsx`, `src/components/ForumReplyForm.tsx`, `src/pages/ForumPage.tsx`, `src/pages/CourseDetail.tsx`, `src/App.tsx` |
| 5 | `feat: add real-time in-class chat for live class sessions` | `src/hooks/useLiveClassChat.ts`, `src/components/LiveClassChat.tsx`, `src/pages/LiveClasses.tsx`, `src/pages/teacher/TeacherLiveClasses.tsx` |
| 6 | `feat: add announcement system with notification trigger` | `src/components/teacher/AnnouncementManager.tsx`, `src/components/AnnouncementCard.tsx`, `src/pages/teacher/TeacherCourseDetail.tsx`, `src/pages/Dashboard.tsx`, `src/pages/CourseDetail.tsx` |
| 7 | `feat: add attendance tracking with teacher management UI` | `src/hooks/useAttendance.ts`, `src/components/teacher/AttendanceManager.tsx`, `src/pages/teacher/TeacherLiveClasses.tsx`, `src/pages/Profile.tsx` |
| 8 | `feat: add direct messaging with real-time updates and read receipts` | `src/hooks/useConversations.ts`, `src/hooks/useDirectMessages.ts`, `src/pages/Messages.tsx`, `src/components/AppSidebar.tsx`, `src/App.tsx` |
| 9 | `feat: add advanced analytics dashboards for students, teachers, and admins` | `src/hooks/useStudentAnalytics.ts`, `src/hooks/useTeacherAnalytics.ts`, `src/hooks/useAdminAnalytics.ts`, `src/pages/analytics/*.tsx`, `src/components/analytics/EngagementHeatmap.tsx`, `src/components/AppSidebar.tsx`, `src/App.tsx` |
| 10 | `feat: add student progress reports with print support` | `src/hooks/useStudentProgressReport.ts`, `src/pages/teacher/StudentProgressReport.tsx`, `src/pages/teacher/TeacherStudents.tsx`, `src/App.tsx` |
| 11 | `feat: add teacher performance metrics for admin dashboard` | `src/hooks/useTeacherMetrics.ts`, `src/pages/admin/TeacherMetrics.tsx`, `src/pages/admin/AdminUsers.tsx`, `src/App.tsx` |
| 12 | `feat: add report card PDF generation and CSV bulk user import` | `src/hooks/useReportCardData.ts`, `src/lib/generateReportCard.ts`, `src/lib/csvParser.ts`, `src/pages/admin/ReportCards.tsx`, `src/pages/admin/BulkImport.tsx`, `src/components/AppSidebar.tsx`, `src/App.tsx` |
| 13 | `test: add unit and component tests for Phase 5 features` | `src/test/hooks/*.test.ts`, `src/test/pages/*.test.tsx`, `src/test/lib/*.test.ts` |

### 10.3 Push Commands

```bash
# Create feature branch
git checkout -b feature/phase5-communication-analytics

# After all commits...
git push -u origin feature/phase5-communication-analytics

# Create PR
gh pr create \
  --title "feat: Phase 5 — Communication, Analytics & Reporting" \
  --body "## Summary
- Add discussion forums with threaded replies, pinning, and search (per-course)
- Add real-time in-class chat for live class sessions via Supabase Realtime
- Add announcement system with automatic notification trigger for enrolled students
- Add direct messaging with conversations, read receipts, and real-time updates
- Add advanced analytics dashboards for students, teachers, and admins (Recharts)
- Add student progress reports with detailed per-course breakdown and print support
- Add teacher performance metrics (grading turnaround, course activity, completion rates)
- Add attendance tracking with automated and manual recording + reports
- Add report card PDF generation with configurable grading scales
- Add CSV bulk user import with validation and duplicate detection

## Phase 5 Features
- [x] F1: Discussion Forums
- [x] F2: In-Class Chat
- [x] F3: Announcement System
- [x] F4: Direct Messaging
- [x] F5: Advanced Analytics Dashboard
- [x] F6: Student Progress Reports
- [x] F7: Teacher Performance Metrics
- [x] F8: Attendance Tracking
- [x] F9: Report Cards & Bulk User Import

## Database Changes
- 5 new Supabase migrations (forum_posts, chat_messages, announcements, conversations + direct_messages, attendance)
- 6 new tables with full RLS policies
- 1 new notification trigger (notify_on_announcement)
- 3 new Realtime publications (forum_posts, chat_messages, direct_messages)

## New Dependencies
- jspdf + jspdf-autotable (PDF generation)

## Test Plan
- [ ] Run \`npm run test\` — all passing
- [ ] Run \`npx tsc --noEmit\` — zero errors
- [ ] Run \`npm run build\` — builds successfully
- [ ] Student: forum posts + replies in enrolled courses only
- [ ] Teacher: create/pin/delete forum posts in own courses
- [ ] Chat: real-time messages between enrolled users
- [ ] Announcements: notification received by enrolled students
- [ ] DM: real-time messaging with read receipts
- [ ] Analytics: charts render with correct data
- [ ] Attendance: record and view attendance per class
- [ ] Report cards: PDF downloads correctly
- [ ] Bulk import: CSV validation and import works"
```

### 10.4 Remote Details

| Key | Value |
|-----|-------|
| Remote | `origin` |
| URL | `https://github.com/Vedang28/EVLENT-EDUCATION.git` |
| Base branch | `main` |
| Feature branch | `feature/phase5-communication-analytics` |
| GitHub user | [@Vedang28](https://github.com/Vedang28) |

---

## 11. File Inventory

### New Files (44)

| File | Type | Lines (est.) |
|------|------|-------------|
| `supabase/migrations/20260411_phase5_forum_posts.sql` | Migration | ~50 |
| `supabase/migrations/20260411_phase5_chat_messages.sql` | Migration | ~45 |
| `supabase/migrations/20260411_phase5_announcements.sql` | Migration | ~55 |
| `supabase/migrations/20260411_phase5_direct_messages.sql` | Migration | ~70 |
| `supabase/migrations/20260411_phase5_attendance.sql` | Migration | ~40 |
| `src/hooks/useForumPosts.ts` | Hook | ~90 |
| `src/hooks/useLiveClassChat.ts` | Hook | ~80 |
| `src/hooks/useConversations.ts` | Hook | ~85 |
| `src/hooks/useDirectMessages.ts` | Hook | ~90 |
| `src/hooks/useStudentAnalytics.ts` | Hook | ~100 |
| `src/hooks/useTeacherAnalytics.ts` | Hook | ~80 |
| `src/hooks/useAdminAnalytics.ts` | Hook | ~75 |
| `src/hooks/useStudentProgressReport.ts` | Hook | ~90 |
| `src/hooks/useTeacherMetrics.ts` | Hook | ~85 |
| `src/hooks/useAttendance.ts` | Hook | ~80 |
| `src/hooks/useReportCardData.ts` | Hook | ~90 |
| `src/pages/ForumPage.tsx` | Page | ~180 |
| `src/pages/Messages.tsx` | Page | ~250 |
| `src/pages/analytics/StudentAnalytics.tsx` | Page | ~200 |
| `src/pages/analytics/TeacherAnalytics.tsx` | Page | ~180 |
| `src/pages/analytics/AdminAnalytics.tsx` | Page | ~200 |
| `src/pages/teacher/StudentProgressReport.tsx` | Page | ~180 |
| `src/pages/admin/TeacherMetrics.tsx` | Page | ~170 |
| `src/pages/admin/ReportCards.tsx` | Page | ~200 |
| `src/pages/admin/BulkImport.tsx` | Page | ~220 |
| `src/components/ForumPost.tsx` | Component | ~100 |
| `src/components/ForumReplyForm.tsx` | Component | ~60 |
| `src/components/LiveClassChat.tsx` | Component | ~120 |
| `src/components/AnnouncementCard.tsx` | Component | ~50 |
| `src/components/teacher/AnnouncementManager.tsx` | Component | ~160 |
| `src/components/teacher/AttendanceManager.tsx` | Component | ~150 |
| `src/components/analytics/EngagementHeatmap.tsx` | Component | ~80 |
| `src/lib/generateReportCard.ts` | Utility | ~100 |
| `src/lib/csvParser.ts` | Utility | ~80 |
| `src/test/hooks/useForumPosts.test.ts` | Test | ~80 |
| `src/test/hooks/useLiveClassChat.test.ts` | Test | ~70 |
| `src/test/hooks/useConversations.test.ts` | Test | ~75 |
| `src/test/hooks/useDirectMessages.test.ts` | Test | ~70 |
| `src/test/hooks/useAttendance.test.ts` | Test | ~65 |
| `src/test/pages/ForumPage.test.tsx` | Test | ~90 |
| `src/test/pages/Messages.test.tsx` | Test | ~85 |
| `src/test/pages/StudentAnalytics.test.tsx` | Test | ~70 |
| `src/test/pages/ReportCards.test.tsx` | Test | ~75 |
| `src/test/pages/BulkImport.test.tsx` | Test | ~80 |
| `src/test/lib/csvParser.test.ts` | Test | ~70 |

### Modified Files (12)

| File | Change | Lines Changed (est.) |
|------|--------|---------------------|
| `src/integrations/supabase/types.ts` | Add 6 new table type definitions | +200 |
| `src/App.tsx` | Add 11 new route definitions + imports | +40 |
| `src/components/AppSidebar.tsx` | Add Messages, Analytics, Report Cards, Bulk Import nav links | +15 |
| `src/pages/CourseDetail.tsx` | Add Discussion + Announcements tabs | +30 |
| `src/pages/Dashboard.tsx` | Add announcements section | +25 |
| `src/pages/LiveClasses.tsx` | Integrate LiveClassChat component | +15 |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Add Announcements tab | +10 |
| `src/pages/teacher/TeacherLiveClasses.tsx` | Integrate LiveClassChat + AttendanceManager | +25 |
| `src/pages/teacher/TeacherStudents.tsx` | Add "View Report" link | +5 |
| `src/pages/admin/AdminUsers.tsx` | Add "View Metrics" link for teachers | +10 |
| `src/pages/Profile.tsx` | Add attendance percentage | +15 |
| `package.json` | Add jspdf + jspdf-autotable | +2 |

### Infrastructure Files

| File | Change |
|------|--------|
| `package.json` | Add jspdf, jspdf-autotable dependencies |
| `package-lock.json` | Auto-updated by npm install |

### Reference Files (read-only)

| File | Used For |
|------|----------|
| `src/hooks/useRealtimeNotifications.ts` | Realtime subscription pattern for F2 + F4 |
| `src/pages/LiveClasses.tsx` | Role-based enrollment query pattern |
| `src/pages/Dashboard.tsx` | Query + card layout + grid patterns |
| `src/pages/admin/AdminDashboard.tsx` | Recharts chart patterns |
| `src/pages/Notifications.tsx` | Mutation + cache invalidation pattern |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Tabs + Dialog + form patterns |
| `src/hooks/useUserRole.ts` | Role checking API |
| `src/hooks/useCourseProgress.ts` | Multi-query dependent data fetching |
| `src/contexts/AuthContext.tsx` | Auth state access pattern |
| `src/integrations/supabase/client.ts` | Supabase client instance |
| `supabase/migrations/20260309003520_*.sql` | Trigger function pattern for notifications |
| `src/components/AppSidebar.tsx` | Nav structure pattern |

---

## 12. Verification Checklist

### F1: Discussion Forums
- [ ] Forum page loads for enrolled course
- [ ] Top-level posts display with title, body, author, timestamp
- [ ] Threaded replies display nested under parent post
- [ ] "New Post" dialog creates a new top-level post
- [ ] Reply form creates a threaded reply with correct parent_id
- [ ] Search input filters posts by title and body
- [ ] Teacher can pin/unpin posts (pin badge appears)
- [ ] Teacher can delete any post in their course
- [ ] Student can delete only their own posts
- [ ] Admin can pin/delete any post
- [ ] Non-enrolled user cannot see forum posts (RLS)
- [ ] "Discussion" tab appears in CourseDetail

### F2: In-Class Chat
- [ ] Chat panel appears on live class cards
- [ ] Chat history loads for the specific live class
- [ ] Sending a message appears immediately for the sender
- [ ] Sent message appears in real-time for other participants
- [ ] Chat history is preserved after session ends
- [ ] Teacher can delete any chat message
- [ ] Auto-scroll to latest message on new arrival
- [ ] Non-enrolled user cannot see chat messages (RLS)

### F3: Announcement System
- [ ] Teacher can create announcement from TeacherCourseDetail
- [ ] Teacher can edit/pin/delete their announcements
- [ ] Announcement appears on student Dashboard
- [ ] Announcement appears in CourseDetail "Announcements" tab
- [ ] Pinned announcements appear first
- [ ] New announcement triggers notification for enrolled students
- [ ] Notification toast appears for students in real-time
- [ ] Non-enrolled students cannot see announcements (RLS)

### F4: Direct Messaging
- [ ] Messages page shows conversations sidebar
- [ ] "New Message" creates a new conversation with selected user
- [ ] Messages appear in correct conversation
- [ ] Sent message appears in real-time for both participants
- [ ] Read receipts update when conversation is opened
- [ ] Unread badge appears on conversations with unread messages
- [ ] "Messages" link appears in sidebar for all roles
- [ ] Only conversation participants can see messages (RLS)
- [ ] Duplicate conversations between same pair are prevented

### F5: Advanced Analytics Dashboard
- [ ] Student analytics: summary cards display correct numbers
- [ ] Student analytics: lesson completion line chart renders
- [ ] Student analytics: assignment score line chart renders
- [ ] Student analytics: engagement heatmap renders with color scale
- [ ] Student analytics: subject-wise bar chart renders
- [ ] Teacher analytics: summary cards display correct numbers
- [ ] Teacher analytics: submission/completion rate charts render
- [ ] Admin analytics: platform health metrics display
- [ ] Admin analytics: daily activity line chart renders
- [ ] Admin analytics: role distribution pie chart renders
- [ ] "Analytics" link appears in sidebar for all roles

### F6: Student Progress Reports
- [ ] Teacher can navigate to student report from TeacherStudents page
- [ ] Report displays student name and summary cards
- [ ] Per-course breakdown table shows completion %, avg score, attendance
- [ ] Score trend line chart renders
- [ ] Print button opens print dialog with clean layout

### F7: Teacher Performance Metrics
- [ ] Admin can navigate to teacher metrics from AdminUsers page
- [ ] Metrics display teacher name and summary cards
- [ ] Grading turnaround time chart renders
- [ ] Course activity frequency chart renders
- [ ] Submission/completion rate bar chart renders

### F8: Attendance Tracking
- [ ] Teacher can view attendance for a live class
- [ ] Teacher can manually check in a student
- [ ] Teacher can edit attendance duration
- [ ] Student's attendance percentage displays on Profile page
- [ ] Attendance records persist after class ends
- [ ] Students can only see their own attendance (RLS)

### F9: Report Cards & Bulk Import
- [ ] Admin can select a student for report card generation
- [ ] Grading scale toggle switches between percentage/letter/GPA
- [ ] Report card preview table renders correctly
- [ ] "Download PDF" generates and downloads a PDF file
- [ ] PDF contains school name, student name, subject breakdown, overall GPA
- [ ] CSV file upload reads and displays detected columns
- [ ] Column mapping UI allows mapping CSV columns to name/email/role
- [ ] Validation preview shows valid rows (green), errors (red), duplicates (yellow)
- [ ] Import button creates users successfully
- [ ] Duplicate emails are flagged and not imported

### Tests & Build
- [ ] `npm run test` — all tests pass
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — builds successfully with no errors
- [ ] `npx eslint .` — no lint errors on new files

### Git
- [ ] All changes committed on `feature/phase5-communication-analytics` branch
- [ ] 13 atomic commits with descriptive messages
- [ ] Pushed to `origin` (https://github.com/Vedang28/EVLENT-EDUCATION)
- [ ] PR created against `main` with summary and test plan

---

### Critical Files for Implementation
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/App.tsx` -- central routing file that needs 11 new routes
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/integrations/supabase/types.ts` -- Supabase type definitions that must be extended for all 6 new tables
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/hooks/useRealtimeNotifications.ts` -- reference pattern for all realtime subscription hooks (F2, F4)
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/components/AppSidebar.tsx` -- sidebar navigation arrays that need Messages, Analytics, Report Cards, Bulk Import links
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/supabase/migrations/20260309003520_33d4b140-71b5-4b68-a978-e68d2b1b515c.sql` -- reference pattern for notification trigger functions (F3 announcement trigger)