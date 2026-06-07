-- Students can view profiles of teachers assigned to them
CREATE POLICY "Students can view assigned teacher profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_students ts
      WHERE ts.student_id = auth.uid()
        AND ts.teacher_id = profiles.user_id
    )
  );
