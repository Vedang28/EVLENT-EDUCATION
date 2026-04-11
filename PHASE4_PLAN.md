# Phase 4 Implementation Plan — EVLENT Education

**Project:** EVLENT Education LMS
**Phase:** 4 — Subject Management, Advanced Content & Assessments
**GitHub:** https://github.com/Vedang28/EVLENT-EDUCATION
**Author:** [@Vedang28](https://github.com/Vedang28)
**Date:** 2026-04-11
**Workflow:** Run `/workflow Complete Phase 4` to execute this plan end-to-end

---

## Table of Contents

1. [Phase 4 Overview](#1-phase-4-overview)
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

## 1. Phase 4 Overview

Phase 4 adds six major features to the platform:

| # | Feature | Description |
|---|---------|-------------|
| F1 | **Subject & Grade-Level Management** | Subjects + grade levels tables, FK from courses, filtering in browse page, admin management, teacher subject expertise, student grade assignment |
| F2 | **Rich Content Editor** | Replace raw HTML textarea with TipTap WYSIWYG editor, formatting toolbar, math/code support, rich viewer for students |
| F3 | **Course Thumbnails** | Supabase Storage bucket for thumbnails, image upload in course creation/editing, thumbnail preview in course cards |
| F4 | **Quiz Engine** | Quiz builder for teachers, quiz-taking UI for students with timer, auto-grading, results page, teacher analytics |
| F5 | **Enhanced Video Player** | Custom video player component, playback speed/volume/fullscreen, video progress tracking with resume, YouTube/Vimeo/MP4 support |
| F6 | **Secure File Access** | Signed URLs for submission downloads, file type validation whitelist, max file size enforcement |

**Dependencies between features:**
- F1 (subjects/grades) is independent but should be done first — F2-F6 all build on the course infrastructure
- F2 (rich editor) and F5 (video player) both modify `LessonPage.tsx` — coordinate changes
- F3 (thumbnails) is independent
- F4 (quiz engine) is the largest feature — independent of others but benefits from F1 (subject tagging on quizzes)
- F6 (secure files) is independent

---

## 2. Current Status

| Feature | Status | What's Done | What Remains |
|---------|--------|-------------|--------------|
| **F1: Subject & Grade-Level Management** | **NOT started** | `courses` table exists with `title`, `description`, `teacher_id`, `status`, `thumbnail_url` | New tables, FKs, seed data, filtering UI, admin pages, teacher/student profile extensions |
| **F2: Rich Content Editor** | **NOT started** | Lesson content stored as plain text/HTML in `lessons.content`, teacher uses raw `<Textarea>` to enter content | TipTap integration, editor component, viewer component, toolbar |
| **F3: Course Thumbnails** | **NOT started** | `thumbnail_url` column exists on `courses` table but is unused; course cards show a gradient placeholder | Storage bucket, upload component, thumbnail display in cards |
| **F4: Quiz Engine** | **NOT started** | No quiz infrastructure exists | Full DB schema, teacher quiz builder, student quiz UI, auto-grading, results, analytics |
| **F5: Enhanced Video Player** | **NOT started** | Lessons render video via a raw `<iframe>` in `LessonPage.tsx` | Custom player component, playback controls, progress tracking table, resume support |
| **F6: Secure File Access** | **NOT started** | Submissions uploaded to `submissions` bucket; `file_url` stores the path; no signed URL logic, no file validation | Signed URLs, file type whitelist, size validation |

---

## 3. Features & Subtasks Breakdown

### F1: Subject & Grade-Level Management

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F1.1 | Create `subjects` table | `id UUID PK, name TEXT UNIQUE, description TEXT, icon TEXT, created_at TIMESTAMPTZ` | **TODO** |
| F1.2 | Create `grade_levels` table | `id UUID PK, name TEXT UNIQUE, position INTEGER, created_at TIMESTAMPTZ` | **TODO** |
| F1.3 | Add FK columns to `courses` | `ALTER TABLE courses ADD COLUMN subject_id UUID REFERENCES subjects(id), ADD COLUMN grade_level_id UUID REFERENCES grade_levels(id)` | **TODO** |
| F1.4 | Seed subjects data | Insert standard subjects: Mathematics, Science, English, Hindi, Social Studies, Computer Science, Physics, Chemistry, Biology, History, Geography, Economics, Art, Music, Physical Education | **TODO** |
| F1.5 | Seed grade levels data | Insert KG, Class 1 through Class 12 with `position` 0-13 for ordering | **TODO** |
| F1.6 | RLS policies for `subjects` | Anyone can SELECT; only admins can INSERT/UPDATE/DELETE | **TODO** |
| F1.7 | RLS policies for `grade_levels` | Anyone can SELECT; only admins can INSERT/UPDATE/DELETE | **TODO** |
| F1.8 | Subject filter dropdown in `Courses.tsx` | Add `Select` component to filter courses by `subject_id` | **TODO** |
| F1.9 | Grade-level filter dropdown in `Courses.tsx` | Add `Select` component to filter courses by `grade_level_id` | **TODO** |
| F1.10 | Update course creation form | Add subject and grade-level selects in `CreateCourse.tsx` | **TODO** |
| F1.11 | Update `TeacherCourseDetail.tsx` | Show subject/grade badges on course header; allow editing | **TODO** |
| F1.12 | Add subject expertise to teacher profiles | Add `subject_expertise` TEXT[] column to `profiles` or new junction table `teacher_subjects` (teacher_id, subject_id) | **TODO** |
| F1.13 | Add grade_level to student profiles | Add `grade_level_id UUID REFERENCES grade_levels(id)` to `profiles` table | **TODO** |
| F1.14 | Profile page updates | Add subject expertise multi-select for teachers, grade level select for students in `Profile.tsx` | **TODO** |
| F1.15 | Admin subjects management page | CRUD page at `/admin/subjects` with table listing, add/edit/delete dialogs | **TODO** |
| F1.16 | Admin grade levels management page | CRUD page at `/admin/grade-levels` with table listing, reorder, add/edit/delete | **TODO** |
| F1.17 | Admin sidebar navigation | Add "Subjects" and "Grade Levels" links to `adminNav` in `AppSidebar.tsx` | **TODO** |
| F1.18 | Routes for admin pages | Add `/admin/subjects` and `/admin/grade-levels` routes in `App.tsx` | **TODO** |
| F1.19 | Create `useSubjects` hook | Fetch all subjects with React Query | **TODO** |
| F1.20 | Create `useGradeLevels` hook | Fetch all grade levels ordered by position with React Query | **TODO** |
| F1.21 | Update Supabase types | Regenerate or manually add `subjects`, `grade_levels` types to `types.ts`; update `courses` type with new FKs | **TODO** |

### F2: Rich Content Editor

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F2.1 | Install TipTap dependencies | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-code-block-lowlight`, `lowlight` | **TODO** |
| F2.2 | Install KaTeX | `katex` + `@types/katex` for LaTeX math rendering | **TODO** |
| F2.3 | Create `RichTextEditor.tsx` component | TipTap editor with toolbar: bold, italic, H1-H3, bullet/ordered lists, links, images, code blocks | **TODO** |
| F2.4 | Formatting toolbar buttons | `Toggle` buttons for each format, grouped with separators; active state styling | **TODO** |
| F2.5 | Link insertion dialog | `Dialog` with URL input for inserting/editing links | **TODO** |
| F2.6 | Image insertion dialog | `Dialog` with URL input for inserting images (URL-based, not file upload) | **TODO** |
| F2.7 | Code block with syntax highlighting | `CodeBlockLowlight` extension with common language support | **TODO** |
| F2.8 | Math equation support | Custom TipTap extension or inline KaTeX rendering for `$...$` and `$$...$$` patterns | **TODO** |
| F2.9 | Create `RichTextViewer.tsx` component | Read-only TipTap renderer (or sanitized HTML renderer with KaTeX post-processing) for student view | **TODO** |
| F2.10 | Integrate editor into lesson creation | Replace `<Textarea>` in `TeacherCourseDetail.tsx` `ModuleCard` component with `RichTextEditor` | **TODO** |
| F2.11 | Integrate viewer into lesson display | Replace `dangerouslySetInnerHTML` in `LessonPage.tsx` with `RichTextViewer` | **TODO** |
| F2.12 | Editor CSS/styles | Import TipTap editor styles, KaTeX CSS, code highlight theme | **TODO** |
| F2.13 | Editor value serialization | Store as HTML string (same column `lessons.content`), parse on load | **TODO** |

### F3: Course Thumbnails

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F3.1 | Create `course-thumbnails` Storage bucket | `INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true)` | **TODO** |
| F3.2 | Storage RLS policies | Anyone can read (public); teachers can upload to own course folder; teachers can delete own uploads | **TODO** |
| F3.3 | Create `ImageUpload.tsx` component | File input with drag-and-drop zone, preview, file type validation (jpg/png/webp), size limit (2MB), upload progress | **TODO** |
| F3.4 | Integrate into `CreateCourse.tsx` | Add `ImageUpload` below description field; upload to Storage on form submit; save public URL to `thumbnail_url` | **TODO** |
| F3.5 | Integrate into `TeacherCourseDetail.tsx` | Show current thumbnail with change/remove option in course header area | **TODO** |
| F3.6 | Update `Courses.tsx` card rendering | Replace gradient placeholder `div` with `<img>` when `thumbnail_url` exists; keep gradient as fallback | **TODO** |
| F3.7 | Update `EnrolledCourseCard.tsx` | Show small thumbnail in the card's left icon area when available | **TODO** |
| F3.8 | Update `CourseDetail.tsx` header | Show thumbnail banner at top of course detail page when available | **TODO** |
| F3.9 | Default placeholder gradient | Keep existing `bg-gradient-to-br from-primary/20 to-primary/5` pattern when no thumbnail | **TODO** |
| F3.10 | File type validation | Client-side check: `accept="image/jpeg,image/png,image/webp"` on input; validate MIME type before upload | **TODO** |
| F3.11 | File size validation | Check `file.size <= 2 * 1024 * 1024` before upload; show toast error if exceeded | **TODO** |

### F4: Quiz Engine

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F4.1 | Create `quizzes` table | `id UUID PK, course_id UUID FK courses, title TEXT, description TEXT, time_limit INTEGER (minutes, nullable), attempt_limit INTEGER DEFAULT 1, randomize BOOLEAN DEFAULT false, show_answers BOOLEAN DEFAULT true, created_at TIMESTAMPTZ` | **TODO** |
| F4.2 | Create `quiz_questions` table | `id UUID PK, quiz_id UUID FK quizzes, type TEXT CHECK (mcq, fill_blank, true_false, matching, short_answer), question_text TEXT, options JSONB, correct_answer JSONB, points INTEGER DEFAULT 1, position INTEGER DEFAULT 0, created_at TIMESTAMPTZ` | **TODO** |
| F4.3 | Create `quiz_attempts` table | `id UUID PK, quiz_id UUID FK quizzes, student_id UUID FK auth.users, answers JSONB, score NUMERIC, max_score INTEGER, started_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ` | **TODO** |
| F4.4 | RLS for `quizzes` | SELECT: anyone (for enrolled courses); INSERT/UPDATE/DELETE: teachers for own courses; admins can read all | **TODO** |
| F4.5 | RLS for `quiz_questions` | SELECT: anyone (follows quiz access); INSERT/UPDATE/DELETE: teachers for own course quizzes | **TODO** |
| F4.6 | RLS for `quiz_attempts` | SELECT: students can view own attempts; teachers can view attempts for own course quizzes; INSERT: students for enrolled courses; UPDATE: only to set `completed_at` and `score` | **TODO** |
| F4.7 | Create `useQuizzes` hook | Fetch quizzes for a course with React Query | **TODO** |
| F4.8 | Create `useQuizQuestions` hook | Fetch questions for a quiz, ordered by position | **TODO** |
| F4.9 | Create `useQuizAttempts` hook | Fetch attempts for a quiz by student | **TODO** |
| F4.10 | Create `QuizBuilder.tsx` component | Teacher UI: add quiz title/settings, add/edit/remove questions with type-specific forms | **TODO** |
| F4.11 | MCQ question form | Options array editor with correct answer selector (radio for single, checkbox for multi) | **TODO** |
| F4.12 | True/False question form | Simple toggle for correct answer | **TODO** |
| F4.13 | Fill-in-the-blank question form | Text input for expected answer(s), case-insensitive matching option | **TODO** |
| F4.14 | Short answer question form | Teacher enters rubric/expected keywords; graded manually or auto-match | **TODO** |
| F4.15 | Matching question form | Two-column pair editor (left items, right items, correct pairings stored as JSONB) | **TODO** |
| F4.16 | Question reordering | Drag handle or up/down buttons to reorder questions via `position` field | **TODO** |
| F4.17 | Integrate quiz tab in `TeacherCourseDetail.tsx` | Add "Quizzes" tab alongside Modules/Assignments/Students/Live tabs | **TODO** |
| F4.18 | Create `QuizPage.tsx` | Student-facing quiz page: timer (if time_limit set), question navigation sidebar, answer inputs per type, submit button | **TODO** |
| F4.19 | Quiz timer component | Countdown from `time_limit` minutes; auto-submit on expiry; persist `started_at` | **TODO** |
| F4.20 | Question navigation panel | Numbered buttons showing answered/unanswered/flagged status; click to jump to question | **TODO** |
| F4.21 | Auto-grading logic | Client-side scoring: MCQ exact match, T/F exact match, fill_blank case-insensitive compare, matching pair-by-pair; short_answer marked for manual review | **TODO** |
| F4.22 | Submit quiz mutation | Insert/update `quiz_attempts` with answers JSONB + computed score + `completed_at` | **TODO** |
| F4.23 | Create `QuizResults.tsx` | Results page: total score, per-question breakdown (correct/incorrect/partial), correct answers (if `show_answers` is true) | **TODO** |
| F4.24 | Attempt limit enforcement | Check existing completed attempts count before allowing new attempt | **TODO** |
| F4.25 | Randomization | Shuffle question order on quiz load when `randomize` is true (client-side shuffle) | **TODO** |
| F4.26 | Teacher analytics panel | In `TeacherCourseDetail.tsx` quiz section: average score, question-level difficulty, most common wrong answers | **TODO** |
| F4.27 | Student quiz list in `CourseDetail.tsx` | Add "Quizzes" tab showing available quizzes with attempt status | **TODO** |
| F4.28 | Routes for quiz pages | `/courses/:courseId/quizzes/:quizId` and `/courses/:courseId/quizzes/:quizId/results/:attemptId` in `App.tsx` | **TODO** |
| F4.29 | Update Supabase types | Add `quizzes`, `quiz_questions`, `quiz_attempts` to `types.ts` | **TODO** |

### F5: Enhanced Video Player

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F5.1 | Create `VideoPlayer.tsx` component | Unified player supporting YouTube embeds, Vimeo embeds, and direct MP4 URLs | **TODO** |
| F5.2 | URL type detection | Parse `video_url` to detect YouTube (`youtube.com/embed`, `youtu.be`), Vimeo (`vimeo.com`), or direct MP4 URL | **TODO** |
| F5.3 | YouTube/Vimeo embed rendering | `<iframe>` with enhanced attributes: `allow="autoplay; fullscreen; picture-in-picture"` | **TODO** |
| F5.4 | HTML5 video player for MP4 | `<video>` element with custom controls overlay | **TODO** |
| F5.5 | Playback speed controls | Speed selector: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x; persisted in localStorage | **TODO** |
| F5.6 | Volume control | Slider-based volume control with mute toggle icon | **TODO** |
| F5.7 | Fullscreen toggle | Button to enter/exit fullscreen via Fullscreen API | **TODO** |
| F5.8 | Custom controls bar | Play/pause, progress scrubber, time display, speed, volume, fullscreen in a bottom overlay bar | **TODO** |
| F5.9 | Create `video_progress` table | `id UUID PK, student_id UUID FK auth.users, lesson_id UUID FK lessons, position_seconds NUMERIC DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT now()` | **TODO** |
| F5.10 | RLS for `video_progress` | SELECT/INSERT/UPDATE: students for own records only | **TODO** |
| F5.11 | Create `useVideoProgress` hook | Fetch saved position for lesson; mutation to update position (debounced, every 5 seconds) | **TODO** |
| F5.12 | Resume from saved position | On player load, seek to `position_seconds` from DB; show "Resume from X:XX?" toast | **TODO** |
| F5.13 | Replace iframe in `LessonPage.tsx` | Swap `<iframe>` block with `<VideoPlayer url={lesson.video_url} lessonId={lesson.id} />` | **TODO** |
| F5.14 | Video player responsive design | `aspect-video` wrapper, controls scale on mobile, touch-friendly scrubber | **TODO** |

### F6: Secure File Access

| # | Subtask | Description | Status |
|---|---------|-------------|--------|
| F6.1 | Create `useSignedUrl` hook | Given a storage path, call `supabase.storage.from('submissions').createSignedUrl(path, 3600)` and return the URL | **TODO** |
| F6.2 | Update `AssignmentSubmissions.tsx` | Replace plain file reference with a "Download" button that fetches a signed URL and opens it | **TODO** |
| F6.3 | Update `AssignmentPage.tsx` | Show download link for own submitted file using signed URL | **TODO** |
| F6.4 | File type validation on upload | Client-side whitelist check before upload: `pdf, doc, docx, jpg, png, txt`; reject others with toast | **TODO** |
| F6.5 | File type validation constants | Create `src/lib/fileValidation.ts` with `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE`, validation functions | **TODO** |
| F6.6 | Max file size validation | Check `file.size <= 10 * 1024 * 1024` (10MB) before upload; show toast error if exceeded | **TODO** |
| F6.7 | Integrate validation into `AssignmentPage.tsx` upload | Wrap the existing `<Input type="file">` with type/size validation before `submitMutation` | **TODO** |
| F6.8 | Signed URL expiration handling | If signed URL fails (expired), show error toast and allow re-fetch | **TODO** |
| F6.9 | File type icon display | Show appropriate icon (PDF, DOC, image, text) based on file extension in submission views | **TODO** |

---

## 4. Scaffolding Requirements

### 4.1 New Files to Create

| File | Type | Purpose |
|------|------|---------|
| `supabase/migrations/2026XXXX_phase4_subjects_grades.sql` | Migration | F1: subjects, grade_levels tables, FKs on courses, profiles extensions, seed data |
| `supabase/migrations/2026XXXX_phase4_quiz_engine.sql` | Migration | F4: quizzes, quiz_questions, quiz_attempts tables + RLS |
| `supabase/migrations/2026XXXX_phase4_video_progress.sql` | Migration | F5: video_progress table + RLS |
| `supabase/migrations/2026XXXX_phase4_course_thumbnails_bucket.sql` | Migration | F3: course-thumbnails Storage bucket + policies |
| `src/hooks/useSubjects.ts` | Hook | F1: Fetch all subjects |
| `src/hooks/useGradeLevels.ts` | Hook | F1: Fetch all grade levels ordered by position |
| `src/hooks/useQuizzes.ts` | Hook | F4: Fetch quizzes for a course |
| `src/hooks/useQuizQuestions.ts` | Hook | F4: Fetch questions for a quiz |
| `src/hooks/useQuizAttempts.ts` | Hook | F4: Fetch attempts for a quiz by student |
| `src/hooks/useVideoProgress.ts` | Hook | F5: Fetch/update video progress for a lesson |
| `src/hooks/useSignedUrl.ts` | Hook | F6: Generate signed URLs for file downloads |
| `src/components/RichTextEditor.tsx` | Component | F2: TipTap WYSIWYG editor with toolbar |
| `src/components/RichTextViewer.tsx` | Component | F2: Read-only rich content renderer |
| `src/components/ImageUpload.tsx` | Component | F3: Image upload with preview, validation |
| `src/components/VideoPlayer.tsx` | Component | F5: Enhanced video player with controls |
| `src/components/teacher/QuizBuilder.tsx` | Component | F4: Teacher quiz creation/editing UI |
| `src/components/quiz/QuestionForm.tsx` | Component | F4: Type-specific question form (MCQ, T/F, fill-blank, matching, short answer) |
| `src/components/quiz/QuizTimer.tsx` | Component | F4: Countdown timer for quiz taking |
| `src/components/quiz/QuestionNav.tsx` | Component | F4: Question navigation sidebar/panel |
| `src/pages/QuizPage.tsx` | Page | F4: Student quiz-taking page |
| `src/pages/QuizResults.tsx` | Page | F4: Quiz results/review page |
| `src/pages/admin/AdminSubjects.tsx` | Page | F1: Admin CRUD for subjects |
| `src/pages/admin/AdminGradeLevels.tsx` | Page | F1: Admin CRUD for grade levels |
| `src/lib/fileValidation.ts` | Utility | F6: File type/size validation constants and functions |
| `src/lib/quizGrading.ts` | Utility | F4: Auto-grading logic for quiz answers |
| `src/lib/videoUrlParser.ts` | Utility | F5: Parse video URLs to detect YouTube/Vimeo/MP4 |
| `src/test/hooks/useSubjects.test.ts` | Test | F1: Unit tests for subjects hook |
| `src/test/hooks/useGradeLevels.test.ts` | Test | F1: Unit tests for grade levels hook |
| `src/test/hooks/useSignedUrl.test.ts` | Test | F6: Unit tests for signed URL hook |
| `src/test/hooks/useVideoProgress.test.ts` | Test | F5: Unit tests for video progress hook |
| `src/test/hooks/useQuizzes.test.ts` | Test | F4: Unit tests for quizzes hook |
| `src/test/components/RichTextEditor.test.tsx` | Test | F2: Component tests for editor |
| `src/test/components/VideoPlayer.test.tsx` | Test | F5: Component tests for video player |
| `src/test/components/ImageUpload.test.tsx` | Test | F3: Component tests for image upload |
| `src/test/pages/QuizPage.test.tsx` | Test | F4: Component tests for quiz taking |
| `src/test/pages/QuizResults.test.tsx` | Test | F4: Component tests for quiz results |
| `src/test/lib/quizGrading.test.ts` | Test | F4: Unit tests for grading logic |
| `src/test/lib/fileValidation.test.ts` | Test | F6: Unit tests for file validation |
| `src/test/lib/videoUrlParser.test.ts` | Test | F5: Unit tests for URL parsing |

### 4.2 Existing Files to Modify

| File | Change |
|------|--------|
| `src/integrations/supabase/types.ts` | Add `subjects`, `grade_levels`, `quizzes`, `quiz_questions`, `quiz_attempts`, `video_progress` table types; update `courses` type with `subject_id`, `grade_level_id`; update `profiles` type with `grade_level_id` |
| `src/pages/Courses.tsx` | Add subject/grade filter dropdowns; update query to join subjects/grade_levels; display subject/grade badges on cards; show thumbnail images |
| `src/pages/CourseDetail.tsx` | Show subject/grade badges; add "Quizzes" tab; show thumbnail banner |
| `src/pages/LessonPage.tsx` | Replace `<iframe>` with `<VideoPlayer>`; replace `dangerouslySetInnerHTML` with `<RichTextViewer>` |
| `src/pages/AssignmentPage.tsx` | Add file type/size validation on upload; add signed URL download for submitted files |
| `src/pages/teacher/CreateCourse.tsx` | Add subject select, grade-level select, thumbnail upload |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Add "Quizzes" tab with `QuizBuilder`; replace lesson content `<Textarea>` with `<RichTextEditor>`; show/edit subject + grade; show/change thumbnail |
| `src/pages/teacher/AssignmentSubmissions.tsx` | Add signed URL download button for student file submissions; show file type icons |
| `src/pages/Profile.tsx` | Add grade-level select for students; add subject expertise multi-select for teachers |
| `src/pages/admin/AdminCourses.tsx` | Show subject/grade columns in the table |
| `src/components/AppSidebar.tsx` | Add "Subjects" and "Grade Levels" to `adminNav` |
| `src/components/EnrolledCourseCard.tsx` | Show thumbnail when available instead of letter icon |
| `src/App.tsx` | Add routes: `/admin/subjects`, `/admin/grade-levels`, `/courses/:courseId/quizzes/:quizId`, `/courses/:courseId/quizzes/:quizId/results/:attemptId` |
| `package.json` | Add TipTap, KaTeX, lowlight dependencies |

### 4.3 New Dependencies

| Dependency | Purpose | Install Command |
|------------|---------|-----------------|
| `@tiptap/react` | TipTap React bindings | `npm install @tiptap/react` |
| `@tiptap/starter-kit` | TipTap base extensions (bold, italic, headings, lists, etc.) | `npm install @tiptap/starter-kit` |
| `@tiptap/extension-link` | Link support in editor | `npm install @tiptap/extension-link` |
| `@tiptap/extension-image` | Image embedding in editor | `npm install @tiptap/extension-image` |
| `@tiptap/extension-code-block-lowlight` | Code blocks with syntax highlighting | `npm install @tiptap/extension-code-block-lowlight` |
| `lowlight` | Syntax highlighting engine for code blocks | `npm install lowlight` |
| `katex` | LaTeX math equation rendering | `npm install katex` |
| `@types/katex` | TypeScript types for KaTeX | `npm install -D @types/katex` |

### 4.4 Type Definitions

```typescript
// --- F1: Subjects & Grade Levels ---

// src/integrations/supabase/types.ts additions
interface SubjectRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

interface GradeLevelRow {
  id: string;
  name: string;
  position: number;
  created_at: string;
}

// courses table additions
interface CourseRowUpdated {
  // ...existing fields...
  subject_id: string | null;
  grade_level_id: string | null;
}

// profiles table additions
interface ProfileRowUpdated {
  // ...existing fields...
  grade_level_id: string | null;
}

// --- F4: Quiz Engine ---

interface QuizRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  time_limit: number | null;       // minutes
  attempt_limit: number;
  randomize: boolean;
  show_answers: boolean;
  created_at: string;
}

type QuestionType = "mcq" | "fill_blank" | "true_false" | "matching" | "short_answer";

interface QuizQuestionRow {
  id: string;
  quiz_id: string;
  type: QuestionType;
  question_text: string;
  options: Json;           // MCQ: string[]; Matching: {left: string[], right: string[]}; etc.
  correct_answer: Json;    // MCQ: string | string[]; T/F: boolean; fill_blank: string[]; matching: Record<string,string>
  points: number;
  position: number;
  created_at: string;
}

interface QuizAttemptRow {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Json;           // Record<questionId, studentAnswer>
  score: number | null;
  max_score: number;
  started_at: string;
  completed_at: string | null;
}

// --- F5: Video Progress ---

interface VideoProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  position_seconds: number;
  updated_at: string;
}

// --- F5: Video URL Parser ---

type VideoType = "youtube" | "vimeo" | "mp4" | "unknown";

interface ParsedVideoUrl {
  type: VideoType;
  embedUrl: string;        // For YouTube/Vimeo: embed URL; for MP4: direct URL
  videoId?: string;        // YouTube/Vimeo video ID
}

// --- F4: Quiz Grading ---

interface GradingResult {
  totalScore: number;
  maxScore: number;
  perQuestion: Array<{
    questionId: string;
    earned: number;
    max: number;
    correct: boolean;
    correctAnswer: Json;
    studentAnswer: Json;
  }>;
}

// --- F6: File Validation ---

interface FileValidationResult {
  valid: boolean;
  error?: string;
}
```

### 4.5 DB Migrations

**Migration 1: Subjects & Grade Levels**

```sql
-- subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins can insert subjects" ON public.subjects FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subjects" ON public.subjects FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- grade_levels table
CREATE TABLE public.grade_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view grade_levels" ON public.grade_levels FOR SELECT USING (true);
CREATE POLICY "Admins can insert grade_levels" ON public.grade_levels FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update grade_levels" ON public.grade_levels FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete grade_levels" ON public.grade_levels FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add FKs to courses
ALTER TABLE public.courses ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
ALTER TABLE public.courses ADD COLUMN grade_level_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL;

-- Add grade_level to profiles
ALTER TABLE public.profiles ADD COLUMN grade_level_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL;

-- Teacher-subject expertise junction table
CREATE TABLE public.teacher_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (teacher_id, subject_id)
);
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teacher_subjects" ON public.teacher_subjects FOR SELECT USING (true);
CREATE POLICY "Teachers can manage own subjects" ON public.teacher_subjects FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete own subjects" ON public.teacher_subjects FOR DELETE USING (auth.uid() = teacher_id);

-- Seed subjects
INSERT INTO public.subjects (name, description, icon) VALUES
  ('Mathematics', 'Numbers, algebra, geometry, and calculus', 'calculator'),
  ('Science', 'General science concepts', 'flask-conical'),
  ('English', 'English language and literature', 'book-open'),
  ('Hindi', 'Hindi language and literature', 'languages'),
  ('Social Studies', 'History, geography, and civics', 'globe'),
  ('Computer Science', 'Programming, algorithms, and digital literacy', 'monitor'),
  ('Physics', 'Mechanics, thermodynamics, optics, and modern physics', 'atom'),
  ('Chemistry', 'Elements, compounds, reactions, and organic chemistry', 'test-tubes'),
  ('Biology', 'Life sciences, anatomy, and ecology', 'leaf'),
  ('History', 'World and Indian history', 'landmark'),
  ('Geography', 'Physical and human geography', 'map'),
  ('Economics', 'Micro and macroeconomics', 'trending-up'),
  ('Art', 'Visual arts and creative expression', 'palette'),
  ('Music', 'Music theory and practice', 'music'),
  ('Physical Education', 'Sports, fitness, and health', 'dumbbell');

-- Seed grade levels
INSERT INTO public.grade_levels (name, position) VALUES
  ('KG', 0),
  ('Class 1', 1),
  ('Class 2', 2),
  ('Class 3', 3),
  ('Class 4', 4),
  ('Class 5', 5),
  ('Class 6', 6),
  ('Class 7', 7),
  ('Class 8', 8),
  ('Class 9', 9),
  ('Class 10', 10),
  ('Class 11', 11),
  ('Class 12', 12);
```

**Migration 2: Quiz Engine**

```sql
-- quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER,
  attempt_limit INTEGER NOT NULL DEFAULT 1,
  randomize BOOLEAN NOT NULL DEFAULT false,
  show_answers BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Teachers can create quizzes" ON public.quizzes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update quizzes" ON public.quizzes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);
CREATE POLICY "Teachers can delete quizzes" ON public.quizzes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);

-- quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mcq', 'fill_blank', 'true_false', 'matching', 'short_answer')),
  question_text TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz_questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can create questions" ON public.quiz_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = quiz_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update questions" ON public.quiz_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = quiz_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can delete questions" ON public.quiz_questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = quiz_id AND c.teacher_id = auth.uid())
);

-- quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  score NUMERIC,
  max_score INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view course attempts" ON public.quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = quiz_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Students can create attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id);
```

**Migration 3: Video Progress**

```sql
CREATE TABLE public.video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  position_seconds NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own video progress" ON public.video_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own video progress" ON public.video_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own video progress" ON public.video_progress FOR UPDATE USING (auth.uid() = student_id);
```

**Migration 4: Course Thumbnails Bucket**

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true);

CREATE POLICY "Anyone can view course thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Teachers can upload course thumbnails" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'teacher')
);
CREATE POLICY "Teachers can update course thumbnails" ON storage.objects FOR UPDATE USING (
  bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'teacher')
);
CREATE POLICY "Teachers can delete course thumbnails" ON storage.objects FOR DELETE USING (
  bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'teacher')
);
```

### 4.6 Existing Patterns to Reuse

| Pattern | Source File | Reuse In |
|---------|------------|----------|
| Role-based enrollment query | `src/pages/LiveClasses.tsx:12-19` | Quiz hooks (check enrollment before allowing attempt) |
| Course ID extraction from enrollments | `src/pages/LiveClasses.tsx:24` | Quiz enrollment check |
| `enabled` flag for dependent queries | `src/pages/LiveClasses.tsx:33` | All new hooks |
| Supabase join syntax `select("*, courses(title)")` | `src/pages/LiveClasses.tsx:29` | Quiz hooks, subject/grade joins |
| Loading spinner | `src/pages/Courses.tsx:64-66` | All new pages |
| Empty state card | `src/pages/Courses.tsx:67-73` | All new pages |
| `useAuth()` for user ID | `src/pages/LiveClasses.tsx:10` | All new hooks |
| `useUserRole()` for role checks | `src/pages/teacher/TeacherCourseDetail.tsx:6` | Quiz builder, admin pages |
| Dialog form pattern | `src/pages/teacher/TeacherCourseDetail.tsx:217-256` | Quiz builder dialogs, admin CRUD dialogs |
| Tabs pattern | `src/pages/teacher/TeacherCourseDetail.tsx:103-109` | Adding quiz tab |
| Table rendering pattern | `src/pages/admin/AdminCourses.tsx:78-182` | Admin subjects/grades tables |
| Storage upload pattern | `src/pages/AssignmentPage.tsx:48-52` | Thumbnail upload |
| Mutation with toast feedback | `src/pages/teacher/CreateCourse.tsx:23-37` | All new mutations |
| Badge variants | `src/pages/admin/AdminCourses.tsx:14-18` | Subject/grade badges |

---

## 5. Implementation Plan

### Step 1: DB Migrations & Type Updates (30 min)

| Task | File | Change |
|------|------|--------|
| F1 migration | `supabase/migrations/2026XXXX_phase4_subjects_grades.sql` | Create subjects, grade_levels, teacher_subjects tables; alter courses + profiles; seed data; RLS policies |
| F4 migration | `supabase/migrations/2026XXXX_phase4_quiz_engine.sql` | Create quizzes, quiz_questions, quiz_attempts tables; RLS policies |
| F5 migration | `supabase/migrations/2026XXXX_phase4_video_progress.sql` | Create video_progress table; RLS |
| F3 migration | `supabase/migrations/2026XXXX_phase4_course_thumbnails_bucket.sql` | Create course-thumbnails bucket; storage policies |
| Type updates | `src/integrations/supabase/types.ts` | Add all new table types; update courses and profiles Row/Insert/Update types |

### Step 2: Install Dependencies (5 min)

| Task | Command |
|------|---------|
| TipTap + extensions | `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight lowlight` |
| KaTeX | `npm install katex && npm install -D @types/katex` |

### Step 3: Utility Modules (30 min)

| Task | File | Detail |
|------|------|--------|
| F6: File validation | `src/lib/fileValidation.ts` | `ALLOWED_SUBMISSION_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']`; `ALLOWED_THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/webp']`; `MAX_SUBMISSION_SIZE = 10 * 1024 * 1024`; `MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024`; `validateFile(file, allowedTypes, maxSize): FileValidationResult` |
| F4: Quiz grading | `src/lib/quizGrading.ts` | `gradeQuiz(questions, answers): GradingResult`; MCQ: exact match of selected option(s); T/F: boolean match; fill_blank: case-insensitive trim compare against any accepted answer; matching: pair-by-pair comparison; short_answer: mark as `needs_review` |
| F5: Video URL parser | `src/lib/videoUrlParser.ts` | `parseVideoUrl(url): ParsedVideoUrl`; detect YouTube by regex `/youtube\.com|youtu\.be/`; detect Vimeo by regex `/vimeo\.com/`; extract embed URL; otherwise treat as MP4 |

### Step 4: Data Hooks (45 min)

| Task | File | Detail |
|------|------|--------|
| F1: `useSubjects` | `src/hooks/useSubjects.ts` | `useQuery({ queryKey: ["subjects"], queryFn: supabase.from("subjects").select("*").order("name") })` |
| F1: `useGradeLevels` | `src/hooks/useGradeLevels.ts` | `useQuery({ queryKey: ["grade-levels"], queryFn: supabase.from("grade_levels").select("*").order("position") })` |
| F4: `useQuizzes` | `src/hooks/useQuizzes.ts` | Accept `courseId`; fetch quizzes for that course; staleTime 2 min |
| F4: `useQuizQuestions` | `src/hooks/useQuizQuestions.ts` | Accept `quizId`; fetch questions ordered by position; enabled when quizId truthy |
| F4: `useQuizAttempts` | `src/hooks/useQuizAttempts.ts` | Accept `quizId`, `studentId`; fetch completed attempts; enabled when both truthy |
| F5: `useVideoProgress` | `src/hooks/useVideoProgress.ts` | Accept `lessonId`; query: fetch position_seconds for current user + lesson; mutation: upsert position_seconds (debounced); return `{ savedPosition, updatePosition }` |
| F6: `useSignedUrl` | `src/hooks/useSignedUrl.ts` | Accept `bucket`, `path`; call `supabase.storage.from(bucket).createSignedUrl(path, 3600)`; return `{ signedUrl, isLoading, refetch }` |

### Step 5: F1 — Subject & Grade-Level Management (2 hours)

| Subtask | File | Detail |
|---------|------|--------|
| Admin Subjects page | `src/pages/admin/AdminSubjects.tsx` | Table listing all subjects; Add Subject dialog (name, description, icon); Edit dialog; Delete button with confirm; follows `AdminCourses.tsx` pattern with Table + Dialog |
| Admin Grade Levels page | `src/pages/admin/AdminGradeLevels.tsx` | Table with position ordering; Add Grade Level dialog (name, position); Edit dialog; Delete with confirm; reorder via position field |
| Admin sidebar links | `src/components/AppSidebar.tsx` | Add `{ title: "Subjects", url: "/admin/subjects", icon: BookMarked }` and `{ title: "Grade Levels", url: "/admin/grade-levels", icon: GraduationCap }` to `adminNav` array |
| Admin routes | `src/App.tsx` | Add `<Route path="/admin/subjects" element={<AdminSubjects />} />` and `<Route path="/admin/grade-levels" element={<AdminGradeLevels />} />` |
| Course creation form update | `src/pages/teacher/CreateCourse.tsx` | Add subject `Select` (populated from `useSubjects`) and grade-level `Select` (populated from `useGradeLevels`) between description and submit button; include `subject_id` and `grade_level_id` in insert mutation |
| Teacher course detail update | `src/pages/teacher/TeacherCourseDetail.tsx` | Show subject + grade Badge in course header; add edit capability via inline Select dropdowns |
| Course browse filters | `src/pages/Courses.tsx` | Add two `Select` dropdowns (Subject: "All Subjects" + subjects list; Grade: "All Grades" + grade levels list) next to search; update query to conditionally add `.eq("subject_id", subjectFilter)` and `.eq("grade_level_id", gradeFilter)`; join subjects/grade_levels for display: `.select("*, subjects(name), grade_levels(name)")` |
| Profile extensions | `src/pages/Profile.tsx` | For students: add grade-level `Select` (from `useGradeLevels`); mutation to update `profiles.grade_level_id`; For teachers: add subject expertise multi-select checkboxes; mutations to insert/delete from `teacher_subjects` |
| Admin courses table update | `src/pages/admin/AdminCourses.tsx` | Add Subject and Grade columns to the table; join data: `.select("*, subjects(name), grade_levels(name)")` |

### Step 6: F2 — Rich Content Editor (1.5 hours)

| Subtask | File | Detail |
|---------|------|--------|
| Editor component | `src/components/RichTextEditor.tsx` | TipTap `useEditor` with extensions: `StarterKit` (bold, italic, strike, h1-h3, bullet list, ordered list, blockquote, code), `Link.configure({ openOnClick: false })`, `Image`, `CodeBlockLowlight.configure({ lowlight })`. Props: `content: string`, `onChange: (html: string) => void`. Toolbar with `Toggle` buttons grouped by: text format (B, I, S), headings (H1, H2, H3), lists (UL, OL), insert (Link, Image, Code Block). Each button calls `editor.chain().focus().toggleX().run()` |
| Link dialog | Inside `RichTextEditor.tsx` | `Dialog` with URL `Input`; "Set Link" button calls `editor.chain().focus().setLink({ href: url }).run()` |
| Image dialog | Inside `RichTextEditor.tsx` | `Dialog` with URL `Input`; "Insert Image" button calls `editor.chain().focus().setImage({ src: url }).run()` |
| KaTeX integration | Inside `RichTextEditor.tsx` | Post-process HTML: scan for `$...$` and `$$...$$` patterns; render via `katex.renderToString()`; or create a custom TipTap node for math blocks |
| Editor styles | `src/index.css` or component-scoped | Import `katex/dist/katex.min.css`; TipTap prose styles: `.ProseMirror { outline: none; min-height: 200px; }`, `.ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #adb5bd; }` |
| Viewer component | `src/components/RichTextViewer.tsx` | Read-only TipTap instance with same extensions but `editable: false`; or use `generateHTML()` from `@tiptap/html` + render sanitized HTML with KaTeX post-processing. Props: `content: string` |
| Integrate into lesson creation | `src/pages/teacher/TeacherCourseDetail.tsx` | In `ModuleCard`, replace `<Textarea placeholder="Lesson content..." value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} rows={3} />` (line 333) with `<RichTextEditor content={lessonContent} onChange={setLessonContent} />` |
| Integrate into lesson display | `src/pages/LessonPage.tsx` | Replace `<div dangerouslySetInnerHTML={{ __html: lesson.content }} />` (line 71) with `<RichTextViewer content={lesson.content} />` |

### Step 7: F3 — Course Thumbnails (1 hour)

| Subtask | File | Detail |
|---------|------|--------|
| ImageUpload component | `src/components/ImageUpload.tsx` | Props: `value: string | null` (current URL), `onChange: (url: string | null) => void`, `bucket: string`, `folder: string`. Renders: dashed border drop zone with "Click or drag to upload" text; if value exists, shows preview `<img>` with remove button. On file select: validate type (jpg/png/webp) + size (2MB) using `fileValidation.ts`; upload to `supabase.storage.from(bucket).upload(folder/filename, file)`; get public URL via `supabase.storage.from(bucket).getPublicUrl(path)`; call `onChange(publicUrl)` |
| Integrate into CreateCourse | `src/pages/teacher/CreateCourse.tsx` | Add state `const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)`; add `<ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} bucket="course-thumbnails" folder={user!.id} />` above submit button; include `thumbnail_url: thumbnailUrl` in insert mutation |
| Integrate into TeacherCourseDetail | `src/pages/teacher/TeacherCourseDetail.tsx` | In course header area, show current thumbnail if exists; add change/remove buttons; update mutation to set `thumbnail_url` |
| Update Courses.tsx cards | `src/pages/Courses.tsx` | Replace the `<div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 ...">` block (line 80-82): if `course.thumbnail_url` render `<img src={course.thumbnail_url} className="h-32 w-full object-cover" />`; otherwise keep gradient fallback |
| Update EnrolledCourseCard | `src/components/EnrolledCourseCard.tsx` | Accept optional `thumbnailUrl` prop; replace the letter-icon `<div>` (line 54-56) with `<img>` when thumbnail available; keep letter fallback |
| Update CourseDetail header | `src/pages/CourseDetail.tsx` | Add thumbnail banner above course title when `course.thumbnail_url` exists |
| Update Dashboard cards | `src/pages/Dashboard.tsx` | Pass `thumbnailUrl` from enrollment data to `EnrolledCourseCard` |

### Step 8: F4 — Quiz Engine (3 hours)

| Subtask | File | Detail |
|---------|------|--------|
| QuestionForm component | `src/components/quiz/QuestionForm.tsx` | Props: `question?: QuizQuestionRow` (for edit), `onSave: (data) => void`, `onCancel: () => void`. Renders: question type Select, question text Textarea. Conditionally renders type-specific fields: **MCQ**: dynamic options Input list + add/remove + radio/checkbox for correct; **T/F**: Switch for correct answer; **Fill blank**: Input for accepted answers (comma-separated); **Matching**: dual-column Input list for left/right pairs; **Short answer**: Textarea for expected keywords/rubric. Serializes into `options` JSONB + `correct_answer` JSONB |
| QuizBuilder component | `src/components/teacher/QuizBuilder.tsx` | Props: `courseId: string`. State: selected quiz, edit mode. Renders: "Create Quiz" Dialog (title, description, time_limit, attempt_limit, randomize toggle, show_answers toggle); list of existing quizzes as Cards; expand quiz to see questions list; "Add Question" opens `QuestionForm`; questions displayed with type badge, points, edit/delete buttons; question reordering via up/down arrow buttons updating `position` |
| Quiz timer component | `src/components/quiz/QuizTimer.tsx` | Props: `timeLimit: number` (minutes), `startedAt: string`, `onTimeUp: () => void`. Computes remaining time = `timeLimit * 60 - (now - startedAt in seconds)`; uses `setInterval(1000)` to count down; displays `MM:SS`; changes color to red when <60s; calls `onTimeUp()` when hits 0 |
| Question navigation | `src/components/quiz/QuestionNav.tsx` | Props: `questions: QuizQuestionRow[]`, `answers: Record<string, any>`, `currentIndex: number`, `onSelect: (index: number) => void`. Renders numbered buttons: green if answered, gray if unanswered, ring if current |
| QuizPage | `src/pages/QuizPage.tsx` | Route params: `courseId`, `quizId`. On mount: check enrollment; check attempt limit; create new attempt row if allowed; fetch questions. State: `currentIndex`, `answers: Record<questionId, value>`, attempt row. Renders: timer (if time_limit), question navigation panel (left), current question (center) with type-specific answer input, prev/next/submit buttons. On submit: call `gradeQuiz()` from `quizGrading.ts`; update attempt with score + completed_at; navigate to results |
| QuizResults page | `src/pages/QuizResults.tsx` | Route params: `courseId`, `quizId`, `attemptId`. Fetch attempt + questions. Display: score banner (X/Y, percentage, pass/fail), per-question cards showing question text, student answer, correct answer (if `show_answers`), earned points. Color-code correct (green), incorrect (red), partial (yellow) |
| Quiz tab in TeacherCourseDetail | `src/pages/teacher/TeacherCourseDetail.tsx` | Add `<TabsTrigger value="quizzes">Quizzes</TabsTrigger>` to TabsList; add `<TabsContent value="quizzes"><QuizBuilder courseId={courseId!} /></TabsContent>` |
| Quiz tab in student CourseDetail | `src/pages/CourseDetail.tsx` | Add "Quizzes" tab; fetch quizzes via `useQuizzes(courseId)`; list with title, time_limit info, attempt count vs limit; Link to `/courses/:courseId/quizzes/:quizId` |
| Teacher analytics panel | `src/components/teacher/QuizBuilder.tsx` | For each quiz: fetch all attempts; compute average score, per-question stats (% correct, most common wrong answer from JSONB analysis); display in expandable analytics section |
| Routes | `src/App.tsx` | Add: `<Route path="/courses/:courseId/quizzes/:quizId" element={<QuizPage />} />`, `<Route path="/courses/:courseId/quizzes/:quizId/results/:attemptId" element={<QuizResults />} />` |

### Step 9: F5 — Enhanced Video Player (1.5 hours)

| Subtask | File | Detail |
|---------|------|--------|
| URL parser utility | `src/lib/videoUrlParser.ts` | `parseVideoUrl(url)`: regex match YouTube patterns (embed, watch, youtu.be) -> extract video ID -> construct `https://www.youtube.com/embed/{id}`; Vimeo patterns -> `https://player.vimeo.com/video/{id}`; else return as MP4 type |
| VideoPlayer component | `src/components/VideoPlayer.tsx` | Props: `url: string`, `lessonId: string`. Uses `parseVideoUrl` to determine type. **YouTube/Vimeo**: render `<iframe>` with `allowFullScreen`, `allow="autoplay; fullscreen; picture-in-picture"`. **MP4**: render `<video>` with custom controls overlay. Component wraps in `aspect-video` Card |
| MP4 custom controls | Inside `VideoPlayer.tsx` | Custom overlay bar: play/pause toggle (Play/Pause icons), progress slider (shadcn `Slider`), time display (`currentTime / duration` formatted as MM:SS), speed Select (0.5x-2x), volume Slider + mute toggle (Volume2/VolumeX icons), fullscreen toggle (Maximize/Minimize icons). Use `useRef<HTMLVideoElement>` + event listeners (`timeupdate`, `loadedmetadata`, `ended`) |
| Playback speed persistence | Inside `VideoPlayer.tsx` | Store selected speed in `localStorage` key `video-playback-speed`; restore on mount; apply via `videoRef.current.playbackRate` |
| Video progress hook | `src/hooks/useVideoProgress.ts` | `useVideoProgress(lessonId)`: query fetches `video_progress` for current user + lesson; mutation upserts `position_seconds`; debounce updates to every 5 seconds using `useRef` + `setTimeout` pattern |
| Resume from saved position | Inside `VideoPlayer.tsx` | On MP4 load: if `savedPosition > 0`, show toast "Resume from X:XX?" with "Resume" action; on click, seek `videoRef.current.currentTime = savedPosition`; otherwise start from 0 |
| Progress tracking integration | Inside `VideoPlayer.tsx` | On `timeupdate` event (MP4): call debounced `updatePosition(currentTime)` every 5 seconds |
| Replace iframe in LessonPage | `src/pages/LessonPage.tsx` | Replace lines 54-65 (`<Card><CardContent><div className="aspect-video"><iframe ...>`) with `<VideoPlayer url={lesson.video_url} lessonId={lesson.id} />` |
| Responsive design | Inside `VideoPlayer.tsx` | `aspect-video` wrapper; controls bar uses `flex-wrap` on small screens; touch-friendly scrubber with larger hit area on mobile |

### Step 10: F6 — Secure File Access (45 min)

| Subtask | File | Detail |
|---------|------|--------|
| Signed URL hook | `src/hooks/useSignedUrl.ts` | `useSignedUrl(path: string | null, bucket = 'submissions')`: if path is null return `{ signedUrl: null }`; query calls `supabase.storage.from(bucket).createSignedUrl(path, 3600)`; returns `{ signedUrl, isLoading, error, refetch }`; `staleTime: 50 * 60 * 1000` (50 min, under 1hr expiry) |
| File validation utility | `src/lib/fileValidation.ts` | Constants + `validateSubmissionFile(file: File)` and `validateThumbnailFile(file: File)` functions returning `{ valid, error }` |
| Update AssignmentSubmissions | `src/pages/teacher/AssignmentSubmissions.tsx` | For each submission with `file_url`: add a "Download" `Button`; on click, call `supabase.storage.from('submissions').createSignedUrl(sub.file_url, 3600)` then `window.open(signedUrl)`; show file type icon based on extension (FileText for PDF/DOC, Image for JPG/PNG, File for TXT) |
| Update AssignmentPage upload | `src/pages/AssignmentPage.tsx` | Before the `<Input type="file">`, add `accept=".pdf,.doc,.docx,.jpg,.png,.txt"` attribute; in `onChange` handler, validate with `validateSubmissionFile(file)`: check type against whitelist + size against 10MB; show `toast.error(result.error)` if invalid; clear selection |
| Update AssignmentPage download | `src/pages/AssignmentPage.tsx` | In the submitted file section (line 122 `📎 File attached`), replace with a "Download" button that fetches signed URL for `submission.file_url` and opens it |
| File type icons | Inside `AssignmentSubmissions.tsx` and `AssignmentPage.tsx` | Determine icon from file extension: `.pdf` -> FileText, `.doc/.docx` -> FileText, `.jpg/.png` -> Image, `.txt` -> FileCode; display alongside filename |

### Step 11: Tests (1.5 hours)

See [Section 6: Testing Plan](#6-testing-plan) for full details.

### Step 12: Debugging & Manual QA (45 min)

See [Section 7: Debugging Plan](#7-debugging-plan) for full details.

### Step 13: Review & Audit (30 min)

See [Section 8](#8-code-review-checklist) and [Section 9](#9-security--quality-audit) for full details.

### Step 14: Commit & Push (15 min)

See [Section 10: Git & Push Strategy](#10-git--push-strategy) for full details.

---

## 6. Testing Plan

### 6.1 Unit Tests — Utility Modules

**File:** `src/test/lib/fileValidation.test.ts`

| Test Case | Description |
|-----------|-------------|
| `validates allowed submission file types` | Pass PDF, DOC, DOCX, JPG, PNG, TXT files -> expect `{ valid: true }` |
| `rejects disallowed submission file types` | Pass .exe, .zip, .svg -> expect `{ valid: false, error: "..." }` |
| `rejects files exceeding 10MB` | Mock file with `size: 11 * 1024 * 1024` -> expect `{ valid: false }` |
| `accepts files at exactly 10MB` | Mock file with `size: 10 * 1024 * 1024` -> expect `{ valid: true }` |
| `validates allowed thumbnail file types` | Pass JPG, PNG, WEBP -> expect `{ valid: true }` |
| `rejects non-image thumbnail types` | Pass PDF, TXT -> expect `{ valid: false }` |
| `rejects thumbnails exceeding 2MB` | Mock file with `size: 3 * 1024 * 1024` -> expect `{ valid: false }` |

**File:** `src/test/lib/quizGrading.test.ts`

| Test Case | Description |
|-----------|-------------|
| `grades MCQ correctly for exact match` | Single correct option, student selects correct -> full points |
| `grades MCQ as incorrect for wrong answer` | Student selects wrong option -> 0 points |
| `grades true/false correctly` | Student answers true, correct is true -> full points |
| `grades true/false as incorrect` | Student answers false, correct is true -> 0 points |
| `grades fill_blank case-insensitively` | Correct "Photosynthesis", student types "photosynthesis" -> full points |
| `grades fill_blank with multiple accepted answers` | Correct ["CO2", "carbon dioxide"], student types "carbon dioxide" -> full points |
| `grades matching pair by pair` | 4 pairs, student gets 3 correct -> 3/4 * points |
| `marks short_answer as needs_review` | Any short answer -> earned = 0, flagged for manual review |
| `computes total score across mixed question types` | Multiple questions of different types -> correct total |
| `returns maxScore as sum of all points` | Questions with points 1, 2, 3 -> maxScore = 6 |
| `handles empty answers` | Student submits {} -> all 0 points |

**File:** `src/test/lib/videoUrlParser.test.ts`

| Test Case | Description |
|-----------|-------------|
| `detects YouTube embed URL` | Input `https://www.youtube.com/embed/abc123` -> type "youtube", embedUrl contains "embed/abc123" |
| `detects YouTube watch URL` | Input `https://www.youtube.com/watch?v=abc123` -> type "youtube", embedUrl `https://www.youtube.com/embed/abc123` |
| `detects YouTube short URL` | Input `https://youtu.be/abc123` -> type "youtube", videoId "abc123" |
| `detects Vimeo URL` | Input `https://vimeo.com/123456` -> type "vimeo", embedUrl `https://player.vimeo.com/video/123456` |
| `detects direct MP4 URL` | Input `https://example.com/video.mp4` -> type "mp4" |
| `returns unknown for unrecognized URL` | Input `https://random.com/page` -> type "unknown" |

### 6.2 Unit Tests — Hooks

**File:** `src/test/hooks/useSubjects.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns subjects list ordered by name` | Mock Supabase -> verify subjects returned in alphabetical order |
| `returns empty array when no subjects` | Mock empty response -> expect `[]` |
| `includes all seed subjects` | Verify count matches 15 expected subjects |

**File:** `src/test/hooks/useGradeLevels.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns grade levels ordered by position` | Mock Supabase -> verify KG first, Class 12 last |
| `returns empty array when no grade levels` | Mock empty response -> expect `[]` |

**File:** `src/test/hooks/useQuizzes.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns quizzes for a course` | Mock quiz data -> verify returned |
| `returns empty when course has no quizzes` | Mock empty -> expect `[]` |
| `is disabled when courseId is undefined` | Verify query not fired |

**File:** `src/test/hooks/useVideoProgress.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns saved position for lesson` | Mock progress row -> verify `savedPosition` value |
| `returns 0 when no saved progress` | Mock null -> expect `savedPosition: 0` |
| `updatePosition calls upsert correctly` | Verify mutation payload includes `lesson_id`, `student_id`, `position_seconds` |

**File:** `src/test/hooks/useSignedUrl.test.ts`

| Test Case | Description |
|-----------|-------------|
| `returns signed URL for valid path` | Mock `createSignedUrl` -> verify URL returned |
| `returns null when path is null` | Pass null path -> expect `signedUrl: null` |
| `handles createSignedUrl error` | Mock error -> verify error state |

### 6.3 Component Tests

**File:** `src/test/components/RichTextEditor.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders editor with toolbar` | Verify toolbar buttons (Bold, Italic, H1, etc.) are in DOM |
| `calls onChange when content changes` | Simulate typing -> verify callback fired with HTML |
| `initializes with provided content` | Pass HTML content -> verify rendered in editor |
| `bold button toggles bold formatting` | Click bold -> verify active state toggles |

**File:** `src/test/components/VideoPlayer.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders iframe for YouTube URL` | Pass YouTube URL -> verify `<iframe>` in DOM with embed src |
| `renders iframe for Vimeo URL` | Pass Vimeo URL -> verify `<iframe>` with Vimeo embed |
| `renders video element for MP4 URL` | Pass MP4 URL -> verify `<video>` element in DOM |
| `renders speed control` | Verify speed selector is present |
| `renders fullscreen button` | Verify fullscreen button exists |

**File:** `src/test/components/ImageUpload.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders upload zone when no value` | Verify "Click or drag to upload" text |
| `renders preview when value is set` | Pass URL as value -> verify `<img>` with that src |
| `shows remove button when value is set` | Pass URL -> verify remove button exists |
| `rejects file exceeding size limit` | Simulate file select with large file -> verify toast error |
| `rejects non-image file` | Simulate PDF file -> verify toast error |

**File:** `src/test/pages/QuizPage.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `renders quiz title and question` | Mock quiz + questions -> verify title and first question in DOM |
| `renders timer when time_limit is set` | Mock quiz with `time_limit: 30` -> verify timer display |
| `renders question navigation panel` | Mock 5 questions -> verify 5 numbered buttons |
| `clicking next moves to next question` | Click "Next" -> verify second question displayed |
| `submit button is present` | Verify "Submit Quiz" button in DOM |
| `shows attempt limit message when exceeded` | Mock max attempts reached -> verify "No attempts remaining" message |

**File:** `src/test/pages/QuizResults.test.tsx`

| Test Case | Description |
|-----------|-------------|
| `displays score banner` | Mock attempt with score 8/10 -> verify "8/10" and "80%" displayed |
| `shows correct answers when show_answers is true` | Mock quiz with `show_answers: true` -> verify correct answer cards |
| `hides correct answers when show_answers is false` | Mock quiz with `show_answers: false` -> verify no correct answers shown |
| `color codes correct and incorrect questions` | Verify green for correct, red for incorrect |

### 6.4 Test Commands

```bash
# Run all tests
npm run test

# Run in watch mode during development
npm run test:watch

# Run only Phase 4 tests
npx vitest run src/test/lib/ src/test/hooks/useSubjects.test.ts src/test/hooks/useGradeLevels.test.ts src/test/hooks/useQuizzes.test.ts src/test/hooks/useVideoProgress.test.ts src/test/hooks/useSignedUrl.test.ts src/test/components/RichTextEditor.test.tsx src/test/components/VideoPlayer.test.tsx src/test/components/ImageUpload.test.tsx src/test/pages/QuizPage.test.tsx src/test/pages/QuizResults.test.tsx

# Run with coverage
npx vitest run --coverage
```

---

## 7. Debugging Plan

### 7.1 Common Issues & How to Debug

| Issue | Debugging Steps |
|-------|-----------------|
| **Subjects/grade_levels not loading** | 1. Check Network tab for Supabase `subjects`/`grade_levels` requests, 2. Verify migration ran (check Supabase Dashboard Table Editor), 3. Check RLS — try `SELECT * FROM subjects` in SQL Editor, 4. Verify React Query DevTools shows query key `["subjects"]` |
| **Course creation fails with new FKs** | 1. Check if `subject_id`/`grade_level_id` are valid UUIDs, 2. These columns are nullable so null should be fine, 3. Check error message in toast for FK constraint violation, 4. Verify the referenced rows exist in subjects/grade_levels |
| **TipTap editor not rendering** | 1. Check console for import errors (missing extensions), 2. Verify all `@tiptap/*` packages installed, 3. Check that `useEditor` returns non-null, 4. Verify `EditorContent` has the editor prop, 5. Check CSS: `.ProseMirror` should have min-height |
| **TipTap content not saving** | 1. Verify `onUpdate` callback fires — add `console.log(editor.getHTML())`, 2. Check that `onChange` prop is called, 3. Verify HTML string stored in lesson.content column, 4. Check Supabase Table Editor for the lesson row |
| **KaTeX rendering broken** | 1. Verify `katex/dist/katex.min.css` imported, 2. Check for `$...$` pattern matching in content, 3. Verify `katex.renderToString()` not throwing on the LaTeX input, 4. Check browser console for KaTeX parse errors |
| **Thumbnail upload fails** | 1. Check Network tab for storage upload request, 2. Verify `course-thumbnails` bucket exists (Supabase Dashboard -> Storage), 3. Check storage RLS policies, 4. Verify file size/type validation passes client-side, 5. Check error message: "Bucket not found" means migration didn't run |
| **Thumbnail not displaying** | 1. Check `thumbnail_url` value in DB — should be full public URL, 2. Verify the URL is accessible (open in new tab), 3. If 403, check bucket is set to public, 4. Check `<img>` src attribute in DevTools |
| **Quiz questions not saving** | 1. Check mutation error in console, 2. Verify `quiz_id` FK is valid, 3. Check RLS — teacher must own the course that owns the quiz, 4. Verify JSONB serialization: `options` and `correct_answer` must be valid JSON |
| **Quiz auto-grading incorrect** | 1. Log inputs to `gradeQuiz()`: questions array + answers record, 2. Check question `type` field matches expected, 3. For MCQ: verify `correct_answer` format matches comparison logic, 4. For fill_blank: check case-insensitive comparison, 5. Add unit tests for the specific failing case |
| **Quiz timer auto-submit not firing** | 1. Verify `started_at` is set on attempt creation, 2. Check timer calculation: `timeLimit * 60 - elapsed`, 3. Verify `setInterval` cleanup on unmount, 4. Check that `onTimeUp` callback calls submit mutation |
| **Video player not showing controls** | 1. Check `parseVideoUrl` output — if YouTube/Vimeo, custom controls don't apply (iframe), 2. For MP4: verify `<video>` ref is attached, 3. Check that `loadedmetadata` event fires to get duration, 4. Verify controls overlay CSS positions correctly |
| **Video progress not saving** | 1. Check Network tab for upsert requests to `video_progress`, 2. Verify debounce is working (should fire every 5s), 3. Check RLS — student must be the authenticated user, 4. Check UNIQUE constraint on `(student_id, lesson_id)` — should upsert, not fail |
| **Video resume not working** | 1. Check `savedPosition` from `useVideoProgress` hook, 2. Verify `videoRef.current.currentTime = savedPosition` is called after `loadedmetadata`, 3. Check if toast "Resume from X:XX?" appears |
| **Signed URL returns 400** | 1. Check `file_url` path format — should be relative path within bucket, not full URL, 2. Verify the file exists in Supabase Storage, 3. Check bucket name matches ('submissions'), 4. Try generating URL in Supabase Dashboard |
| **File validation not blocking uploads** | 1. Check that validation runs before mutation, 2. Verify file MIME type with `console.log(file.type)`, 3. Some browsers report different MIME types — check against whitelist, 4. Verify `accept` attribute on `<input>` |
| **Admin pages 404** | 1. Check route registration in `App.tsx`, 2. Verify import paths for `AdminSubjects` and `AdminGradeLevels`, 3. Check that routes are inside the protected ProtectedRoute wrapper |

### 7.2 Development Server Commands

```bash
# Start dev server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Check for lint issues
npx eslint src/pages/admin/AdminSubjects.tsx src/pages/admin/AdminGradeLevels.tsx src/pages/QuizPage.tsx src/pages/QuizResults.tsx src/components/RichTextEditor.tsx src/components/RichTextViewer.tsx src/components/VideoPlayer.tsx src/components/ImageUpload.tsx src/components/teacher/QuizBuilder.tsx src/hooks/useSubjects.ts src/hooks/useGradeLevels.ts src/hooks/useQuizzes.ts src/hooks/useQuizQuestions.ts src/hooks/useQuizAttempts.ts src/hooks/useVideoProgress.ts src/hooks/useSignedUrl.ts src/lib/fileValidation.ts src/lib/quizGrading.ts src/lib/videoUrlParser.ts

# Apply Supabase migrations
npx supabase db push

# Check Supabase migration status
npx supabase migration list
```

### 7.3 Browser DevTools Checks

- **React Query DevTools:** Inspect query states for `["subjects"]`, `["grade-levels"]`, `["quizzes", courseId]`, `["video-progress", lessonId]`; verify cached data; check refetch triggers
- **Network Tab:** Verify Supabase REST calls for all new tables return expected data; check storage upload/download requests; verify signed URL generation
- **Console:** Check for React warnings (key props, useEffect deps); TipTap initialization logs; KaTeX parse errors; video player event logs
- **Application Tab (Storage):** Verify `video-playback-speed` persisted in localStorage
- **Responsive Mode:** Test at 375px width: editor toolbar wraps, video player controls scale, quiz navigation stacks, image upload works on mobile

---

## 8. Code Review Checklist

### Functional Correctness
- [ ] F1: Subject/grade selects populate from DB and filter courses correctly
- [ ] F1: Seed data includes all 15 subjects and KG through Class 12
- [ ] F1: Admin CRUD operations work for subjects and grade levels
- [ ] F1: Course creation includes optional subject_id and grade_level_id
- [ ] F1: Profile updates for grade_level (students) and subject expertise (teachers) persist
- [ ] F2: TipTap editor initializes with all extensions; toolbar buttons toggle formatting
- [ ] F2: Editor content serializes to HTML and stores in `lessons.content`
- [ ] F2: Viewer renders stored HTML correctly including code blocks and math
- [ ] F2: Existing lesson content (plain HTML) remains backward-compatible
- [ ] F3: Thumbnail uploads to correct bucket with correct path
- [ ] F3: Thumbnail public URL saved to `courses.thumbnail_url`
- [ ] F3: Course cards display thumbnail when available, gradient fallback when not
- [ ] F3: File type validation blocks non-images; size validation blocks >2MB
- [ ] F4: Quiz builder CRUD operations work for quizzes and questions
- [ ] F4: All 5 question types serialize/deserialize JSONB correctly
- [ ] F4: Auto-grading produces correct scores for each question type
- [ ] F4: Timer counts down and auto-submits when expired
- [ ] F4: Attempt limit prevents excess attempts
- [ ] F4: Randomization shuffles questions when enabled
- [ ] F4: Results page shows correct/incorrect breakdown
- [ ] F5: YouTube URLs detected and rendered as iframe embeds
- [ ] F5: Vimeo URLs detected and rendered as iframe embeds
- [ ] F5: MP4 URLs render HTML5 video with custom controls
- [ ] F5: Playback speed persists across page loads (localStorage)
- [ ] F5: Video progress saves to DB every 5 seconds (debounced)
- [ ] F5: Resume works: seek to saved position on load
- [ ] F6: Signed URLs generated with 1-hour expiry
- [ ] F6: File type whitelist blocks disallowed types
- [ ] F6: File size limit blocks uploads >10MB
- [ ] F6: Download button opens signed URL in new tab

### Code Quality
- [ ] Follows existing patterns from `LiveClasses.tsx`, `Dashboard.tsx`, `AdminCourses.tsx`, `TeacherCourseDetail.tsx`
- [ ] No unused imports or variables
- [ ] TypeScript types are explicit — no new `any` unless matching existing pattern
- [ ] Query keys are unique and include all variable dependencies
- [ ] Components are appropriately extracted (not over-extracted for simple cases)
- [ ] Hooks follow React Query conventions (`enabled`, `staleTime`, `queryKey`)
- [ ] Mutations include `onSuccess` + `onError` with toast feedback
- [ ] All new Supabase queries use parameterized methods (`.eq()`, `.in()`, etc.)

### UI/UX
- [ ] Loading spinners match existing design (4px border, primary color, animate-spin)
- [ ] Empty states match existing design (icon + message centered)
- [ ] Color-coded badges are accessible (text labels present, not relying only on color)
- [ ] Editor toolbar is intuitive and discoverable
- [ ] Quiz-taking UI is clear: timer visible, question navigation accessible
- [ ] Video controls are touch-friendly on mobile
- [ ] Image upload has clear feedback for drag, upload progress, success
- [ ] Filter dropdowns have "All" default option for clear reset
- [ ] Admin tables follow existing `AdminCourses.tsx` styling
- [ ] All new pages have consistent header pattern (h1 + description)

### Performance
- [ ] No unnecessary re-renders from unstable object references in query keys
- [ ] `useMemo` for expensive computations (quiz grading, question shuffling) if needed
- [ ] Queries use `enabled` to avoid waterfall fetching when possible
- [ ] Video progress debounced (not saving on every frame)
- [ ] TipTap editor doesn't re-initialize on every render
- [ ] Image upload shows progress feedback; doesn't block UI
- [ ] Signed URLs cached with appropriate staleTime (50 min)

---

## 9. Security & Quality Audit

### 9.1 Security Checks

| Check | Expected Result |
|-------|-----------------|
| **RLS on subjects/grade_levels** | Anyone can read; only admins can insert/update/delete; verified via `has_role(auth.uid(), 'admin')` |
| **RLS on quizzes** | Students can read quizzes for any course (via SELECT policy); only course teacher can create/edit/delete |
| **RLS on quiz_questions** | Same teacher ownership check via quiz -> course -> teacher_id join |
| **RLS on quiz_attempts** | Students can only see and create their own attempts; teachers can view attempts for their courses |
| **RLS on video_progress** | Students can only read/write their own progress records |
| **Storage RLS on course-thumbnails** | Public read; only teachers can upload/delete (via `has_role` check) |
| **Signed URLs for submissions** | URLs expire after 1 hour; generated server-side via Supabase client; only authenticated users with RLS access can generate |
| **File upload validation** | Client-side type and size checks prevent malicious file uploads; accept attribute limits file picker |
| **No XSS via rich editor** | TipTap generates sanitized HTML; `RichTextViewer` uses TipTap's read-only mode (not raw `dangerouslySetInnerHTML`) or sanitizes output |
| **No raw SQL injection** | All queries use Supabase client parameterized methods |
| **Auth guard on all new pages** | All new routes are inside `ProtectedRoute` -> `AppLayout`; admin pages check `isAdmin`; teacher pages check `isTeacher` |
| **Quiz answers not exposed to client before submission** | Correct answers are fetched only for grading (after submit) or in results (if `show_answers` is true); during quiz-taking, only question text and options are loaded |
| **Meeting URLs opened safely** | Video player external links use `target="_blank" rel="noopener noreferrer"` |

### 9.2 Quality Checks

| Check | Expected Result |
|-------|-----------------|
| **TypeScript strict** | No new `any` types introduced beyond existing patterns; all new interfaces explicitly defined |
| **No console.log** | Remove any debug logging before commit |
| **Error handling** | Queries return `[]` on error (consistent with existing pattern); mutations show toast on error |
| **Accessibility** | Table headers have proper `<th>` elements; editor toolbar buttons have aria-labels; quiz timer is announced; interactive elements are focusable; color not sole indicator |
| **Bundle size impact** | TipTap adds ~150KB (gzipped ~45KB); KaTeX adds ~300KB (gzipped ~100KB); lowlight adds ~50KB; total ~500KB raw / ~195KB gzipped — acceptable for an LMS |
| **Backward compatibility** | Existing lesson content (plain HTML strings) renders correctly in new RichTextViewer; existing courses without subject_id/grade_level_id show "Uncategorized" |
| **Timezone consistency** | All date comparisons use `parseISO` or `new Date()` -> date-fns functions consistently |
| **JSONB schema validation** | Quiz question options and correct_answer follow documented schemas per type |

### 9.3 Audit Procedure

1. **Static analysis:** Run `npx tsc --noEmit` — zero errors
2. **Lint check:** Run ESLint on all changed/new files
3. **Test suite:** Run `npm run test` — all passing
4. **Manual walkthrough:** Read every new file top-to-bottom for logic errors
5. **Security walkthrough:** Verify every RLS policy in migration files; test with different roles
6. **Cross-reference with requirements:** Verify each feature item from the specification is addressed
7. **Build check:** Run `npm run build` — zero warnings/errors
8. **Bundle analysis:** Check final bundle size hasn't grown unreasonably

---

## 10. Git & Push Strategy

### 10.1 Branch Strategy

```
main (current) → feature/phase4-subjects-content-assessments (new branch)
```

### 10.2 Commit Plan

| # | Commit | Files Changed |
|---|--------|---------------|
| 1 | `feat(db): add subjects, grade_levels tables with seed data and RLS` | `supabase/migrations/2026XXXX_phase4_subjects_grades.sql`, `src/integrations/supabase/types.ts` |
| 2 | `feat(db): add quiz engine tables (quizzes, questions, attempts) with RLS` | `supabase/migrations/2026XXXX_phase4_quiz_engine.sql`, `src/integrations/supabase/types.ts` |
| 3 | `feat(db): add video_progress table and course-thumbnails storage bucket` | `supabase/migrations/2026XXXX_phase4_video_progress.sql`, `supabase/migrations/2026XXXX_phase4_course_thumbnails_bucket.sql`, `src/integrations/supabase/types.ts` |
| 4 | `feat(deps): add TipTap editor, KaTeX, and lowlight dependencies` | `package.json`, `package-lock.json` |
| 5 | `feat(lib): add file validation, quiz grading, and video URL parser utilities` | `src/lib/fileValidation.ts`, `src/lib/quizGrading.ts`, `src/lib/videoUrlParser.ts` |
| 6 | `feat(hooks): add data hooks for subjects, grades, quizzes, video progress, signed URLs` | `src/hooks/useSubjects.ts`, `src/hooks/useGradeLevels.ts`, `src/hooks/useQuizzes.ts`, `src/hooks/useQuizQuestions.ts`, `src/hooks/useQuizAttempts.ts`, `src/hooks/useVideoProgress.ts`, `src/hooks/useSignedUrl.ts` |
| 7 | `feat(f1): add subject and grade-level management with admin pages and course filtering` | `src/pages/admin/AdminSubjects.tsx`, `src/pages/admin/AdminGradeLevels.tsx`, `src/pages/Courses.tsx`, `src/pages/teacher/CreateCourse.tsx`, `src/pages/teacher/TeacherCourseDetail.tsx`, `src/pages/Profile.tsx`, `src/pages/admin/AdminCourses.tsx`, `src/components/AppSidebar.tsx`, `src/App.tsx` |
| 8 | `feat(f2): add TipTap rich text editor and viewer components` | `src/components/RichTextEditor.tsx`, `src/components/RichTextViewer.tsx`, `src/pages/teacher/TeacherCourseDetail.tsx`, `src/pages/LessonPage.tsx`, `src/index.css` |
| 9 | `feat(f3): add course thumbnail upload and display` | `src/components/ImageUpload.tsx`, `src/pages/teacher/CreateCourse.tsx`, `src/pages/teacher/TeacherCourseDetail.tsx`, `src/pages/Courses.tsx`, `src/components/EnrolledCourseCard.tsx`, `src/pages/CourseDetail.tsx` |
| 10 | `feat(f4): add quiz engine with builder, taking UI, auto-grading, and results` | `src/components/teacher/QuizBuilder.tsx`, `src/components/quiz/QuestionForm.tsx`, `src/components/quiz/QuizTimer.tsx`, `src/components/quiz/QuestionNav.tsx`, `src/pages/QuizPage.tsx`, `src/pages/QuizResults.tsx`, `src/pages/teacher/TeacherCourseDetail.tsx`, `src/pages/CourseDetail.tsx`, `src/App.tsx` |
| 11 | `feat(f5): add enhanced video player with progress tracking and resume` | `src/components/VideoPlayer.tsx`, `src/pages/LessonPage.tsx` |
| 12 | `feat(f6): add secure file access with signed URLs and upload validation` | `src/pages/teacher/AssignmentSubmissions.tsx`, `src/pages/AssignmentPage.tsx` |
| 13 | `test: add unit and component tests for Phase 4 features` | `src/test/lib/*`, `src/test/hooks/*`, `src/test/components/*`, `src/test/pages/*` |

### 10.3 Push Commands

```bash
# Create feature branch
git checkout -b feature/phase4-subjects-content-assessments

# After all commits...
git push -u origin feature/phase4-subjects-content-assessments

# Create PR
gh pr create \
  --title "feat: Phase 4 — Subject Management, Advanced Content & Assessments" \
  --body "## Summary
- **F1: Subject & Grade-Level Management** — New subjects/grade_levels tables, course filtering, admin CRUD, teacher expertise, student grade assignment
- **F2: Rich Content Editor** — TipTap WYSIWYG with formatting toolbar, code blocks, KaTeX math, rich viewer
- **F3: Course Thumbnails** — Storage bucket, image upload component, thumbnail display in cards
- **F4: Quiz Engine** — Quiz builder, 5 question types, timer, auto-grading, results, teacher analytics
- **F5: Enhanced Video Player** — Custom player, playback speed, volume, fullscreen, progress tracking with resume
- **F6: Secure File Access** — Signed URLs for downloads, file type whitelist, size validation

## Phase 4 Checklist
- [x] F1: Subject & Grade-Level Management
- [x] F2: Rich Content Editor
- [x] F3: Course Thumbnails
- [x] F4: Quiz Engine
- [x] F5: Enhanced Video Player
- [x] F6: Secure File Access

## DB Migrations
- subjects + grade_levels tables with seed data
- quizzes + quiz_questions + quiz_attempts tables
- video_progress table
- course-thumbnails storage bucket

## New Dependencies
- @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-image, @tiptap/extension-code-block-lowlight, lowlight
- katex

## Test Plan
- [ ] Run \`npm run test\` — all passing
- [ ] Run \`npx tsc --noEmit\` — zero errors
- [ ] Run \`npm run build\` — builds successfully
- [ ] Admin: CRUD subjects and grade levels
- [ ] Teacher: create course with subject/grade/thumbnail
- [ ] Teacher: create lessons with rich text editor
- [ ] Teacher: build quiz with various question types
- [ ] Student: browse courses with subject/grade filters
- [ ] Student: take quiz with timer, see auto-graded results
- [ ] Student: watch video with resume from saved position
- [ ] Student: submit assignment with file validation
- [ ] Teacher: download student submissions via signed URL"
```

### 10.4 Remote Details

| Key | Value |
|-----|-------|
| Remote | `origin` |
| URL | `https://github.com/Vedang28/EVLENT-EDUCATION.git` |
| Base branch | `main` |
| Feature branch | `feature/phase4-subjects-content-assessments` |
| GitHub user | [@Vedang28](https://github.com/Vedang28) |

---

## 11. File Inventory

### New Files (37)

| File | Type | Lines (est.) |
|------|------|-------------|
| `supabase/migrations/2026XXXX_phase4_subjects_grades.sql` | Migration | ~90 |
| `supabase/migrations/2026XXXX_phase4_quiz_engine.sql` | Migration | ~70 |
| `supabase/migrations/2026XXXX_phase4_video_progress.sql` | Migration | ~15 |
| `supabase/migrations/2026XXXX_phase4_course_thumbnails_bucket.sql` | Migration | ~12 |
| `src/hooks/useSubjects.ts` | Hook | ~20 |
| `src/hooks/useGradeLevels.ts` | Hook | ~20 |
| `src/hooks/useQuizzes.ts` | Hook | ~25 |
| `src/hooks/useQuizQuestions.ts` | Hook | ~25 |
| `src/hooks/useQuizAttempts.ts` | Hook | ~25 |
| `src/hooks/useVideoProgress.ts` | Hook | ~50 |
| `src/hooks/useSignedUrl.ts` | Hook | ~30 |
| `src/lib/fileValidation.ts` | Utility | ~40 |
| `src/lib/quizGrading.ts` | Utility | ~80 |
| `src/lib/videoUrlParser.ts` | Utility | ~40 |
| `src/components/RichTextEditor.tsx` | Component | ~200 |
| `src/components/RichTextViewer.tsx` | Component | ~50 |
| `src/components/ImageUpload.tsx` | Component | ~120 |
| `src/components/VideoPlayer.tsx` | Component | ~250 |
| `src/components/teacher/QuizBuilder.tsx` | Component | ~350 |
| `src/components/quiz/QuestionForm.tsx` | Component | ~250 |
| `src/components/quiz/QuizTimer.tsx` | Component | ~40 |
| `src/components/quiz/QuestionNav.tsx` | Component | ~40 |
| `src/pages/QuizPage.tsx` | Page | ~200 |
| `src/pages/QuizResults.tsx` | Page | ~150 |
| `src/pages/admin/AdminSubjects.tsx` | Page | ~180 |
| `src/pages/admin/AdminGradeLevels.tsx` | Page | ~180 |
| `src/test/lib/fileValidation.test.ts` | Test | ~60 |
| `src/test/lib/quizGrading.test.ts` | Test | ~100 |
| `src/test/lib/videoUrlParser.test.ts` | Test | ~50 |
| `src/test/hooks/useSubjects.test.ts` | Test | ~40 |
| `src/test/hooks/useGradeLevels.test.ts` | Test | ~40 |
| `src/test/hooks/useQuizzes.test.ts` | Test | ~40 |
| `src/test/hooks/useVideoProgress.test.ts` | Test | ~50 |
| `src/test/hooks/useSignedUrl.test.ts` | Test | ~40 |
| `src/test/components/RichTextEditor.test.tsx` | Test | ~60 |
| `src/test/components/VideoPlayer.test.tsx` | Test | ~60 |
| `src/test/components/ImageUpload.test.tsx` | Test | ~60 |
| `src/test/pages/QuizPage.test.tsx` | Test | ~80 |
| `src/test/pages/QuizResults.test.tsx` | Test | ~60 |

### Modified Files (14)

| File | Change | Lines Changed (est.) |
|------|--------|---------------------|
| `src/integrations/supabase/types.ts` | Add 6 new table types; update courses + profiles types | ~200 |
| `src/pages/Courses.tsx` | Add subject/grade filter dropdowns; update query with joins; show thumbnails | ~40 |
| `src/pages/CourseDetail.tsx` | Add subject/grade badges; add Quizzes tab; show thumbnail banner | ~50 |
| `src/pages/LessonPage.tsx` | Replace iframe with VideoPlayer; replace dangerouslySetInnerHTML with RichTextViewer | ~10 |
| `src/pages/AssignmentPage.tsx` | Add file validation on upload; add signed URL download | ~30 |
| `src/pages/teacher/CreateCourse.tsx` | Add subject select, grade select, thumbnail upload | ~30 |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Add Quizzes tab; replace Textarea with RichTextEditor; show/edit subject+grade; show/change thumbnail | ~40 |
| `src/pages/teacher/AssignmentSubmissions.tsx` | Add signed URL download buttons; file type icons | ~25 |
| `src/pages/Profile.tsx` | Add grade-level select (students); subject expertise multi-select (teachers) | ~50 |
| `src/pages/admin/AdminCourses.tsx` | Add Subject/Grade columns to table | ~15 |
| `src/components/AppSidebar.tsx` | Add Subjects and Grade Levels to adminNav | ~4 |
| `src/components/EnrolledCourseCard.tsx` | Accept thumbnailUrl prop; show thumbnail when available | ~10 |
| `src/pages/Dashboard.tsx` | Pass thumbnailUrl to EnrolledCourseCard | ~2 |
| `src/App.tsx` | Add routes for admin subjects/grades, quiz pages | ~10 |

### Infrastructure Files (2)

| File | Change |
|------|--------|
| `package.json` | Add TipTap, KaTeX, lowlight dependencies |
| `src/index.css` | Import KaTeX CSS, TipTap prose styles |

### Reference Files (read-only)

| File | Used For |
|------|----------|
| `src/pages/LiveClasses.tsx` | Role-based enrollment query pattern |
| `src/pages/Dashboard.tsx` | Query + card layout patterns |
| `src/pages/admin/AdminCourses.tsx` | Admin table CRUD pattern |
| `src/pages/teacher/TeacherCourseDetail.tsx` | Tabs, dialog forms, mutation pattern |
| `src/pages/AssignmentPage.tsx` | File upload, submission pattern |
| `src/pages/teacher/AssignmentSubmissions.tsx` | Grading UI, file display pattern |
| `src/hooks/useUserRole.ts` | Role checking API |
| `src/hooks/useCourseProgress.ts` | Progress tracking hook pattern |
| `src/contexts/AuthContext.tsx` | Auth context API |
| `src/integrations/supabase/client.ts` | Supabase client instance |
| `src/components/ui/select.tsx` | Select component API |
| `src/components/ui/tabs.tsx` | Tabs component API |
| `src/components/ui/table.tsx` | Table component API |
| `src/components/ui/dialog.tsx` | Dialog component API |
| `src/components/ui/badge.tsx` | Badge component API |
| `src/components/ui/slider.tsx` | Slider component API (for video player) |
| `src/components/ui/toggle.tsx` | Toggle component API (for editor toolbar) |
| `src/components/ui/switch.tsx` | Switch component API (for quiz settings) |

---

## 12. Verification Checklist

### F1: Subject & Grade-Level Management
- [ ] Subjects table exists with 15 seed entries
- [ ] Grade levels table exists with KG through Class 12 (13 entries)
- [ ] Admin: can create a new subject via Admin Subjects page
- [ ] Admin: can edit an existing subject name/description
- [ ] Admin: can delete a subject (courses with that subject_id get SET NULL)
- [ ] Admin: can create, edit, delete grade levels
- [ ] Admin: Courses table shows Subject and Grade columns
- [ ] Admin: Subjects and Grade Levels links appear in admin sidebar
- [ ] Teacher: course creation form shows subject and grade-level dropdowns
- [ ] Teacher: can create course with subject + grade level selected
- [ ] Teacher: can create course without subject/grade (both optional)
- [ ] Teacher: course detail page shows subject and grade badges
- [ ] Teacher: can edit subject/grade on existing course
- [ ] Student: Courses browse page shows subject filter dropdown
- [ ] Student: Courses browse page shows grade-level filter dropdown
- [ ] Student: selecting "Mathematics" filter shows only math courses
- [ ] Student: selecting "Class 10" filter shows only class 10 courses
- [ ] Student: combined filters work (Mathematics + Class 10)
- [ ] Student: "All Subjects" / "All Grades" resets filters
- [ ] Student: Profile page shows grade-level select
- [ ] Student: can save their grade level
- [ ] Teacher: Profile page shows subject expertise multi-select
- [ ] Teacher: can add/remove subject expertise
- [ ] RLS: non-admin cannot create/edit/delete subjects or grade levels

### F2: Rich Content Editor
- [ ] TipTap editor renders in lesson creation form (replaces Textarea)
- [ ] Bold, italic, strikethrough buttons work and toggle correctly
- [ ] H1, H2, H3 heading buttons work
- [ ] Bullet list and ordered list buttons work
- [ ] Link insertion dialog opens; link is inserted and clickable in editor
- [ ] Image insertion dialog opens; image renders in editor
- [ ] Code block with syntax highlighting works
- [ ] KaTeX math equations render from `$...$` syntax
- [ ] Editor content saves to `lessons.content` as HTML
- [ ] RichTextViewer renders stored content correctly for students
- [ ] Existing plain HTML lesson content still renders correctly (backward compat)
- [ ] Editor has proper min-height and placeholder text
- [ ] Toolbar buttons show active state when format is applied

### F3: Course Thumbnails
- [ ] `course-thumbnails` Storage bucket exists and is public
- [ ] ImageUpload component shows upload zone
- [ ] Drag-and-drop file into zone triggers upload
- [ ] Click on zone opens file picker
- [ ] Uploading a JPG/PNG/WEBP succeeds
- [ ] Uploading a PDF is rejected with toast error
- [ ] Uploading a file >2MB is rejected with toast error
- [ ] After upload, preview image shows in the component
- [ ] Remove button clears the thumbnail
- [ ] Course creation saves thumbnail_url to courses table
- [ ] Course cards in browse page show thumbnail image
- [ ] Course cards without thumbnail show gradient fallback
- [ ] EnrolledCourseCard shows small thumbnail when available
- [ ] CourseDetail page shows thumbnail banner

### F4: Quiz Engine
- [ ] Teacher: "Quizzes" tab appears in TeacherCourseDetail
- [ ] Teacher: can create a new quiz with title, description, settings
- [ ] Teacher: can set time_limit, attempt_limit, randomize, show_answers
- [ ] Teacher: can add MCQ question with options and correct answer
- [ ] Teacher: can add True/False question
- [ ] Teacher: can add Fill-in-the-Blank question with accepted answers
- [ ] Teacher: can add Matching question with pairs
- [ ] Teacher: can add Short Answer question
- [ ] Teacher: can edit existing questions
- [ ] Teacher: can delete questions
- [ ] Teacher: can reorder questions
- [ ] Teacher: can delete a quiz
- [ ] Teacher: analytics show average score and question difficulty
- [ ] Student: "Quizzes" tab appears in CourseDetail
- [ ] Student: can see list of available quizzes with attempt status
- [ ] Student: clicking a quiz opens QuizPage
- [ ] Student: timer displays and counts down when time_limit is set
- [ ] Student: question navigation shows numbered buttons
- [ ] Student: can answer MCQ by selecting option(s)
- [ ] Student: can answer True/False by selecting true or false
- [ ] Student: can answer Fill-in-the-Blank by typing
- [ ] Student: can answer Matching by pairing items
- [ ] Student: can answer Short Answer by typing
- [ ] Student: clicking "Next"/"Previous" navigates questions
- [ ] Student: clicking "Submit" grades the quiz and shows results
- [ ] Student: timer auto-submits when time runs out
- [ ] Student: results show total score and per-question breakdown
- [ ] Student: correct answers shown when show_answers is true
- [ ] Student: correct answers hidden when show_answers is false
- [ ] Student: cannot exceed attempt_limit
- [ ] Student: questions are shuffled when randomize is true
- [ ] Quiz route `/courses/:courseId/quizzes/:quizId` works
- [ ] Results route `/courses/:courseId/quizzes/:quizId/results/:attemptId` works

### F5: Enhanced Video Player
- [ ] VideoPlayer renders iframe for YouTube embed URLs
- [ ] VideoPlayer renders iframe for YouTube watch URLs
- [ ] VideoPlayer renders iframe for Vimeo URLs
- [ ] VideoPlayer renders HTML5 video for MP4 URLs
- [ ] MP4 player shows play/pause button that works
- [ ] MP4 player shows progress scrubber that seeks
- [ ] MP4 player shows current time / duration display
- [ ] Speed control shows options 0.5x through 2x
- [ ] Changing speed applies to video playback
- [ ] Speed persists across page navigations (localStorage)
- [ ] Volume slider works
- [ ] Mute toggle works
- [ ] Fullscreen toggle enters/exits fullscreen
- [ ] Video progress saves to DB every ~5 seconds
- [ ] On revisit, "Resume from X:XX?" toast appears
- [ ] Clicking Resume seeks to saved position
- [ ] Player is responsive (aspect-video, controls scale)
- [ ] LessonPage uses VideoPlayer instead of raw iframe

### F6: Secure File Access
- [ ] Teacher: "Download" button appears for student submissions with files
- [ ] Teacher: clicking Download opens file in new tab via signed URL
- [ ] Student: can see download link for own submitted file
- [ ] Student: download link works via signed URL
- [ ] Assignment upload: selecting a PDF file succeeds
- [ ] Assignment upload: selecting a DOC/DOCX file succeeds
- [ ] Assignment upload: selecting a JPG/PNG file succeeds
- [ ] Assignment upload: selecting a TXT file succeeds
- [ ] Assignment upload: selecting an EXE file is blocked with toast error
- [ ] Assignment upload: selecting a file >10MB is blocked with toast error
- [ ] File type icons display correctly (FileText for PDF, Image for JPG, etc.)
- [ ] Signed URL expires after 1 hour (verify by waiting or checking URL params)

### Tests
- [ ] `npm run test` — all tests pass
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — builds successfully with no errors

### Git
- [ ] All changes committed on `feature/phase4-subjects-content-assessments` branch
- [ ] Pushed to `origin` (https://github.com/Vedang28/EVLENT-EDUCATION)
- [ ] PR created against `main` with summary and test plan

---

### Critical Files for Implementation
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/integrations/supabase/types.ts` - Must be updated with all new table types (subjects, grade_levels, quizzes, quiz_questions, quiz_attempts, video_progress, teacher_subjects) and updated courses/profiles types
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/pages/teacher/TeacherCourseDetail.tsx` - Receives the most modifications: Quizzes tab, RichTextEditor integration, subject/grade editing, thumbnail management
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/pages/Courses.tsx` - Subject/grade filter dropdowns, thumbnail display, query updates with joins
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/pages/LessonPage.tsx` - Both F2 (RichTextViewer replacing dangerouslySetInnerHTML) and F5 (VideoPlayer replacing iframe) converge here
- `/Users/vedangvaidya/Desktop/Projects/EVLENT-EDUCATION/src/App.tsx` - All new route registrations (admin subjects/grades, quiz pages, quiz results)