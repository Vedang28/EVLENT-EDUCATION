-- Phase 4 F4: Quiz Engine — tables + RLS

-- ===== quizzes =====
CREATE TABLE public.quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  time_limit  INTEGER,          -- minutes; NULL = no limit
  attempt_limit INTEGER NOT NULL DEFAULT 1,
  randomize   BOOLEAN NOT NULL DEFAULT false,
  show_answers BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read quizzes (course-level access checked at app layer)
CREATE POLICY "quizzes_select" ON public.quizzes
  FOR SELECT TO authenticated USING (true);

-- Teachers can manage quizzes for their own courses
CREATE POLICY "quizzes_insert" ON public.quizzes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "quizzes_update" ON public.quizzes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "quizzes_delete" ON public.quizzes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id AND courses.teacher_id = auth.uid()
    )
  );

-- ===== quiz_questions =====
CREATE TABLE public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'fill_blank')),
  question_text  TEXT NOT NULL,
  options        JSONB,          -- MCQ: string[]; T/F & fill: null
  correct_answer JSONB NOT NULL, -- MCQ: index (number); T/F: boolean; fill: string
  points         INTEGER NOT NULL DEFAULT 1,
  position       INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select" ON public.quiz_questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "quiz_questions_insert" ON public.quiz_questions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_id AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "quiz_questions_update" ON public.quiz_questions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_id AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "quiz_questions_delete" ON public.quiz_questions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_id AND courses.teacher_id = auth.uid()
    )
  );

-- ===== quiz_attempts =====
CREATE TABLE public.quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL DEFAULT '{}'::jsonb,
  score        NUMERIC,
  max_score    INTEGER NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Students see own attempts; teachers see attempts for their courses
CREATE POLICY "quiz_attempts_select" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_id AND courses.teacher_id = auth.uid()
    )
  );

-- Students can start attempts for quizzes in courses they're enrolled in
CREATE POLICY "quiz_attempts_insert" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_id AND enrollments.student_id = auth.uid()
    )
  );

-- Students can update own attempts (submit answers)
CREATE POLICY "quiz_attempts_update" ON public.quiz_attempts
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());
