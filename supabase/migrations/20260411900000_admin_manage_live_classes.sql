-- Allow admins to manage all live classes
CREATE POLICY "Admins can insert live classes"
  ON public.live_classes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update live classes"
  ON public.live_classes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete live classes"
  ON public.live_classes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
