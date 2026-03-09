
-- Add status column to courses
ALTER TABLE public.courses ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Update existing courses to approved
UPDATE public.courses SET status = 'approved' WHERE status = 'pending';

-- Drop the overly broad "Anyone can view courses" policy and replace with filtered ones
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;

-- Students/public only see approved courses
CREATE POLICY "Anyone can view approved courses"
ON public.courses FOR SELECT
USING (status = 'approved');

-- Teachers can see their own courses regardless of status
CREATE POLICY "Teachers can view own courses"
ON public.courses FOR SELECT
USING (auth.uid() = teacher_id);

-- Admins can see all courses (already have update/delete policies)
CREATE POLICY "Admins can view all courses"
ON public.courses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Notify teacher when course is approved/rejected
CREATE OR REPLACE FUNCTION public.notify_on_course_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, message, type)
    VALUES (
      NEW.teacher_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Your course "' || NEW.title || '" has been approved and is now visible to students!'
        WHEN 'rejected' THEN 'Your course "' || NEW.title || '" was not approved. Please contact an administrator for details.'
      END,
      'course_status'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_course_status
AFTER UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.notify_on_course_status_change();
