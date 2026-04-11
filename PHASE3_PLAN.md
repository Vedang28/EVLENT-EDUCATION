# Phase 3 Completion Plan — EVLENT Education

**Project:** EVLENT Education LMS
**Phase:** 3 — Workflows, Notifications, Calendar & Timetable
**GitHub:** https://github.com/Vedang28/EVLENT-EDUCATION
**Author:** [@Vedang28](https://github.com/Vedang28)
**Date:** 2026-04-11
**Workflow:** Run `/workflow Complete Phase 3 calendar and timetable pages` to execute this plan end-to-end

---

## Table of Contents

1. [Phase 3 Overview](#1-phase-3-overview)
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

## 1. Phase 3 Overview

Phase 3 adds four major features to the platform:

| #   | Feature                      | Description                                                                                       |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| F1  | **Course Approval Workflow** | Teachers create courses (pending) → Admins approve/reject → Only approved visible to students     |
| F2  | **Notification System**      | Database triggers on key events → Realtime WebSocket delivery → Toast + badge + notification page |
| F3  | **Calendar Page**            | Interactive monthly calendar showing assignment deadlines + live class sessions, role-filtered    |
| F4  | **Timetable Page**           | Weekly grid view of scheduled live classes with course filtering, week navigation, print support  |

**Dependencies between features:**

- F1 and F2 are independent of each other and of F3/F4
- F3 (Calendar) and F4 (Timetable) both rely on the same database tables (`assignments`, `live_classes`, `enrollments`, `courses`) but are independent of each other
- F3 and F4 both depend on F1 being done (course status must exist so role-based queries work correctly)

---

## 2. Current Status

| Feature                          | Status        | What's Done                                                                                                                      | What Remains                                                           |
| -------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **F1: Course Approval Workflow** | **95% Done**  | DB schema (`status` column), admin UI (approve/reject/tabs), RLS policies, notification trigger on status change                 | Bug: `Courses.tsx` doesn't filter by `status = 'approved'`             |
| **F2: Notification System**      | **100% Done** | 4 DB triggers, `useRealtimeNotifications` hook, Notifications page with mark-as-read/bulk, unread badge in header, Sonner toasts | —                                                                      |
| **F3: Calendar Page**            | **5% Done**   | Route in `App.tsx`, sidebar link, stub file (16 lines with just a heading)                                                       | Full implementation needed                                             |
| **F4: Timetable Page**           | **5% Done**   | Route in `App.tsx`, sidebar link, stub file (14 lines with just a heading)                                                       | Full implementation needed                                             |
| **Route Cleanup**                | Pending       | —                                                                                                                                | Duplicate `/calendar` and `/timetable` routes in `App.tsx` lines 96-97 |

---

## 3. Features & Subtasks Breakdown

### F1: Course Approval Workflow (Bug Fix)

| #    | Subtask                                                                    | File                                 | Status   |
| ---- | -------------------------------------------------------------------------- | ------------------------------------ | -------- |
| F1.1 | DB `status` column on `courses` table                                      | `supabase/migrations/20260309003743` | Done     |
| F1.2 | RLS policies: students see approved only, teachers see own, admins see all | `supabase/migrations/20260309003743` | Done     |
| F1.3 | Admin UI: approve/reject/revoke with tabbed interface                      | `src/pages/admin/AdminCourses.tsx`   | Done     |
| F1.4 | Course status change notification trigger                                  | `supabase/migrations/20260309003520` | Done     |
| F1.5 | **BUG FIX: Student browse page filters by `status = 'approved'`**          | `src/pages/Courses.tsx`              | **TODO** |

### F2: Notification System

| #    | Subtask                                                          | File                                    | Status |
| ---- | ---------------------------------------------------------------- | --------------------------------------- | ------ |
| F2.1 | `notify_on_grade()` trigger                                      | `supabase/migrations/20260309003520`    | Done   |
| F2.2 | `notify_on_new_lesson()` trigger                                 | `supabase/migrations/20260309003520`    | Done   |
| F2.3 | `notify_on_new_assignment()` trigger                             | `supabase/migrations/20260309003520`    | Done   |
| F2.4 | `notify_on_course_status_change()` trigger                       | `supabase/migrations/20260309003520`    | Done   |
| F2.5 | `useRealtimeNotifications` hook (WebSocket + cache invalidation) | `src/hooks/useRealtimeNotifications.ts` | Done   |
| F2.6 | Notifications page (list, mark read, bulk mark all)              | `src/pages/Notifications.tsx`           | Done   |
| F2.7 | Unread count badge in header                                     | `src/components/AppLayout.tsx`          | Done   |
| F2.8 | Toast notifications via Sonner on realtime events                | `src/hooks/useRealtimeNotifications.ts` | Done   |

### F3: Calendar Page

| #     | Subtask                                         | Description                                                                   | Status   |
| ----- | ----------------------------------------------- | ----------------------------------------------------------------------------- | -------- |
| F3.1  | Create `useCalendarEvents` hook                 | Fetch assignments + live_classes for enrolled/owned courses in selected month | **TODO** |
| F3.2  | Role-based query branching                      | Students: enrolled courses; Teachers: owned courses                           | **TODO** |
| F3.3  | Unified event type normalization                | Merge assignments + live_classes into `CalendarEvent[]`                       | **TODO** |
| F3.4  | Event date extraction for calendar highlighting | Return `Date[]` of days with events for DayPicker modifiers                   | **TODO** |
| F3.5  | Calendar widget with event-highlighted days     | shadcn `Calendar` with `modifiers` + `modifiersClassNames`                    | **TODO** |
| F3.6  | Day selection and event list panel              | Click day → show filtered events in right panel                               | **TODO** |
| F3.7  | Assignment event cards                          | Show title, course, deadline; click navigates to assignment page              | **TODO** |
| F3.8  | Live class event cards                          | Show title, course, time range; Join button for meeting URL                   | **TODO** |
| F3.9  | Empty state                                     | "No events for this day" message                                              | **TODO** |
| F3.10 | Loading state                                   | Spinner while queries are fetching                                            | **TODO** |
| F3.11 | Responsive layout                               | Side-by-side on desktop, stacked on mobile                                    | **TODO** |

### F4: Timetable Page

| #     | Subtask                           | Description                                                             | Status   |
| ----- | --------------------------------- | ----------------------------------------------------------------------- | -------- |
| F4.1  | Create `useTimetableClasses` hook | Fetch live_classes for enrolled/owned courses in selected week          | **TODO** |
| F4.2  | Role-based query branching        | Students: enrolled courses; Teachers: owned courses                     | **TODO** |
| F4.3  | Week navigation controls          | Prev/Next week buttons, "Today" reset, week label display               | **TODO** |
| F4.4  | Course filter dropdown            | `Select` with "All Courses" default + unique course list from data      | **TODO** |
| F4.5  | Weekly grid rendering             | `Table` with time slots (8:00–20:00) as rows, days (Mon–Sat) as columns | **TODO** |
| F4.6  | Class cards in grid cells         | Title, course name, time range, meeting link icon                       | **TODO** |
| F4.7  | Print-friendly layout             | `window.print()` button, `print:hidden` classes on nav chrome           | **TODO** |
| F4.8  | Mobile horizontal scroll          | `ScrollArea` wrapper for the table                                      | **TODO** |
| F4.9  | Empty state                       | "No classes scheduled this week" message                                | **TODO** |
| F4.10 | Loading state                     | Spinner while queries are fetching                                      | **TODO** |

### Route Cleanup

| #   | Subtask                             | Description       | Status   |
| --- | ----------------------------------- | ----------------- | -------- |
| R1  | Remove duplicate `/calendar` route  | `App.tsx` line 96 | **TODO** |
| R2  | Remove duplicate `/timetable` route | `App.tsx` line 97 | **TODO** |

---

## 4. Scaffolding Requirements

### 4.1 New Files to Create

| File                                         | Type | Purpose                                                        |
| -------------------------------------------- | ---- | -------------------------------------------------------------- |
| `src/hooks/useCalendarEvents.ts`             | Hook | Data fetching for calendar events (assignments + live classes) |
| `src/hooks/useTimetableClasses.ts`           | Hook | Data fetching for timetable classes                            |
| `src/test/hooks/useCalendarEvents.test.ts`   | Test | Unit tests for calendar hook                                   |
| `src/test/hooks/useTimetableClasses.test.ts` | Test | Unit tests for timetable hook                                  |
| `src/test/pages/Calendar.test.tsx`           | Test | Component tests for Calendar page                              |
| `src/test/pages/Timetable.test.tsx`          | Test | Component tests for Timetable page                             |

### 4.2 Existing Files to Modify

| File                      | Change                                                      |
| ------------------------- | ----------------------------------------------------------- |
| `src/pages/Courses.tsx`   | Add `.eq("status", "approved")` on line 20, update queryKey |
| `src/App.tsx`             | Remove duplicate routes on lines 96-97                      |
| `src/pages/Calendar.tsx`  | Full rewrite (replace 16-line stub)                         |
| `src/pages/Timetable.tsx` | Full rewrite (replace 14-line stub)                         |

### 4.3 Test Infrastructure Setup

The project already has Vitest configured (`vitest: ^3.2.4`) with a placeholder test at `src/test/example.test.ts`. Need to add test configuration for React component testing:

| Dependency                  | Purpose                            | Install Command                         |
| --------------------------- | ---------------------------------- | --------------------------------------- |
| `@testing-library/react`    | React component rendering in tests | `npm install -D @testing-library/react` |
| `@testing-library/jest-dom` | DOM assertion matchers             | Already installed                       |
| `jsdom`                     | Browser environment for Vitest     | `npm install -D jsdom`                  |

**Vitest config addition** in `vite.config.ts`:

```typescript
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
}
```

**Test setup file** `src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

### 4.4 Type Definitions

```typescript
// src/hooks/useCalendarEvents.ts
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "assignment" | "live_class";
  courseTitle: string;
  courseId: string;
  assignmentId?: string;
  meetingUrl?: string | null;
  startTime?: string;
  endTime?: string | null;
}

// src/hooks/useTimetableClasses.ts
interface TimetableClass {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  startTime: Date;
  endTime: Date | null;
  meetingUrl: string | null;
  dayOfWeek: number; // 0=Mon ... 5=Sat (weekStartsOn: 1)
  startHour: number;
}
```

### 4.5 Existing Patterns to Reuse

| Pattern                                            | Source File                                | Reuse In         |
| -------------------------------------------------- | ------------------------------------------ | ---------------- |
| Role-based enrollment query                        | `src/pages/LiveClasses.tsx:12-19`          | Both hooks       |
| Course ID extraction from enrollments              | `src/pages/LiveClasses.tsx:24`             | Both hooks       |
| `enabled` flag for dependent queries               | `src/pages/LiveClasses.tsx:33`             | Both hooks       |
| Supabase join syntax `select("*, courses(title)")` | `src/pages/LiveClasses.tsx:29`             | Both hooks       |
| Loading spinner                                    | `src/pages/Courses.tsx:64-66`              | Both pages       |
| Empty state card                                   | `src/pages/Courses.tsx:67-73`              | Both pages       |
| `useAuth()` for user ID                            | `src/pages/LiveClasses.tsx:10`             | Both hooks       |
| `useUserRole()` for role checks                    | `src/pages/Calendar.tsx:2` (existing stub) | Both pages/hooks |

---

## 5. Implementation Plan

### Step 1: Bug Fixes & Cleanup (5 min)

| Task  | File                       | Change                                                                                     |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------ |
| F1.5  | `src/pages/Courses.tsx:20` | Add `.eq("status", "approved")` to query, update queryKey to `["all-courses", "approved"]` |
| R1+R2 | `src/App.tsx:96-97`        | Delete duplicate `/calendar` and `/timetable` route definitions                            |

### Step 2: Test Infrastructure (10 min)

| Task              | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Install test deps | `npm install -D @testing-library/react jsdom`               |
| Add Vitest config | Add `test` block to `vite.config.ts` with jsdom environment |
| Create setup file | `src/test/setup.ts` with jest-dom import                    |

### Step 3: Calendar Hook — `useCalendarEvents` (30 min)

**File:** `src/hooks/useCalendarEvents.ts`

| Subtask                      | Detail                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Accept params                | `selectedMonth: Date`                                                                                                      |
| Get user + role              | `useAuth()` + `useUserRole()`                                                                                              |
| Query enrollments (students) | `supabase.from("enrollments").select("course_id").eq("student_id", userId)`                                                |
| Query own courses (teachers) | `supabase.from("courses").select("id").eq("teacher_id", userId)`                                                           |
| Extract course IDs           | From enrollments (students) or courses (teachers)                                                                          |
| Query assignments            | `.in("course_id", courseIds).gte("deadline", monthStart).lte("deadline", monthEnd)` with `select("*, courses(title)")`     |
| Query live_classes           | `.in("course_id", courseIds).gte("start_time", monthStart).lte("start_time", monthEnd)` with `select("*, courses(title)")` |
| Normalize events             | Map both into `CalendarEvent[]`                                                                                            |
| Extract event dates          | `eventDates: Date[]` for calendar widget modifiers                                                                         |
| Handle edge cases            | Empty enrollments → return `[]`; loading states; `enabled` flags on dependent queries                                      |

### Step 4: Calendar Page — `Calendar.tsx` (1 hour)

**File:** `src/pages/Calendar.tsx` (full rewrite)

| Subtask                        | Detail                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Page header                    | Title + subtitle                                                                                                                                                                                       |
| State management               | `selectedDay: Date`, `selectedMonth: Date`                                                                                                                                                             |
| Calendar widget (left panel)   | shadcn `Calendar` with: `selected={selectedDay}`, `onSelect={setSelectedDay}`, `onMonthChange={setSelectedMonth}`, `modifiers={{ hasEvent: eventDates }}`, `modifiersClassNames={{ hasEvent: "..." }}` |
| Event list panel (right panel) | `Card` showing events filtered by `isSameDay(event.date, selectedDay)`                                                                                                                                 |
| Assignment event card          | Badge("Assignment", orange) + title + course + deadline formatted + `Link` to `/courses/:courseId/assignments/:assignmentId`                                                                           |
| Live class event card          | Badge("Live Class", blue) + title + course + time range + Join button (if meetingUrl)                                                                                                                  |
| Empty day state                | "No events scheduled for this day" with CalendarOff icon                                                                                                                                               |
| Loading state                  | Spinner centered in event panel                                                                                                                                                                        |
| Responsive layout              | `flex flex-col md:flex-row` — stacked on mobile, side-by-side on desktop                                                                                                                               |

### Step 5: Timetable Hook — `useTimetableClasses` (30 min)

**File:** `src/hooks/useTimetableClasses.ts`

| Subtask                | Detail                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Accept params          | `weekStart: Date`                                                                                                            |
| Get user + role        | `useAuth()` + `useUserRole()`                                                                                                |
| Course ID resolution   | Same pattern as calendar hook (enrollment-based or ownership-based)                                                          |
| Query live_classes     | `.in("course_id", courseIds).gte("start_time", weekStart).lte("start_time", weekEnd)` with `select("*, courses(id, title)")` |
| Normalize classes      | Map into `TimetableClass[]` with `dayOfWeek`, `startHour` computed via date-fns                                              |
| Extract unique courses | For filter dropdown: `{ id, title }[]`                                                                                       |
| Handle edge cases      | Empty enrollments, no classes for week                                                                                       |

### Step 6: Timetable Page — `Timetable.tsx` (1.5 hours)

**File:** `src/pages/Timetable.tsx` (full rewrite)

| Subtask            | Detail                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Page header        | Title + subtitle                                                                               |
| State management   | `weekStart: Date` (default: current Monday), `courseFilter: string` (default: "all")           |
| Week navigation    | Prev (`subWeeks`) / Next (`addWeeks`) / Today buttons + week range label                       |
| Course filter      | `Select` dropdown with "All Courses" + unique course titles                                    |
| Grid rendering     | `Table` with: header row = Time + Mon–Sat (with date), body rows = hours 8:00–20:00            |
| Cell rendering     | For each (day, hour): find matching class → render card with title, course, time, meeting icon |
| Class card in cell | Colored background per course, title truncated, `Tooltip` for full details                     |
| Print button       | `Button` calling `window.print()`                                                              |
| Print styles       | `print:hidden` on sidebar/header/controls; `print:shadow-none print:border` on table           |
| Horizontal scroll  | `ScrollArea` wrapper with `overflow-x-auto` for mobile                                         |
| Empty state        | "No classes scheduled this week" card                                                          |
| Loading state      | Spinner centered                                                                               |

### Step 7: Tests (45 min)

See [Section 6: Testing Plan](#6-testing-plan) for full details.

### Step 8: Debugging & Manual QA (30 min)

See [Section 7: Debugging Plan](#7-debugging-plan) for full details.

### Step 9: Review & Audit (20 min)

See [Section 8](#8-code-review-checklist) and [Section 9](#9-security--quality-audit) for full details.

### Step 10: Commit & Push (10 min)

See [Section 10: Git & Push Strategy](#10-git--push-strategy) for full details.

---

## 6. Testing Plan

### 6.1 Unit Tests — Hooks

**File:** `src/test/hooks/useCalendarEvents.test.ts`

| Test Case                                                   | Description                                                                  |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `returns empty events when user has no enrollments`         | Mock Supabase to return empty enrollments → expect `events: []`              |
| `fetches assignments and live classes for enrolled courses` | Mock enrollments + assignment/class data → verify unified event list         |
| `filters events to selected month only`                     | Provide out-of-range dates → verify they're excluded                         |
| `normalizes assignment events correctly`                    | Verify `type: "assignment"`, `date` from `deadline`, `courseTitle` from join |
| `normalizes live class events correctly`                    | Verify `type: "live_class"`, `date` from `start_time`, `meetingUrl` present  |
| `returns eventDates array for calendar highlighting`        | Verify `Date[]` contains correct unique dates                                |
| `teacher mode fetches own courses instead of enrollments`   | Mock `isTeacher: true` → verify courses query uses `teacher_id`              |

**File:** `src/test/hooks/useTimetableClasses.test.ts`

| Test Case                                     | Description                                                      |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `returns empty classes when no enrollments`   | Mock empty enrollments → expect `classes: []`                    |
| `fetches live classes for selected week`      | Mock data → verify date range filtering                          |
| `computes dayOfWeek and startHour correctly`  | Provide known timestamps → verify derived fields                 |
| `extracts unique courses for filter dropdown` | Multiple classes from same course → single entry in courses list |
| `teacher mode uses teacher_id filter`         | Mock teacher role → verify query pattern                         |

### 6.2 Component Tests — Pages

**File:** `src/test/pages/Calendar.test.tsx`

| Test Case                                             | Description                                                |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `renders calendar widget and event panel`             | Verify both panels are in the DOM                          |
| `shows loading spinner while fetching`                | Mock loading state → verify spinner                        |
| `shows empty state when no events for selected day`   | Mock empty events → verify empty message                   |
| `displays assignment events with correct badge`       | Mock assignment → verify orange badge + title + course     |
| `displays live class events with join button`         | Mock live class with URL → verify blue badge + Join button |
| `clicking an assignment navigates to assignment page` | Verify `Link` has correct `to` prop                        |

**File:** `src/test/pages/Timetable.test.tsx`

| Test Case                                      | Description                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| `renders weekly grid with correct day headers` | Verify Mon–Sat columns with dates                  |
| `renders time slots from 8:00 to 20:00`        | Verify row labels                                  |
| `shows classes in correct grid cells`          | Mock class on Wednesday 10am → verify correct cell |
| `shows empty state when no classes`            | Mock empty → verify message                        |
| `week navigation updates displayed dates`      | Click next → verify header dates change            |
| `course filter hides non-matching classes`     | Select specific course → verify others hidden      |
| `print button exists`                          | Verify print button in DOM                         |

### 6.3 Test Commands

```bash
# Run all tests
npm run test

# Run in watch mode during development
npm run test:watch

# Run only Phase 3 tests
npx vitest run src/test/hooks/useCalendarEvents.test.ts src/test/hooks/useTimetableClasses.test.ts src/test/pages/Calendar.test.tsx src/test/pages/Timetable.test.tsx

# Run with coverage
npx vitest run --coverage
```

---

## 7. Debugging Plan

### 7.1 Common Issues & How to Debug

| Issue                                    | Debugging Steps                                                                                                                                                                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Calendar shows no events**             | 1. Check browser DevTools → Network tab → Supabase requests, 2. Verify month range in query params (ISO strings), 3. Check React Query DevTools for cached data, 4. Confirm enrollment exists for the user, 5. Check Supabase dashboard → Table Editor → verify data exists |
| **Timetable grid is empty**              | 1. Same as above for live_classes query, 2. Verify `weekStart` calculation (should be Monday), 3. Check `dayOfWeek` computation — `getDay()` returns 0=Sun, need to adjust for Mon-start week                                                                               |
| **Events on wrong calendar day**         | 1. Timezone issue — check if Supabase returns UTC, 2. Log `parseISO(timestamp)` output, 3. Verify `isSameDay` comparison uses local timezone consistently                                                                                                                   |
| **Timetable class in wrong cell**        | 1. Log `dayOfWeek` and `startHour` computations, 2. Verify `startOfWeek` uses `{ weekStartsOn: 1 }` (Monday), 3. Check `getHours()` output for the timestamp                                                                                                                |
| **Course filter not working**            | 1. Check `courseFilter` state updates on Select change, 2. Verify filter logic: `courseFilter === "all" \|\| class.courseId === courseFilter`                                                                                                                               |
| **Print layout broken**                  | 1. Open print preview (Cmd+P), 2. Check `print:hidden` classes applied to sidebar/header, 3. Verify table has `print:border` styles                                                                                                                                         |
| **Calendar widget days not highlighted** | 1. Log `eventDates` array — must be `Date` objects not strings, 2. Verify `modifiers={{ hasEvent: eventDates }}` prop, 3. Check `modifiersClassNames` has correct class name                                                                                                |
| **RLS blocking queries**                 | 1. Check Supabase logs (Dashboard → Logs → PostgREST), 2. Verify user has correct role, 3. Test query in Supabase SQL Editor with `SET request.jwt.claims = ...`                                                                                                            |

### 7.2 Development Server Commands

```bash
# Start dev server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Check for lint issues
npx eslint src/pages/Calendar.tsx src/pages/Timetable.tsx src/hooks/useCalendarEvents.ts src/hooks/useTimetableClasses.ts
```

### 7.3 Browser DevTools Checks

- **React Query DevTools:** Inspect query states, cached data, refetch triggers
- **Network Tab:** Verify Supabase REST calls return expected data
- **Console:** Check for React warnings (key props, useEffect deps)
- **Responsive Mode:** Test mobile layout at 375px width

---

## 8. Code Review Checklist

### Functional Correctness

- [ ] Course filter fix: `.eq("status", "approved")` correctly placed in query chain
- [ ] Calendar events: month range boundaries use `startOfMonth` / `endOfMonth` correctly
- [ ] Timetable: week boundaries use `startOfWeek({ weekStartsOn: 1 })` for Monday start
- [ ] Role branching: students use enrollment-based queries, teachers use ownership-based queries
- [ ] `enabled` flags prevent queries from firing before dependencies resolve
- [ ] Event dates are `Date` objects (via `parseISO`), not raw strings

### Code Quality

- [ ] Follows existing patterns from `LiveClasses.tsx` and `Dashboard.tsx`
- [ ] No unused imports or variables
- [ ] TypeScript types are explicit — no `any` unless matching existing pattern
- [ ] Query keys are unique and include all variable dependencies
- [ ] Components are not over-extracted — keep simple inline rendering where appropriate

### UI/UX

- [ ] Loading spinners match existing design (4px border, primary color, animate-spin)
- [ ] Empty states match existing design (icon + message centered)
- [ ] Color-coded badges are accessible (not relying only on color — text labels present)
- [ ] Calendar is usable on mobile (stacked layout)
- [ ] Timetable scrolls horizontally on small screens
- [ ] Print layout hides interactive elements

### Performance

- [ ] No unnecessary re-renders from unstable object references in query keys
- [ ] `useMemo` for expensive computations (event filtering, grid cell mapping) if needed
- [ ] Queries use `enabled` to avoid waterfall fetching when possible

---

## 9. Security & Quality Audit

### 9.1 Security Checks

| Check                     | Expected Result                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **RLS enforcement**       | Calendar/timetable hooks rely on Supabase RLS — students cannot see other students' data                                |
| **Course status filter**  | After F1.5 fix, student browse page explicitly filters `status = 'approved'` at query level (defense in depth with RLS) |
| **Meeting URL handling**  | Join buttons use `target="_blank" rel="noopener noreferrer"` (matches existing `LiveClasses.tsx` pattern)               |
| **No raw HTML rendering** | Calendar/timetable pages only display text content, no `dangerouslySetInnerHTML`                                        |
| **Query injection**       | All queries use Supabase client parameterized methods (`.eq()`, `.in()`, `.gte()`) — no raw SQL                         |
| **Auth guard**            | Both pages render inside `ProtectedRoute` → `AppLayout` — unauthenticated users redirected to `/login`                  |

### 9.2 Quality Checks

| Check                    | Expected Result                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **TypeScript strict**    | No `any` types introduced; all interfaces explicitly defined                                            |
| **No console.log**       | Remove any debug logging before commit                                                                  |
| **Error handling**       | Queries return `[]` on error (consistent with existing pattern); toast on mutation errors               |
| **Accessibility**        | Table headers have proper `<th>` elements; interactive elements are focusable; color not sole indicator |
| **Bundle size**          | No new heavy dependencies — only using existing date-fns, shadcn, React Query                           |
| **Timezone consistency** | All date comparisons use `parseISO` → local Date → date-fns functions                                   |

### 9.3 Audit Procedure

1. **Static analysis:** Run `npx tsc --noEmit` — zero errors
2. **Lint check:** Run ESLint on all changed/new files
3. **Test suite:** Run `npm run test` — all passing
4. **Manual walkthrough:** Read every new file top-to-bottom for logic errors
5. **Cross-reference with product doc:** Verify each feature item in `PRODUCT_DOCUMENTATION.md` Section 7 Phase 3 is addressed
6. **Build check:** Run `npm run build` — zero warnings/errors

---

## 10. Git & Push Strategy

### 10.1 Branch Strategy

```
main (current) → feature/phase3-completion (new branch)
```

### 10.2 Commit Plan

| #   | Commit                                                               | Files Changed                                        |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | `fix: filter courses by approved status in student browse page`      | `src/pages/Courses.tsx`                              |
| 2   | `fix: remove duplicate calendar and timetable routes`                | `src/App.tsx`                                        |
| 3   | `feat: add calendar events hook with role-based data fetching`       | `src/hooks/useCalendarEvents.ts`                     |
| 4   | `feat: build interactive calendar page with event display`           | `src/pages/Calendar.tsx`                             |
| 5   | `feat: add timetable classes hook with role-based data fetching`     | `src/hooks/useTimetableClasses.ts`                   |
| 6   | `feat: build weekly timetable page with grid view and print support` | `src/pages/Timetable.tsx`                            |
| 7   | `test: add unit and component tests for calendar and timetable`      | `src/test/**`, `vite.config.ts`, `src/test/setup.ts` |

### 10.3 Push Commands

```bash
# Create feature branch
git checkout -b feature/phase3-completion

# After all commits...
git push -u origin feature/phase3-completion

# Create PR
gh pr create \
  --title "feat: Complete Phase 3 — Calendar, Timetable & Bug Fixes" \
  --body "## Summary
- Fix course status filter bug in student browse page
- Remove duplicate route definitions
- Build interactive calendar page (assignments + live classes, role-filtered)
- Build weekly timetable page (grid view, course filter, week navigation, print)
- Add unit and component tests for all new code

## Phase 3 Checklist
- [x] Course Approval Workflow (was done, bug fixed)
- [x] Notification System (was done)
- [x] Calendar Page (new)
- [x] Timetable Page (new)

## Test Plan
- [ ] Run \`npm run test\` — all passing
- [ ] Student login: calendar shows enrolled course events only
- [ ] Teacher login: calendar shows owned course events only
- [ ] Timetable: week navigation works, grid displays correctly
- [ ] Timetable: course filter works, print layout is clean
- [ ] Course browse page: only approved courses visible"
```

### 10.4 Remote Details

| Key            | Value                                              |
| -------------- | -------------------------------------------------- |
| Remote         | `origin`                                           |
| URL            | `https://github.com/Vedang28/EVLENT-EDUCATION.git` |
| Base branch    | `main`                                             |
| Feature branch | `feature/phase3-completion`                        |
| GitHub user    | [@Vedang28](https://github.com/Vedang28)           |

---

## 11. File Inventory

### New Files (6)

| File                                         | Type | Lines (est.) |
| -------------------------------------------- | ---- | ------------ |
| `src/hooks/useCalendarEvents.ts`             | Hook | ~80          |
| `src/hooks/useTimetableClasses.ts`           | Hook | ~70          |
| `src/test/hooks/useCalendarEvents.test.ts`   | Test | ~100         |
| `src/test/hooks/useTimetableClasses.test.ts` | Test | ~80          |
| `src/test/pages/Calendar.test.tsx`           | Test | ~90          |
| `src/test/pages/Timetable.test.tsx`          | Test | ~90          |

### Modified Files (4)

| File                      | Change                  | Lines Changed (est.) |
| ------------------------- | ----------------------- | -------------------- |
| `src/pages/Courses.tsx`   | Add status filter       | 2                    |
| `src/App.tsx`             | Remove duplicate routes | -2                   |
| `src/pages/Calendar.tsx`  | Full rewrite            | ~150 (was 16)        |
| `src/pages/Timetable.tsx` | Full rewrite            | ~200 (was 14)        |

### Infrastructure Files (2-3)

| File                | Change                           |
| ------------------- | -------------------------------- |
| `vite.config.ts`    | Add `test` config block          |
| `src/test/setup.ts` | New — jest-dom import            |
| `package.json`      | New dev dependencies (if needed) |

### Reference Files (read-only)

| File                                | Used For                            |
| ----------------------------------- | ----------------------------------- |
| `src/pages/LiveClasses.tsx`         | Role-based enrollment query pattern |
| `src/pages/Dashboard.tsx`           | Query + card layout patterns        |
| `src/hooks/useUserRole.ts`          | Role checking API                   |
| `src/components/ui/calendar.tsx`    | DayPicker v8 wrapper, modifiers API |
| `src/components/ui/table.tsx`       | Table component API                 |
| `src/components/ui/select.tsx`      | Select component API                |
| `src/components/ui/badge.tsx`       | Badge component API                 |
| `src/components/ui/scroll-area.tsx` | ScrollArea component API            |

---

## 12. Verification Checklist

### Bug Fixes

- [ ] F1.5: Teacher visits `/courses` → only approved courses shown
- [ ] R1+R2: `/calendar` and `/timetable` still work after removing duplicate routes

### Calendar Page

- [ ] Student: sees assignments + live classes for enrolled courses only
- [ ] Teacher: sees assignments + live classes for own courses only
- [ ] Days with events are visually highlighted on the calendar widget
- [ ] Click a day → event list updates to show that day's events
- [ ] Click an assignment event → navigates to `/courses/:courseId/assignments/:assignmentId`
- [ ] Click a live class Join button → opens meeting URL in new tab
- [ ] Empty day shows "No events" message
- [ ] Loading spinner appears while data is fetching
- [ ] Responsive: stacked layout on mobile, side-by-side on desktop
- [ ] Month navigation works (prev/next month)

### Timetable Page

- [ ] Student: sees live classes for enrolled courses only
- [ ] Teacher: sees live classes they're teaching
- [ ] Weekly grid shows correct day headers (Mon–Sat with dates)
- [ ] Time slots display from 8:00 to 20:00
- [ ] Classes appear in correct grid cells (right day + right hour)
- [ ] Prev/Next week buttons update the grid
- [ ] "Today" button returns to current week
- [ ] Course filter dropdown works (show all vs. specific course)
- [ ] Print button opens print dialog with clean layout (no sidebar/controls)
- [ ] Empty weeks show "No classes scheduled" message
- [ ] Loading spinner appears while fetching
- [ ] Mobile: table scrolls horizontally

### Tests

- [ ] `npm run test` — all tests pass
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — builds successfully with no errors

### Git

- [ ] All changes committed on `feature/phase3-completion` branch
- [ ] Pushed to `origin` (https://github.com/Vedang28/EVLENT-EDUCATION)
- [ ] PR created against `main` with summary and test plan
