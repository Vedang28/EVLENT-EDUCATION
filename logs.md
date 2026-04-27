# EVLENT EDUCATION — Session Logs

> **Purpose:** This file logs every action taken by Claude Code across sessions. Each entry includes what was done, why, and teaching notes. New sessions should read this file first to pick up where we left off.
>
> **Format:** Each log entry follows this structure:
> ```
> ### Log N — Short Title
> **Time:** When this happened
> **Action:** What was done and why.
>
> **What happened:**
> 1. Step-by-step details of what was done
> 2. Commands run, files created/modified/deleted
> 3. Results and outcomes
>
> **Teaching notes:**
> - Explain concepts so the reader learns from what was done
> - Why this approach was chosen over alternatives
> - Gotchas or patterns worth remembering
> ```

---

## Session: 2026-04-11

### Log 1 — Logs Initialized
**Time:** Session start
**Action:** Created `logs.md` to track all development activity across sessions.

**Teaching notes:**
- Every session should start by reading this file to understand prior context.
- Every action (file create, edit, delete, command, config change) gets a numbered log entry.
- Teaching notes help anyone picking up the project understand not just *what* was done but *why*.

---

### Log 2 — Session Rules Saved to Memory
**Time:** 2026-04-11
**Action:** Saved comprehensive session rules to Claude's persistent memory system so they apply in all future sessions.

**What happened:**
1. Updated `memory/feedback_logs_tracking.md` with full rules: session start (read logs.md), logging format, teaching notes requirement, `/workflow` for features, session-end saves to `sessions/sessionN.md`.
2. Created `memory/user_developer_profile.md` capturing that the user is a developer who wants educational explanations.
3. Updated `memory/MEMORY.md` index with both entries.

**Teaching notes:**
- Claude's memory system uses markdown files in `.claude/projects/.../memory/`. A `MEMORY.md` index file is loaded at the start of every conversation, pointing to detailed memory files.
- Memories persist across sessions — these rules will be followed automatically in future conversations without needing to repeat them.
- Memory types: `feedback` (how to work), `user` (who the user is), `project` (ongoing work context), `reference` (external pointers).

---

### Log 3 — Phase 3 Bug Fix: Course Approval Filter (F1.5)
**Time:** 2026-04-11
**Action:** Fixed student browse page to only show approved courses.

**What happened:**
1. Edited `src/pages/Courses.tsx` line 20: added `.eq("status", "approved")` to the Supabase query
2. Updated queryKey from `["all-courses"]` to `["all-courses", "approved"]` for proper cache isolation

**Teaching notes:**
- **Defense in depth:** Even though RLS policies might restrict what students see, the query-level filter ensures the UI never shows pending/rejected courses. This is a common pattern — server-side access control (RLS) + client-side query filtering.
- **Query key includes filter parameters:** React Query caches by key, so including `"approved"` ensures the cache distinguishes between filtered and unfiltered queries. If an admin page fetches all courses (no filter), the caches won't collide.

---

### Log 4 — Route Cleanup: Remove Duplicate Routes (R1+R2)
**Time:** 2026-04-11
**Action:** Removed duplicate `/calendar` and `/timetable` route definitions from `src/App.tsx`.

**What happened:**
1. Lines 96-97 in `App.tsx` had duplicate route entries for `/calendar` and `/timetable` under the teacher routes section
2. Deleted both — the primary routes at lines 74-75 (student section) already handle these for all authenticated users

**Teaching notes:**
- **React Router matching:** When two `<Route>` elements have the same `path`, React Router renders the first match. The duplicates were harmless but confusing — they'd never render because the earlier routes already matched.
- **Routes inside `<ProtectedRoute>` apply to all authenticated users**, not just students. The section comments ("Student routes", "Teacher routes") are organizational, not access-control boundaries.

---

### Log 5 — Test Infrastructure: Vitest + jsdom Setup
**Time:** 2026-04-11
**Action:** Configured Vitest for React component testing.

**What happened:**
1. Installed `jsdom` dev dependency (browser environment for tests)
2. Added `test` block to `vite.config.ts`: `{ environment: "jsdom", globals: true, setupFiles: ["./src/test/setup.ts"] }`
3. `src/test/setup.ts` already existed with `@testing-library/jest-dom` import and `matchMedia` mock

**Teaching notes:**
- **jsdom** simulates a browser DOM in Node.js. Without it, React components can't render in tests because there's no `document` or `window`.
- **`globals: true`** makes Vitest's `describe`, `it`, `expect` available without importing — matches the Jest convention many tutorials use.
- **`setupFiles`** runs before every test file. The `jest-dom` import adds matchers like `.toBeInTheDocument()` and `.toHaveAttribute()`.

---

### Log 6 — Build: useCalendarEvents Hook (F3.1–F3.4)
**Time:** 2026-04-11
**Action:** Created `src/hooks/useCalendarEvents.ts` — role-based data fetching for calendar events.

**What happened:**
1. Created hook accepting `selectedMonth: Date`
2. Step 1: Fetches course IDs — students via `enrollments`, teachers via `courses.teacher_id`
3. Step 2: Fetches `assignments` for the month range using `.in("course_id", courseIds).gte("deadline", monthStart).lte("deadline", monthEnd)`
4. Step 3: Fetches `live_classes` with the same pattern on `start_time`
5. Normalizes both into a unified `CalendarEvent[]` interface
6. Extracts `eventDates: Date[]` for calendar widget highlighting

**Teaching notes:**
- **Dependent queries with `enabled` flag:** The assignments/live_classes queries have `enabled: !!courseIds && courseIds.length > 0`. This prevents the query from firing before courseIds resolve, avoiding empty `.in()` calls.
- **`parseISO` from date-fns:** Supabase returns ISO strings. `parseISO` converts them to proper `Date` objects for `isSameDay` comparisons. Using `new Date()` constructor also works but `parseISO` is more explicit and handles edge cases.
- **Unified event type:** Both assignments and live classes become `CalendarEvent` objects with a `type` discriminator — lets the UI render different card styles with a single array.

---

### Log 7 — Build: Calendar.tsx Full Rewrite (F3.5–F3.11)
**Time:** 2026-04-11
**Action:** Rewrote `src/pages/Calendar.tsx` from 16-line stub to full interactive calendar page.

**What happened:**
1. Left panel: shadcn `Calendar` widget with `modifiers={{ hasEvent: eventDates }}` to highlight days with events
2. Right panel: Event list filtered by `isSameDay(event.date, selectedDay)` using `useMemo`
3. Assignment cards: orange badge + title + course + deadline + "View" link to assignment page
4. Live class cards: blue badge + title + course + time range + "Join" button (if meetingUrl)
5. Empty state with `CalendarOff` icon, loading spinner matching existing design
6. Responsive: `flex flex-col md:flex-row` — stacked mobile, side-by-side desktop

**Teaching notes:**
- **react-day-picker modifiers:** The `modifiers` prop accepts `{ hasEvent: Date[] }` — any day matching a date in the array gets the CSS class from `modifiersClassNames.hasEvent`. This is how we highlight days with events without custom rendering.
- **`useMemo` for filtering:** `dayEvents` is memoized to avoid re-filtering on every render. The dependency array `[events, selectedDay]` ensures it only recomputes when the event list or selected day changes.
- **Security:** Meeting URLs use `target="_blank" rel="noopener noreferrer"` matching the existing pattern in `LiveClasses.tsx`.

---

### Log 8 — Build: useTimetableClasses Hook (F4.1–F4.2)
**Time:** 2026-04-11
**Action:** Created `src/hooks/useTimetableClasses.ts` — role-based fetching for weekly timetable.

**What happened:**
1. Same role-based course ID resolution pattern as calendar hook
2. Fetches `live_classes` within week range using `startOfWeek/endOfWeek` with `{ weekStartsOn: 1 }` (Monday)
3. Normalizes into `TimetableClass[]` with computed `dayOfWeek` (0=Mon) and `startHour`
4. Extracts unique courses for filter dropdown

**Teaching notes:**
- **Week start convention:** JavaScript's `getDay()` returns 0=Sunday. Our timetable starts on Monday, so the conversion is: `jsDay === 0 ? 6 : jsDay - 1`. This maps Mon=0, Tue=1, ... Sun=6.
- **`startOfWeek({ weekStartsOn: 1 })`:** date-fns defaults to Sunday as week start. Passing `weekStartsOn: 1` aligns with the Mon–Sat grid.
- **Course deduplication:** Uses a `Map<courseId, course>` to efficiently extract unique courses from the class list — O(n) instead of nested loops.

---

### Log 9 — Build: Timetable.tsx Full Rewrite (F4.3–F4.10)
**Time:** 2026-04-11
**Action:** Rewrote `src/pages/Timetable.tsx` from 14-line stub to full weekly timetable with grid view.

**What happened:**
1. Week navigation: Prev/Next/Today buttons with `subWeeks`/`addWeeks`/`startOfWeek(new Date())`
2. Course filter: `Select` dropdown with "All Courses" + unique course titles
3. Grid: `Table` with time column (08:00–20:00) and day columns (Mon–Sat with dates)
4. Cell rendering: lookup map `${dayOfWeek}-${hour}` → TimetableClass[] for O(1) cell access
5. Class cards: color-coded by course, `Tooltip` for full details, meeting URL link
6. Print support: `window.print()` button, `print:hidden` on controls
7. Mobile: `ScrollArea` with horizontal scrollbar

**Teaching notes:**
- **Cell lookup map:** Instead of iterating all classes for every cell (O(cells × classes)), we pre-build a `Map<"day-hour", class[]>` in `useMemo`. Each cell does a single `map.get()` — much more efficient for a 13×6 grid.
- **Color assignment:** `courseColorMap` assigns consistent colors per course using modulo indexing: `CLASS_COLORS[i % CLASS_COLORS.length]`. This is simpler than hashing and deterministic within a render.
- **Print CSS:** Tailwind's `print:` variant maps to `@media print { ... }`. Adding `print:hidden` to nav elements hides them when printing — no custom CSS needed.

---

### Log 10 — Tests: Unit + Component Tests (22 tests)
**Time:** 2026-04-11
**Action:** Wrote and ran test suite for all Phase 3 new code.

**What happened:**
1. Created `src/test/hooks/useCalendarEvents.test.ts` — 5 tests (empty state, fetch + normalize, eventDates, teacher mode)
2. Created `src/test/hooks/useTimetableClasses.test.ts` — 5 tests (empty state, fetch, dayOfWeek/startHour, course dedup, teacher mode)
3. Created `src/test/pages/Calendar.test.tsx` — 6 tests (render, loading, empty, assignment badge, live class join, navigation link)
4. Created `src/test/pages/Timetable.test.tsx` — 6 tests (day headers, time slots, empty, class display, print button, today button)
5. All 22 tests passing

**Teaching notes:**
- **Supabase mock pattern:** We built a "thenable chain" mock — an object that has both query builder methods (`.select()`, `.eq()`, `.in()`, etc.) AND a `.then()` method. This matches how Supabase's PostgREST client works: the chain is awaitable but also chainable.
- **Why `.then()` on the chain:** React Query `await`s the query function return value. Supabase builders are thenable (they implement `.then()`), so `await supabase.from(...).select(...).eq(...)` works. Our mock needs the same behavior — without `.then()`, the awaited value would be the chain object, not the data.
- **Component tests mock the hook, not Supabase:** Page tests mock `useCalendarEvents`/`useTimetableClasses` directly. This is faster and more focused — we already tested the hooks separately. Testing the hooks tests the Supabase interaction; testing the pages tests the UI rendering.

---

### Log 11 — QA: Type Check + Build + Review + Audit
**Time:** 2026-04-11
**Action:** Full QA pass on all Phase 3 changes.

**What happened:**
1. `npx tsc --noEmit` — 0 errors (clean type check)
2. `npm run build` — successful production build
3. `npx vitest run` — 22/22 tests passing
4. Code review agent: checked for correctness, patterns, performance
5. Security audit agent: checked OWASP Top 10, auth, XSS, injection

**Teaching notes:**
- **QA pipeline order:** Type check → Build → Tests → Review → Audit. Type errors are cheapest to find, so they go first. Build catches module resolution and bundling issues. Tests verify behavior. Review and audit catch logic and security issues.
- **The chunk size warning** in build output is pre-existing (the bundle is >500KB). This is common for SPAs with many routes — code splitting with `React.lazy()` could fix it but is out of scope for Phase 3.

---

### Log 12 — Created `/phase4` Custom Command
**Time:** 2026-04-11
**Action:** Created `.claude/commands/phase4.md` — a slash command to trigger the EVLENT workflow for each Phase 4 feature.

**What happened:**
1. Created `.claude/commands/phase4.md` accepting arguments `F1`–`F6` or `all`
2. Each argument maps to a `/workflow` call scoped to that feature with a reference to `PHASE4_PLAN.md`
3. The `all` option chains F1–F6 sequentially with approval gates between features
4. Includes build order notes, progress tracking format, and help text

**Teaching notes:**
- **Custom commands in `.claude/commands/`** become slash commands (e.g., `/phase4`) automatically. The `$ARGUMENTS` placeholder captures user input after the command name.
- **Layered commands:** `/phase4 F1` triggers `/workflow`, which triggers specialized agents (planner, scaffold, test-writer, etc.). Each layer adds specificity — `/phase4` knows the feature, `/workflow` knows the pipeline, agents know their specialization.
- **Recommended approach:** One feature per session to avoid context window limits and maintain clean git history.

---

### Log 13 — Session 1 Saved
**Time:** 2026-04-11
**Action:** Saved conversation history to `sessions/session1.md`.

---

## Session: 2026-04-11 (Session 2)

### Log 14 — Phase 4 F1: Subject & Grade-Level Management
**Time:** 2026-04-11
**Action:** Built and shipped Phase 4 F1 — full subject and grade-level management system.

**What happened:**
1. **Migration** (`supabase/migrations/20260411300000_phase4_subjects_grades.sql`):
   - Created `subjects` table (id, name, description, icon) with RLS (anyone SELECT, admin-only write)
   - Created `grade_levels` table (id, name, position) with RLS (anyone SELECT, admin-only write)
   - Created `teacher_subjects` junction table with RLS (anyone SELECT, teachers manage own)
   - Added `subject_id` and `grade_level_id` FK columns to `courses`
   - Added `grade_level_id` FK column to `profiles`
   - Seeded 15 subjects and 13 grade levels (KG through Class 12)

2. **Types** (`src/integrations/supabase/types.ts`):
   - Added `subjects`, `grade_levels`, `teacher_subjects` table types
   - Updated `courses` type with `subject_id`, `grade_level_id` + relationship metadata
   - Updated `profiles` type with `grade_level_id` + relationship metadata

3. **Hooks** (2 new files):
   - `src/hooks/useSubjects.ts` — fetches all subjects ordered by name, 5min staleTime
   - `src/hooks/useGradeLevels.ts` — fetches all grade levels ordered by position, 5min staleTime

4. **UI Changes** (5 modified files):
   - `Courses.tsx` — added subject/grade filter dropdowns with `useMemo` filtering + badges on cards
   - `CreateCourse.tsx` — added subject/grade `Select` components in form
   - `TeacherCourseDetail.tsx` — shows subject/grade badges + inline edit selects
   - `Profile.tsx` — student grade-level select + teacher subject expertise multi-select with add/remove
   - `AppSidebar.tsx` — added "Subjects" and "Grade Levels" to adminNav

5. **Admin Pages** (2 new files):
   - `AdminSubjects.tsx` — CRUD table with add/edit/delete dialogs, input validation
   - `AdminGradeLevels.tsx` — CRUD table with position ordering, add/edit/delete dialogs

6. **Routes** (`App.tsx`):
   - Added lazy imports for `AdminSubjects` and `AdminGradeLevels`
   - Added `/admin/subjects` and `/admin/grade-levels` routes with `RoleGuard`

7. **Tests** (4 new test files, 16 new tests):
   - `useSubjects.test.ts` — 3 tests (empty, fetch+order, error)
   - `useGradeLevels.test.ts` — 3 tests (empty, fetch+order, error)
   - `AdminSubjects.test.tsx` — 4 tests (title, table data, empty state, headers)
   - `AdminGradeLevels.test.tsx` — 5 tests (title, table data, empty state, headers, positions)

8. **QA**: type check (0 errors), build (success), 38/38 tests passing, security review (all PASS), audit (clean)

**Commit:** `8844043` pushed to `main`

**Teaching notes:**
- **Typed Supabase joins:** When using `.select("*, subjects(id, name)")`, Supabase returns a joined object but the TypeScript client types it as the base row. We define `CourseWithJoins` that extends `CourseRow` with the joined shape and cast the result — this gives proper type safety without `as any`.
- **`staleTime` on reference data:** Subjects and grade levels rarely change. Setting `staleTime: 5 * 60 * 1000` (5 minutes) means React Query won't refetch them on every component mount, reducing unnecessary API calls.
- **Junction table pattern:** `teacher_subjects` uses a many-to-many junction table instead of a TEXT[] array on profiles. This allows RLS per-row, referential integrity via FK constraints, and efficient querying with JOINs.
- **Delete button `disabled` guard:** Without `disabled={deleteMutation.isPending}`, rapid double-clicking can fire duplicate DELETE requests. The second one would fail (row already deleted) but causes an unnecessary error toast.

---

### Log 15 — Session 2 Saved
**Time:** 2026-04-11
**Action:** Saved conversation history to `sessions/session2.md`.

---

## Session: 2026-04-27 (Session 3+)

### Log 16 — Phase 4 F2: Rich Content Editor (recap)
**Time:** 2026-04-27
**Action:** Previously built TipTap WYSIWYG editor, RichTextViewer, and integrated into lesson creation/viewing.

---

### Log 17 — Phase 4 F3: Course Thumbnails (recap)
**Time:** 2026-04-27
**Action:** Previously built ImageUpload component, Supabase Storage bucket, and thumbnail integration across course pages.

---

### Log 18 — Admin-Controlled Student Grade Levels (recap)
**Time:** 2026-04-27
**Action:** Moved student grade level assignment from student self-service to admin-only. Profile.tsx grade is now read-only; AdminUsers.tsx has the grade selector.

---

### Log 19 — Seed Data Created (recap)
**Time:** 2026-04-27
**Action:** Created `supabase/seed.sql` with 3 courses, 6 modules, 12 lessons, 4 assignments, 4 live classes, 3 enrollments. Created `.env.local` for local Supabase. Test accounts: student/teacher/admin @test.com (Test1234!).

---

### Log 20 — Phase 4 F4: Quiz Engine
**Time:** 2026-04-27
**Action:** Built the full quiz engine — database, types, hooks, teacher quiz builder, student quiz-taking UI, auto-grading, and results page.

**What happened:**
1. **Migration** (`supabase/migrations/20260411500000_phase4_quiz_engine.sql`):
   - Created `quizzes` table (id, course_id, title, description, time_limit, attempt_limit, randomize, show_answers)
   - Created `quiz_questions` table (id, quiz_id, type CHECK mcq/true_false/fill_blank, question_text, options JSONB, correct_answer JSONB, points, position)
   - Created `quiz_attempts` table (id, quiz_id, student_id, answers JSONB, score, max_score, started_at, completed_at)
   - RLS: teachers manage quizzes/questions for own courses; students can attempt quizzes in enrolled courses and view own attempts; teachers see attempts for their courses

2. **Types** (`src/integrations/supabase/types.ts`):
   - Added `quizzes`, `quiz_questions`, `quiz_attempts` table types with full Row/Insert/Update/Relationships

3. **Hooks** (3 new files):
   - `src/hooks/useQuizzes.ts` — fetches quizzes for a course
   - `src/hooks/useQuizQuestions.ts` — fetches questions for a quiz ordered by position
   - `src/hooks/useQuizAttempts.ts` — fetches attempts by student for a quiz

4. **Validations** (`src/lib/validations.ts`):
   - Added `quizSchema` (title, description, time_limit, attempt_limit, randomize, show_answers)
   - Added `quizQuestionSchema` (type enum, question_text, options, correct_answer union type, points)

5. **QuizBuilder** (`src/components/QuizBuilder.tsx`):
   - Teacher UI for managing questions within a quiz
   - QuestionCard: displays question with type badge, options (MCQ highlighted), correct answer
   - AddQuestionForm: type selector, question text, type-specific inputs (MCQ options with radio select, T/F radio, fill-blank text), points
   - Delete question with confirmation

6. **TeacherCourseDetail** (`src/pages/teacher/TeacherCourseDetail.tsx`):
   - Added "Quizzes" tab with quiz count badge
   - AddQuizForm dialog: title, description, time limit, attempt limit, randomize toggle, show answers toggle
   - Each quiz renders a QuizBuilder component

7. **QuizPage** (`src/pages/QuizPage.tsx`):
   - Pre-quiz screen: quiz info, attempt count, start/retake button, attempt limit enforcement
   - Quiz-taking UI: numbered question navigation buttons (color-coded: current/answered/unanswered)
   - Progress bar showing answered/total
   - MCQ: clickable option cards with selection highlight
   - True/False: two large toggle buttons
   - Fill-blank: text input
   - Timer component (countdown from time_limit, auto-submit on expiry)
   - Previous/Next navigation, Submit button with unanswered warning
   - Auto-grading: MCQ exact match, T/F exact match, fill-blank case-insensitive compare
   - Resumes in-progress attempts (loads saved answers)

8. **QuizResults** (`src/pages/QuizResults.tsx`):
   - Score summary card: points, percentage, progress bar, grade badge (Excellent/Passing/Needs Improvement)
   - Per-question breakdown: check/X/minus icons, user answer vs correct answer
   - MCQ: green highlight on correct, red on wrong user choice
   - T/F and fill-blank: inline correct answer display
   - Points per question shown
   - Only shown if quiz.show_answers is true

9. **CourseDetail** (`src/pages/CourseDetail.tsx`):
   - Added "Quizzes" tab with quiz list cards (title, time limit, attempt count)
   - Links to QuizPage

10. **Routes** (`src/App.tsx`):
    - `/courses/:courseId/quizzes/:quizId` → QuizPage
    - `/courses/:courseId/quizzes/:quizId/results/:attemptId` → QuizResults

11. **Seed Data** (appended to `supabase/seed.sql`):
    - 3 quizzes (one per course): Algebra (15min, 2 attempts), Physics (20min, randomized), Python (10min, 3 attempts)
    - 14 questions total: MCQ, True/False, Fill-in-the-blank across all three quizzes

12. **QA**: 0 type errors, build success, 52/52 tests passing

**Teaching notes:**
- **JSONB for polymorphic data:** `correct_answer` stores different types per question: number (MCQ option index), boolean (T/F), string (fill-blank). JSONB handles this naturally — the application layer casts based on `type`. This avoids separate columns or tables for each question type.
- **Attempt lifecycle:** An attempt starts as a row with `completed_at = NULL`. The student's answers are saved to `answers` JSONB. On submit, the client computes the score and sets `completed_at`. This two-phase approach lets us detect in-progress attempts and resume them.
- **Client-side grading:** Auto-grading happens in the browser, not via a DB function. This is simpler and fine for MCQ/T-F/fill-blank. For more complex grading (partial credit, essay), you'd move to a server-side function. The score is stored on the attempt row — trusted because RLS ensures students can only update their own attempts.
- **Timer with server timestamp:** `started_at` comes from the DB (`DEFAULT now()`), so the timer is anchored to server time. The client computes remaining = time_limit - (now - started_at). On expiry, `onExpire` calls `gradeAndSubmit` automatically.
- **Question shuffling:** When `randomize` is true, `shuffleArray` reorders questions client-side using Fisher-Yates. The shuffle happens in `useMemo` keyed on `rawQuestions` and `randomize`, so it's stable across re-renders but different per attempt load.

---
