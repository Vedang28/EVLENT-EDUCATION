-- Phase 4 F1: Subject & Grade-Level Management
-- Creates subjects, grade_levels, teacher_subjects tables
-- Adds FKs to courses and profiles, seeds data

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
