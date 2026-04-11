# EVLENT EDUCATION — Product Documentation

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Feature Inventory](#5-feature-inventory)
6. [Database Schema](#6-database-schema)
7. [Implementation Phases](#7-implementation-phases)
8. [Workflows & Data Flows](#8-workflows--data-flows)
9. [Pages & Routes](#9-pages--routes)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Real-Time Features](#11-real-time-features)
12. [Security Model](#12-security-model)

---

## 1. Product Overview

**EVLENT Education** is a modern, full-featured Learning Management System (LMS) designed for schools and coaching institutions that teach subjects from **Kindergarten through Class 12** across all standard school subjects — Physics, Maths, English, Biology, Chemistry, Social Sciences, and more.

The platform connects three stakeholder groups:

| Role | Purpose |
|------|---------|
| **Students** | Browse courses, watch lessons, submit assignments, track grades, join live classes |
| **Teachers** | Create courses, build lesson content, grade assignments, schedule live classes |
| **Admins** | Manage users, moderate courses, view platform analytics, assign students to teachers |

**Key value propositions:**

- Full course lifecycle management (create → approve → enroll → learn → grade)
- Real-time notifications on grades, new content, and course status changes
- Role-based access control enforced at both UI and database level
- Progress tracking per student per course
- Live class scheduling with external meeting links (Zoom, Google Meet)
- Admin-driven course approval workflow to maintain content quality

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React (with TypeScript) | 18.3.1 |
| Build Tool | Vite (SWC plugin) | 5.4.19 |
| Styling | Tailwind CSS | 3.4.17 |
| Component Library | shadcn/ui (Radix UI primitives) | — |
| Database & Auth | Supabase (PostgreSQL) | — |
| Server State | TanStack React Query | 5.83.0 |
| Routing | React Router | 6.30.1 |
| Forms | React Hook Form | 7.61.1 |
| Validation | Zod | 3.25.76 |
| Charts | Recharts | 2.15.4 |
| Notifications | Sonner (toasts) + Supabase Realtime | — |
| Icons | Lucide React | 0.462.0 |
| Date Utilities | date-fns | 3.6.0 |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│  React SPA (Vite + React Router)                │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ AuthCtx   │ │ React    │ │ Realtime       │ │
│  │ (session) │ │ Query    │ │ Subscriptions  │ │
│  └─────┬─────┘ └────┬─────┘ └───────┬────────┘ │
└────────┼────────────┼───────────────┼───────────┘
         │            │               │
         ▼            ▼               ▼
┌─────────────────────────────────────────────────┐
│              Supabase Platform                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │   Auth   │ │ PostgREST│ │  Realtime (WS)   ││
│  │  (JWT)   │ │  (REST)  │ │  (notifications) ││
│  └──────────┘ └──────────┘ └──────────────────┘│
│  ┌──────────┐ ┌──────────────────────────────┐  │
│  │ Storage  │ │  PostgreSQL + RLS Policies   │  │
│  │ (files)  │ │  + Triggers + Functions      │  │
│  └──────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **No custom backend server** — all backend logic is handled via Supabase (PostgREST, Auth, Realtime, Storage, database functions/triggers)
- **Row Level Security (RLS)** — authorization enforced at the database layer, not just the UI
- **React Query** — manages all server state, caching, background refetching, and cache invalidation
- **AuthContext** — single source of truth for session state, wraps the entire app

---

## 4. User Roles & Permissions

### Role Assignment

- Every new user is automatically assigned the **student** role on sign-up (via database trigger `handle_new_user()`)
- Admins can promote users to **teacher** or **admin** from the Admin Portal
- A user can hold multiple roles simultaneously

### Permission Matrix

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| Browse approved courses | Yes | Yes | Yes |
| Enroll in courses | Yes | — | — |
| View lessons & content | Enrolled only | Own courses | All |
| Submit assignments | Enrolled only | — | — |
| Mark lessons complete | Yes | — | — |
| Create courses | — | Yes (pending approval) | — |
| Edit own courses | — | Yes | — |
| Add modules/lessons/assignments | — | Own courses | — |
| Grade submissions | — | Own course submissions | — |
| Schedule live classes | — | Own courses | — |
| Approve/reject courses | — | — | Yes |
| Create/delete users | — | — | Yes |
| Assign roles | — | — | Yes |
| Assign students to teachers | — | — | Yes |
| View platform analytics | — | — | Yes |
| Delete courses | — | — | Yes |

---

## 5. Feature Inventory

### 5.1 Student Portal

#### Dashboard (`/dashboard`)
- Summary stats: enrolled courses, upcoming assignments, upcoming live classes, unread notifications
- Quick-access cards linking to enrolled courses
- Upcoming assignment deadlines list
- Recent graded submissions with scores

#### Course Browsing & Enrollment (`/courses`)
- Grid view of all approved courses
- Search by course title
- One-click enroll/unenroll
- Enrollment status indicator

#### Course Content (`/courses/:courseId`)
- Tabbed interface: **Lessons** | **Assignments** | **Live Classes**
- Module-based lesson organization with ordering
- Progress bar showing % of lessons completed

#### Lesson Viewer (`/courses/:courseId/lessons/:lessonId`)
- Embedded video player (via URL)
- HTML content rendering
- "Mark as complete" toggle
- Navigation between lessons

#### Assignment Submission (`/courses/:courseId/assignments/:assignmentId`)
- Assignment details: title, description, deadline, max score
- Text response input
- File upload (stored in Supabase Storage)
- View previously submitted work
- Deadline awareness

#### Grades (`/grades`)
- Full submission history across all courses
- Filter by course
- Aggregate stats: average score, highest score, pending submissions count
- Color-coded badges: green (>=70%), orange (>=50%), red (<50%)

#### Live Classes (`/live-classes`)
- Upcoming sessions with countdown
- Join button linking to meeting URL
- Past sessions archive

#### Notifications (`/notifications`)
- Real-time notification feed
- Types: grade posted, new lesson, new assignment, course status change
- Mark as read (individual or bulk)
- Unread count badge in header

#### Profile (`/profile`)
- Update display name
- Change password

### 5.2 Teacher Portal

#### Dashboard (`/teacher`)
- Stats: total courses, enrolled students, pending submissions, upcoming classes
- Quick actions: create course, view submissions, manage students
- Pending submissions list requiring grading

#### Course Management (`/teacher/courses`, `/teacher/courses/new`)
- Create new course (title + description, submitted for admin approval)
- View all owned courses with status indicators (pending/approved/rejected)
- Edit course details

#### Course Editor (`/teacher/courses/:courseId`)
- **Modules tab**: Create, order, and manage course sections
- **Lessons tab**: Add lessons with video URLs and HTML content, ordered within modules
- **Assignments tab**: Create assignments with title, description, deadline, and max score
- **Live Classes tab**: Schedule sessions with meeting URLs and time ranges
- **Enrollments tab**: View list of enrolled students

#### Grading (`/teacher/submissions`, `/teacher/courses/:courseId/assignments/:assignmentId/submissions`)
- View all pending submissions across courses
- Per-assignment submission list
- Grade interface: assign score (0 to max), write feedback
- Grading triggers automatic student notification

#### Student Management (`/teacher/students`)
- View all students enrolled across teacher's courses
- Student count per course

#### Live Class Management (`/teacher/live-classes`)
- Schedule new classes
- View upcoming and past sessions
- Edit/delete scheduled classes

### 5.3 Admin Portal

#### Dashboard (`/admin`)
- Platform-wide statistics: total users, courses, enrollments, submissions
- Grading statistics (graded vs. pending)
- Role distribution chart (pie chart)
- Course enrollment distribution (bar chart)
- User list with role badges

#### User Management (`/admin/users`)
- View all registered users with role information
- Create new user accounts (email, name, password, role selection)
- Assign/change user roles
- Delete user accounts
- Assign students to specific teachers (mentor system via `teacher_students` table)

#### Course Moderation (`/admin/courses`)
- View all courses regardless of status
- Approve pending courses (makes them visible to students)
- Reject courses (notifies teacher)
- Delete courses
- Course analytics overview

---

## 6. Database Schema

### Entity Relationship Overview

```
auth.users ──┐
             │
  ┌──────────┴───────────┐
  │                      │
profiles            user_roles
                         │
  ┌──────────────────────┼──────────────────┐
  │                      │                  │
courses          teacher_students     enrollments
  │                                        │
  ├── modules                              │
  │     └── lessons ── lesson_progress ────┘
  │
  ├── assignments
  │     └── submissions
  │
  ├── live_classes
  │
  └── notifications
```

### Tables

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| name | TEXT | |
| email | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | Auto-updated via trigger |

#### `user_roles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| role | ENUM ('student', 'teacher', 'admin') | |
| | | Unique on (user_id, role) |

#### `courses`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| title | TEXT (required) | |
| description | TEXT | |
| thumbnail_url | TEXT | |
| teacher_id | UUID (FK → auth.users) | |
| status | TEXT ('pending', 'approved', 'rejected') | Default: 'pending' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `modules`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| course_id | UUID (FK → courses) | |
| title | TEXT | |
| position | INT | Ordering within course |
| created_at | TIMESTAMP | |

#### `lessons`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| module_id | UUID (FK → modules) | |
| title | TEXT | |
| content | TEXT | HTML content |
| video_url | TEXT | Embeddable video link |
| position | INT | Ordering within module |
| created_at | TIMESTAMP | |

#### `lesson_progress`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| student_id | UUID (FK → auth.users) | |
| lesson_id | UUID (FK → lessons) | |
| completed_at | TIMESTAMP | |
| | | Unique on (student_id, lesson_id) |

#### `assignments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| course_id | UUID (FK → courses) | |
| title | TEXT | |
| description | TEXT | |
| deadline | TIMESTAMP | |
| max_score | INT | Default: 100 |
| created_at | TIMESTAMP | |

#### `submissions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| assignment_id | UUID (FK → assignments) | |
| student_id | UUID (FK → auth.users) | |
| file_url | TEXT | Storage path |
| text_response | TEXT | |
| grade | INT (nullable) | |
| feedback | TEXT | |
| submitted_at | TIMESTAMP | |
| graded_at | TIMESTAMP (nullable) | |
| | | Unique on (assignment_id, student_id) |

#### `live_classes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| course_id | UUID (FK → courses) | |
| teacher_id | UUID (FK → auth.users) | |
| title | TEXT | |
| meeting_url | TEXT | Zoom/Meet link |
| start_time | TIMESTAMP | |
| end_time | TIMESTAMP (nullable) | |
| created_at | TIMESTAMP | |

#### `enrollments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| student_id | UUID (FK → auth.users) | |
| course_id | UUID (FK → courses) | |
| created_at | TIMESTAMP | |
| | | Unique on (student_id, course_id) |

#### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| type | TEXT ('general', 'grade', 'content', 'assignment', 'course_status') | |
| message | TEXT | |
| is_read | BOOLEAN | Default: false |
| created_at | TIMESTAMP | |

#### `teacher_students`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| teacher_id | UUID | |
| student_id | UUID | |
| assigned_at | TIMESTAMP | |
| | | Unique on (teacher_id, student_id) |

### Database Functions & Triggers

| Function | Trigger | Purpose |
|----------|---------|---------|
| `handle_new_user()` | After INSERT on auth.users | Creates profile + student role automatically |
| `update_updated_at_column()` | Before UPDATE on profiles/courses | Auto-sets `updated_at` timestamp |
| `notify_on_grade()` | After UPDATE on submissions (when grade set) | Inserts grade notification for student |
| `notify_on_new_lesson()` | After INSERT on lessons | Notifies enrolled students of new content |
| `notify_on_new_assignment()` | After INSERT on assignments | Notifies enrolled students of new assignment |
| `notify_on_course_status_change()` | After UPDATE on courses (status changed) | Notifies teacher of approval/rejection |
| `has_role(_user_id, _role)` | — (helper) | Returns boolean for RLS policies |

### Storage Buckets

| Bucket | Access | Path Format | Purpose |
|--------|--------|-------------|---------|
| `submissions` | Private (RLS) | `{userId}/{assignmentId}/{fileName}` | Assignment file uploads |

---

## 7. Implementation Phases

### Phase 1: Foundation, Authentication & App Shell

This phase establishes the entire technical foundation — project scaffolding, authentication, role-based access control, navigation, and the responsive app layout that all other phases build upon.

#### Project Setup
- Project scaffolding with Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- Supabase project setup and client integration (`src/integrations/supabase/client.ts`)
- Environment configuration (Supabase URL, API keys)
- Path aliases, TypeScript strict mode, ESLint, Vitest

#### Authentication System
- **Sign Up** (`/register`) — email + password + name, triggers email verification, auto-creates profile and student role via `handle_new_user()` database trigger
- **Login** (`/login`) — email/password authentication via Supabase Auth, session stored in localStorage with auto-refresh
- **Password Recovery** (`/forgot-password`) — email-based token sent via Supabase
- **Password Reset** (`/reset-password`) — set new password using the emailed token
- **Session Management** — `AuthContext` listens to `onAuthStateChange`, provides global user/session state, handles auto-logout on token expiry

#### Role-Based Access Control
- Three user roles: **student** (default on sign-up), **teacher**, **admin**
- `user_roles` table with unique constraint on (user_id, role) — a user can hold multiple roles
- `has_role(_user_id, _role)` database helper function used in all RLS policies
- `useUserRole()` hook fetches and exposes role checks (`isStudent`, `isTeacher`, `isAdmin`)
- `ProtectedRoute` component wraps all authenticated routes, redirects to `/login` if unauthenticated

#### Navigation & Layout
- **Responsive Sidebar** (`AppSidebar.tsx`) — collapsible on mobile, role-based navigation sections:
  - **Student items:** Dashboard, Courses, Grades, Live Classes, Calendar, Timetable
  - **Teacher items:** Teacher Dashboard, My Courses, Submissions, Live Classes, My Students
  - **Admin items:** Admin Dashboard, Users, Courses
  - "Switch View" section for users with multiple roles (e.g., Admin Portal link)
  - Notification badge with real-time unread count
- **App Header** — user greeting, notification indicator
- **404 Page** — catch-all for invalid routes
- Branding: Evlent Education logo (`src/assets/logo.jpeg`) displayed in sidebar header

#### Database Migrations
- `20260308235846` — initial schema: profiles, user_roles, courses, modules, lessons, assignments, submissions, live_classes, enrollments, notifications, storage bucket

#### Key Files
- `src/contexts/AuthContext.tsx` — session state management
- `src/components/ProtectedRoute.tsx` — route guard
- `src/components/AppSidebar.tsx` — role-based sidebar navigation
- `src/components/AppLayout.tsx` — main layout wrapper (sidebar + header)
- `src/components/NavLink.tsx` — navigation link with active state
- `src/hooks/useAuth.ts` — auth context consumer
- `src/hooks/useUserRole.ts` — role fetching and checking
- `src/pages/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
- `src/App.tsx` — all route definitions

---

### Phase 2: Core Learning Platform — Student, Teacher & Admin Portals

This phase builds the complete three-portal experience — everything students, teachers, and admins need for day-to-day course delivery, assignment workflows, grading, live classes, and platform management.

#### Student Portal

**Dashboard** (`/dashboard`)
- Summary stats cards: enrolled courses, upcoming assignments, upcoming live classes, unread notifications
- Quick-access grid of enrolled courses with progress bars
- Upcoming assignment deadlines list with due dates
- Recent graded submissions with scores

**Course Browsing & Enrollment** (`/courses`)
- Grid view of all approved courses with search by title
- One-click enroll/unenroll buttons
- Enrollment status indicator per course

**Course Detail** (`/courses/:courseId`)
- Tabbed interface: **Lessons** | **Assignments** | **Live Classes**
- Module-based lesson organization with ordering
- Progress bar showing percentage of lessons completed (via `useCourseProgress` hook)

**Lesson Viewer** (`/courses/:courseId/lessons/:lessonId`)
- Embedded video player (via URL)
- HTML content rendering
- "Mark as Complete" toggle — creates/removes `lesson_progress` record
- Navigation between lessons within the module

**Assignment Submission** (`/courses/:courseId/assignments/:assignmentId`)
- Assignment details display: title, description, deadline, max score
- Text response input field
- File upload (stored in Supabase Storage `submissions` bucket at `{userId}/{assignmentId}/{fileName}`)
- View previously submitted work if exists
- Deadline awareness display

**Grades** (`/grades`)
- Full submission history across all enrolled courses
- Filter by course
- Aggregate statistics: average score, highest score, pending submissions count
- Color-coded score badges: green (>=70%), orange (>=50%), red (<50%)

**Live Classes** (`/live-classes`)
- Upcoming sessions with join button linking to meeting URL
- Past sessions archive

**Profile** (`/profile`)
- Update display name
- Change password

#### Teacher Portal

**Dashboard** (`/teacher`)
- Stats: total courses owned, total enrolled students, pending submissions awaiting grading, upcoming live classes
- Quick action links: create course, view pending submissions, manage students
- List of pending submissions requiring grading

**Course Management** (`/teacher/courses`, `/teacher/courses/new`)
- Create new course with title + description (auto-sets status to "pending" for admin approval)
- View all owned courses with status indicators (pending/approved/rejected)
- Edit course details

**Course Editor** (`/teacher/courses/:courseId`)
- Full management interface with five tabs:
  - **Modules tab:** Create and order course sections (position-based ordering)
  - **Lessons tab:** Add lessons with video URLs and HTML content body, ordered within modules
  - **Assignments tab:** Create assignments with title, description, deadline, and max score
  - **Live Classes tab:** Schedule sessions with meeting URLs (Zoom, Google Meet) and time ranges
  - **Enrollments tab:** View list of students enrolled in the course

**Grading** (`/teacher/submissions`, `/teacher/courses/:courseId/assignments/:assignmentId/submissions`)
- View all pending submissions across all owned courses
- Per-assignment submission list with student details
- Grade interface: assign score (0 to max_score), write text feedback
- Grading automatically triggers a notification to the student via database trigger

**Student Management** (`/teacher/students`)
- View all students enrolled across the teacher's courses
- Student count per course

**Live Class Management** (`/teacher/live-classes`)
- Schedule new live class sessions
- View upcoming and past sessions
- Edit/delete scheduled classes

#### Admin Portal

**Dashboard** (`/admin`)
- Platform-wide statistics: total users, total courses, total enrollments, total submissions
- Grading statistics: graded vs. pending submissions
- Role distribution pie chart (Recharts)
- Course enrollment distribution bar chart (Recharts)
- Full user list with role badges and action buttons

**User Management** (`/admin/users`)
- View all registered users with their assigned roles
- Create new user accounts (email, name, password, role selection)
- Assign/change roles for existing users
- Delete user accounts
- Assign students to specific teachers (mentor system via `teacher_students` table)

**Course Moderation** (`/admin/courses`)
- View all courses regardless of status (pending, approved, rejected)
- Approve pending courses — makes them visible to students in course browsing
- Reject courses — sends notification to the teacher
- Delete courses
- Course analytics overview

#### Database Migrations
- `20260309001207` — admin RLS policies across all tables
- `20260309011053` — lesson progress tracking table + RLS policies
- `20260309031013` — teacher_students table for mentor assignments

#### Key Files
- `src/pages/Dashboard.tsx`, `Courses.tsx`, `CourseDetail.tsx`, `LessonPage.tsx`, `AssignmentPage.tsx`, `Grades.tsx`, `LiveClasses.tsx`, `Profile.tsx`
- `src/hooks/useCourseProgress.ts` — progress calculation
- `src/components/EnrolledCourseCard.tsx` — course card with progress bar
- `src/pages/teacher/TeacherDashboard.tsx`, `TeacherCourses.tsx`, `CreateCourse.tsx`, `TeacherCourseDetail.tsx`, `TeacherSubmissions.tsx`, `AssignmentSubmissions.tsx`, `TeacherLiveClasses.tsx`, `TeacherStudents.tsx`
- `src/pages/admin/AdminDashboard.tsx`, `AdminUsers.tsx`, `AdminCourses.tsx`

---

### Phase 3: Workflows, Notifications, Calendar & Timetable

This phase adds the course approval workflow, the real-time notification system, and the calendar/timetable views — tying together the platform's event-driven interactions and scheduling capabilities.

#### Course Approval Workflow
- Teachers create courses → status automatically set to `"pending"`
- Admins review courses from the Admin Courses page and approve or reject
- Only approved courses are visible to students in course browsing
- Teachers see their own courses regardless of status (can edit and resubmit rejected courses)
- Status transitions trigger automatic notifications to the teacher

#### Notification System
- **Database triggers** auto-generate notifications on key events:
  - `notify_on_grade()` — fires after UPDATE on submissions when grade is set, notifies the student
  - `notify_on_new_lesson()` — fires after INSERT on lessons, notifies all enrolled students
  - `notify_on_new_assignment()` — fires after INSERT on assignments, notifies all enrolled students
  - `notify_on_course_status_change()` — fires after UPDATE on courses when status changes, notifies the teacher
- **Real-time delivery** via Supabase Realtime WebSocket subscriptions (`useRealtimeNotifications` hook)
- **Toast notifications** displayed on arrival using Sonner
- **Unread count badge** in the header, updated in real-time
- **Notifications page** (`/notifications`) with mark-as-read (individual and bulk)
- Notification types: `general`, `grade`, `content`, `assignment`, `course_status`

#### Calendar Page (`/calendar`)
- Fetch events from assignments (deadlines) and live_classes (scheduled sessions)
- Display in interactive calendar component (shadcn/ui Calendar)
- Role-based filtering: students see enrolled course events, teachers see their own course events
- Day/week/month view toggles
- Click-through navigation to assignment detail or live class detail

#### Timetable Page (`/timetable`)
- Weekly grid view of all scheduled classes
- Recurring schedule support for regular class timings
- Filter by course/subject
- Print-friendly layout for physical distribution
- Class timing display with room/meeting link information

#### Database Migrations
- `20260309003520` — notification trigger functions (grade, lesson, assignment)
- `20260309003743` — course status column on courses table, split RLS policies for status-based visibility, course status change trigger

#### Key Files
- `src/hooks/useRealtimeNotifications.ts` — WebSocket subscription and cache invalidation
- `src/pages/Notifications.tsx` — notification center with read management
- `src/pages/Calendar.tsx` — calendar view with role detection
- `src/pages/Timetable.tsx` — timetable view with role detection

---

### Phase 4: Subject Management, Advanced Content & Assessments

This phase introduces the K-12 subject/grade-level taxonomy, upgrades content creation tools, and adds a full quiz engine — making the platform curriculum-aware and assessment-rich.

#### Subject & Grade-Level Management

The platform covers K-12 education across all standard school subjects:
- **Sciences:** Physics, Chemistry, Biology
- **Mathematics**
- **Languages:** English (and potentially others)
- **Social Sciences:** History, Geography, Civics, Economics
- **Additional subjects** as needed per curriculum

**Features:**
- Subject/category tagging for courses — each course is linked to a subject and grade level
- Class/grade level assignment from Kindergarten (KG) through Class 12
- Subject-wise filtering in course browsing — students can filter by "Physics", "Class 10", etc.
- Grade-level appropriate content organization — courses grouped by class level
- Curriculum alignment tracking — map courses to syllabus topics
- Subject-based teacher assignment — teachers are associated with their subject expertise
- Class-wise student grouping and batch management — students grouped by their class/grade

**Database additions:**
- `subjects` table — id, name, description, icon
- `grade_levels` table — id, name (e.g., "KG", "Class 1", ..., "Class 12"), position (for ordering)
- Foreign keys from courses to subjects and grade_levels
- Filtering indexes for performant course browsing

#### Rich Content Editor
- WYSIWYG editor replacing raw HTML input for lesson content
- Formatting toolbar: bold, italic, headings, lists, links
- Image embedding directly in lesson content
- Math equation support (LaTeX rendering) for science and math lessons
- Code block support for computer science content

#### Course Thumbnails
- Image upload for course cards via Supabase Storage
- Thumbnail preview in course browsing grid
- Default placeholder when no thumbnail is set

#### Quiz Engine
- Teachers can create auto-graded assessments within courses
- Multiple question types:
  - **Multiple choice (MCQ)** — single or multi-select answers
  - **Fill-in-the-blank** — text input with expected answer matching
  - **True/False** — binary choice questions
  - **Matching** — pair items from two columns
  - **Short answer** — keyword-based matching for partial credit
- Quiz settings: time limit, attempt limit, randomize question order, show/hide correct answers after submission
- Automatic scoring with instant results for students
- Teachers can review quiz analytics: average scores, question-level difficulty, common wrong answers

#### Enhanced Video Player
- Improved video controls: playback speed adjustment (0.5x to 2x), volume, fullscreen
- Video progress tracking within lessons — resume from where the student left off
- Support for multiple video sources (YouTube, Vimeo, direct MP4 URLs)

#### Secure File Access
- Signed URLs for secure download of assignment submission files by teachers
- Time-limited download links that expire after a set duration
- File type validation on upload

---

### Phase 5: Communication, Analytics & Reporting

This phase adds platform-wide communication tools, deep analytics dashboards, automated attendance tracking, report card generation, and bulk administrative operations.

#### Discussion Forums
- Per-course threaded discussion boards
- Students and teachers can post questions, replies, and share resources
- Threaded replies with parent/child post structure
- Pin important posts to the top of the forum
- Search within forum posts

**Database:** `forum_posts` table — id, course_id, author_id, parent_id (for threading), title, body, created_at

#### In-Class Chat
- Real-time messaging during live class sessions via Supabase Realtime channels
- Messages scoped to the specific live class session
- Chat history preserved after the session ends
- Teacher can moderate (delete inappropriate messages)

**Database:** `chat_messages` table — id, live_class_id, sender_id, message, sent_at

#### Announcement System
- Teachers can post course-wide announcements
- Announcements appear prominently on enrolled students' dashboards
- Pin/unpin important announcements
- Announcements trigger notifications to all enrolled students

**Database:** `announcements` table — id, course_id, teacher_id, title, body, pinned, created_at

#### Direct Messaging
- One-to-one messaging between teachers and students for private academic discussions
- Message history with read receipts
- Real-time delivery via Supabase Realtime

#### Advanced Analytics Dashboard
- **Student progress trends** — line charts showing lesson completion and assignment scores over time
- **Engagement heatmaps** — visualize when students are most active on the platform
- **Subject-wise performance comparisons** — compare scores across subjects for a given student or class
- **Platform health metrics** — active users, daily sign-ins, course activity rates

#### Student Progress Reports
- Per-student detailed view showing:
  - Lesson completion percentages per course
  - Assignment scores with trend lines
  - Attendance records
  - Engagement metrics (time spent, login frequency)
  - Strengths and areas for improvement

#### Teacher Performance Metrics
- Grading turnaround time — average time between submission and grade
- Course activity — frequency of new content/assignments
- Student satisfaction indicators
- Submission and completion rates per course

#### Attendance Tracking
- Automated attendance from live class participation — track who joined and for how long
- Manual override by teachers for corrections
- Attendance reports per course, per student, per time period
- Attendance percentage displayed on student profiles and progress reports

#### Report Cards
- PDF generation per student per term
- Configurable grading scales (percentage, letter grade, GPA)
- Subject-wise breakdown with individual teacher remarks
- Overall performance summary with class rank (optional)
- Downloadable and printable format

#### Bulk User Import
- CSV upload for mass creation of student/teacher accounts
- Column mapping: name, email, role, class/grade level, assigned teacher
- Validation and error reporting — highlight invalid rows before import
- Duplicate detection based on email
- Import summary with success/failure counts

---

### Phase 6: Parent Portal, Mobile App & Platform Expansion

This phase extends the platform beyond the classroom — adding parent/guardian access, a mobile companion app, multi-language support, payment integration, and AI-powered tutoring.

#### Parent/Guardian Portal
- Dedicated portal view for parents to monitor their child's academic progress:
  - View enrolled courses and completion percentages
  - See grades, assignment submissions, and teacher feedback
  - View upcoming assignments and live class schedule
  - Receive notifications on grade postings, attendance, and announcements
- **Parent-Teacher Communication** — dedicated messaging channel between parents and teachers for academic discussions
- **Student Linking** — admin or teacher can link parent accounts to student accounts with relationship type (mother, father, guardian)
- **Access Controls** — parents have read-only access to their linked student's data; they cannot submit assignments, enroll in courses, or modify anything

**Database additions:**
- `parent_students` table — id, parent_id, student_id, relationship, verified, linked_at
- `parent` role added to user_roles ENUM
- RLS policies granting parents read access to linked student's enrollments, submissions, grades, notifications, and attendance

#### Mobile Application
- React Native companion app providing full mobile access:
  - **Push notifications** for grades, new assignments, live class reminders, and announcements
  - **Offline lesson caching** — download lesson content for reading without internet
  - **Camera-based assignment submission** — photograph handwritten work and upload directly
  - **Live class join** via mobile with meeting URL deep-linking
  - **Student dashboard** — stats, enrolled courses, grades, and upcoming deadlines
  - **Teacher mobile view** — quick grading, submission review, and class scheduling on the go

#### Multi-Language Support
- i18n framework for regional languages:
  - Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, and more
  - Language toggle in profile settings
  - Translated UI labels, navigation, and system messages
  - Content remains in the language the teacher creates it in (no auto-translation of course content)

#### Payment Integration
- Fee management and subscription billing:
  - **Course-level pricing** — individual course fees
  - **Platform-level subscriptions** — monthly/yearly access plans
  - **Payment gateway integration** — Razorpay and Stripe support
  - **Invoice generation** — automatic invoices on payment
  - **Payment history** — students and parents can view transaction records
  - **Subscription management** — renew, upgrade, downgrade, cancel
  - **Admin fee dashboard** — revenue reports, outstanding payments, collection rates

#### AI-Powered Tutoring
- **Subject-specific chatbot** — AI assistant for doubt clearing across Physics, Maths, Chemistry, Biology, English, and Social Sciences
- **Content recommendations** — suggest lessons and courses based on student progress, weak areas, and learning patterns
- **Auto-generated practice questions** — create practice sets from lesson content for revision
- **Performance insights** — AI-generated summaries of student strengths and areas needing attention, shared with teachers and parents

---

## 8. Workflows & Data Flows

### Course Lifecycle

```
Teacher creates course
        │
        ▼
  status = "pending"
        │
        ▼
Admin reviews course ──► Reject ──► Teacher notified
        │                              (can edit & resubmit)
        ▼
     Approve
        │
        ▼
  status = "approved"
  Teacher notified
        │
        ▼
  Visible to students
        │
        ▼
  Students enroll
        │
        ▼
  Access lessons, assignments, live classes
```

### Assignment Submission & Grading

```
Teacher creates assignment
        │
        ▼
Enrolled students notified (auto-trigger)
        │
        ▼
Student opens assignment page
        │
        ▼
Student submits (text and/or file)
        │
        ├──► File uploaded to Supabase Storage
        └──► Submission record created in DB
                │
                ▼
        Teacher sees pending submission
                │
                ▼
        Teacher reviews and grades
        (score + feedback)
                │
                ▼
        Student notified (auto-trigger)
                │
                ▼
        Grade visible in Grades page + Dashboard
```

### Progress Tracking

```
Student opens lesson
        │
        ▼
Watches video / reads content
        │
        ▼
Clicks "Mark as Complete"
        │
        ▼
lesson_progress record created
        │
        ▼
useCourseProgress() recalculates %
        │
        ▼
Progress bar updates in:
  - Course detail page
  - Dashboard enrolled courses
  - Course card component
```

### Notification Pipeline

```
Database event occurs:
  ├── Submission graded (UPDATE submissions SET grade)
  ├── New lesson added (INSERT lessons)
  ├── New assignment created (INSERT assignments)
  └── Course status changed (UPDATE courses SET status)
        │
        ▼
Database trigger fires
        │
        ▼
Notification row inserted into notifications table
        │
        ▼
Supabase Realtime broadcasts change
        │
        ▼
useRealtimeNotifications() receives event
        │
        ├──► Toast notification displayed
        ├──► React Query cache invalidated
        └──► Unread count badge updated
```

---

## 9. Pages & Routes

### Public Routes

| Path | Page | Description |
|------|------|-------------|
| `/login` | Login | Email/password sign-in |
| `/register` | Register | New account creation |
| `/forgot-password` | ForgotPassword | Initiate password recovery |
| `/reset-password` | ResetPassword | Set new password via token |

### Student Routes (Protected)

| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | Student home with stats and quick links |
| `/courses` | Courses | Browse and enroll in approved courses |
| `/courses/:courseId` | CourseDetail | View course content (lessons, assignments, classes) |
| `/courses/:courseId/lessons/:lessonId` | LessonPage | Watch/read lesson, mark complete |
| `/courses/:courseId/assignments/:assignmentId` | AssignmentPage | Submit assignment (text/file) |
| `/grades` | Grades | View all graded submissions |
| `/live-classes` | LiveClasses | View and join live sessions |
| `/calendar` | Calendar | Calendar view |
| `/timetable` | Timetable | Timetable view |
| `/notifications` | Notifications | All notifications with read management |
| `/profile` | Profile | Account settings |

### Teacher Routes (Protected)

| Path | Page | Description |
|------|------|-------------|
| `/teacher` | TeacherDashboard | Teacher home with stats and pending work |
| `/teacher/courses` | TeacherCourses | List of teacher's courses |
| `/teacher/courses/new` | CreateCourse | Create new course form |
| `/teacher/courses/:courseId` | TeacherCourseDetail | Full course editor |
| `/teacher/submissions` | TeacherSubmissions | All pending submissions |
| `/teacher/courses/:courseId/assignments/:assignmentId/submissions` | AssignmentSubmissions | Grade specific assignment |
| `/teacher/live-classes` | TeacherLiveClasses | Manage live classes |
| `/teacher/students` | TeacherStudents | View enrolled students |

### Admin Routes (Protected)

| Path | Page | Description |
|------|------|-------------|
| `/admin` | AdminDashboard | Platform analytics |
| `/admin/users` | AdminUsers | User management |
| `/admin/courses` | AdminCourses | Course moderation |

### Utility Routes

| Path | Behavior |
|------|----------|
| `/` | Redirects to `/dashboard` |
| `/*` | 404 Not Found page |

---

## 10. UI/UX Design System

### Component Library

**shadcn/ui** — 50+ components built on Radix UI primitives, fully customizable via Tailwind CSS. Located in `src/components/ui/`.

Key components in use:
- **Layout:** Sidebar (collapsible), Card, Separator
- **Forms:** Input, Label, Button, Textarea, Select, Checkbox
- **Feedback:** Toast (Sonner), Dialog, Alert Dialog, Progress
- **Data Display:** Table, Badge, Tabs, Pagination
- **Charts:** BarChart, PieChart (Recharts)
- **Navigation:** Breadcrumb, Navigation Menu

### Theming

- CSS custom properties (HSL color values) defined in `src/index.css`
- Dark mode support via `darkMode: "class"` in Tailwind config
- Custom sidebar color scheme
- Primary, secondary, accent, destructive, and muted color tokens

### Responsive Design

- Mobile-first approach using Tailwind breakpoints (sm, md, lg, xl)
- Collapsible sidebar on small screens
- Adaptive grid layouts (1 → 2 → 3 columns)
- Touch-friendly interactive elements

### Branding

- Logo: `src/assets/logo.jpeg` (Evlent Education branding)
- Displayed in sidebar header

---

## 11. Real-Time Features

### Supabase Realtime Subscriptions

The `useRealtimeNotifications()` hook establishes a persistent WebSocket connection to Supabase Realtime:

- **Listens to:** INSERT and UPDATE events on the `notifications` table
- **Filters by:** current user's `user_id`
- **On event:**
  - Displays a toast notification via Sonner
  - Invalidates relevant React Query caches (notifications list, unread count)
  - UI updates immediately without page refresh

### Notification Types

| Type | Trigger Event | Message Example |
|------|--------------|-----------------|
| `grade` | Submission graded | "Your assignment has been graded" |
| `content` | New lesson added | "New lesson available in [course]" |
| `assignment` | New assignment created | "New assignment posted in [course]" |
| `course_status` | Course approved/rejected | "Your course has been approved/rejected" |
| `general` | Manual/admin | Custom message |

---

## 12. Security Model

### Authentication Security

- Supabase Auth handles password hashing, JWT token management, and session lifecycle
- Tokens stored in `localStorage` with automatic refresh
- Email verification on sign-up
- Secure password reset via email tokens

### Row Level Security (RLS)

Every table has RLS enabled with policies that enforce:

- **Students** can only read/write their own data (submissions, enrollments, progress, notifications)
- **Teachers** can manage resources within their own courses
- **Admins** have broad read/write access for platform management
- The `has_role()` database function is used in RLS policies for role checks

### Storage Security

- The `submissions` bucket is private
- Path-based RLS: students can only upload to `{their_user_id}/` prefix
- Teachers can read submissions for courses they own

### Frontend Security

- Protected routes redirect unauthenticated users to `/login`
- Role-based UI rendering hides unauthorized navigation items
- Form validation via Zod schemas before submission

---

*EVLENT Education — Product Documentation*
