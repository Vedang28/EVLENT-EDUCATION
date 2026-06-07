-- Allow admins to update any profile (e.g. setting grade_level_id)
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
