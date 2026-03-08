
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile and student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Teachers can create courses" ON public.courses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = teacher_id);

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can unenroll" ON public.enrollments FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view course enrollments" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);

-- Modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Teachers can manage modules" ON public.modules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update modules" ON public.modules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can delete modules" ON public.modules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  video_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Teachers can manage lessons" ON public.lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update lessons" ON public.lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can delete lessons" ON public.lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.teacher_id = auth.uid())
);

-- Assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMP WITH TIME ZONE,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can manage assignments" ON public.assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update assignments" ON public.assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can delete assignments" ON public.assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND courses.teacher_id = auth.uid())
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  text_response TEXT,
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (assignment_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = student_id AND grade IS NULL);
CREATE POLICY "Teachers can view course submissions" ON public.submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON c.id = a.course_id WHERE a.id = assignment_id AND c.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can grade submissions" ON public.submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON c.id = a.course_id WHERE a.id = assignment_id AND c.teacher_id = auth.uid())
);

-- Live classes table
CREATE TABLE public.live_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  meeting_url TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live classes" ON public.live_classes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage live classes" ON public.live_classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update live classes" ON public.live_classes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete live classes" ON public.live_classes FOR DELETE USING (auth.uid() = teacher_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);

CREATE POLICY "Students can upload submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Students can view own submissions" ON storage.objects FOR SELECT USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Teachers can view all submissions" ON storage.objects FOR SELECT USING (bucket_id = 'submissions');
