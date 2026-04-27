-- Remove overly broad public profiles policy that exposes all user data
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Users can view their own profile
-- (already exists: "Users can view their own profile")

-- Teachers can view profiles of students in their courses
CREATE POLICY "Teachers can view student profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'teacher')
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_id = profiles.user_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Students can view profiles of classmates (same course)
CREATE POLICY "Students can view classmate profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e1
      JOIN public.enrollments e2 ON e1.course_id = e2.course_id
      WHERE e1.student_id = auth.uid()
        AND e2.student_id = profiles.user_id
    )
  );

-- Students can view teacher profiles for their enrolled courses
CREATE POLICY "Students can view teacher profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE e.student_id = auth.uid()
        AND c.teacher_id = profiles.user_id
    )
  );
