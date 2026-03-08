

# Plan: Student Portal MVP with Lovable Cloud

## Overview
Build the Student Portal for the LMS using Lovable Cloud (Supabase) for backend, starting with authentication, database schema, and core student-facing pages.

## Database Schema (Lovable Cloud)

Tables to create:

- **profiles** (id, user_id FK→auth.users, name, email, created_at)
- **user_roles** (id, user_id FK→auth.users, role enum: student/teacher/admin)
- **courses** (id, title, description, thumbnail_url, teacher_id, created_at)
- **enrollments** (id, student_id, course_id, created_at)
- **modules** (id, course_id, title, position, created_at)
- **lessons** (id, module_id, title, content, video_url, position, created_at)
- **assignments** (id, course_id, title, description, deadline, max_score, created_at)
- **submissions** (id, assignment_id, student_id, file_url, text_response, grade, feedback, submitted_at, graded_at)
- **live_classes** (id, course_id, teacher_id, title, meeting_url, start_time, end_time, created_at)
- **notifications** (id, user_id, type, message, is_read, created_at)

RLS policies ensuring students can only access their enrolled courses and own data. Security-definer `has_role` function for role checks.

## Pages to Build

1. **Auth Pages** — Login, Register, Password Reset, Reset Password
2. **Student Dashboard** — Enrolled courses, upcoming assignments, upcoming live classes, recent notifications
3. **My Courses** — Grid of enrolled course cards with progress
4. **Course Page** — Modules/lessons list, assignments tab, live classes tab
5. **Lesson Page** — Video player, content, downloadable materials
6. **Assignment Page** — Instructions, deadline, file upload submission
7. **Grades Page** — All grades and feedback across courses
8. **Notifications Page** — List of notifications with read/unread state
9. **Profile Page** — Edit name, change password

## Layout

- Sidebar navigation (Dashboard, My Courses, Grades, Notifications, Profile)
- Top bar with user name and logout
- Responsive — collapsible sidebar on mobile

## Implementation Order

1. **Enable Lovable Cloud** — Set up database, auth, storage
2. **Create database schema** — All tables, RLS policies, triggers (auto-create profile on signup)
3. **Auth flow** — Login, register, password reset pages with Supabase Auth
4. **App layout** — Sidebar + top bar layout with protected routes
5. **Student Dashboard** — Fetch enrolled courses, assignments, live classes
6. **Course browsing & enrollment** — Course catalog, enroll, course detail page
7. **Lesson viewer** — Video embed, content display, materials
8. **Assignment submission** — View assignment, upload file, submit
9. **Grades & feedback** — View grades across all courses
10. **Notifications** — Real-time notification display
11. **Profile management** — Edit name, change password

## Technical Details

- **Auth**: Supabase Auth with email/password. `onAuthStateChange` listener set up before `getSession()`.
- **Routing**: React Router with auth-guarded routes. Redirect unauthenticated users to `/login`.
- **State**: TanStack React Query for server state. Supabase client for all data fetching.
- **File uploads**: Supabase Storage bucket for assignment submissions.
- **Live classes**: Simple meeting URL field on `live_classes` table — renders as a link/embed on the course page.
- **Styling**: TailwindCSS + shadcn/ui components already installed.

## Seed Data

Will include sample courses, modules, lessons, and assignments so the portal is immediately usable for testing.

