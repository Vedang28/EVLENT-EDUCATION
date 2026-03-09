
-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify students when their submission is graded
CREATE OR REPLACE FUNCTION public.notify_on_grade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.grade IS NULL AND NEW.grade IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, type)
    SELECT NEW.student_id,
           'Your submission for "' || a.title || '" has been graded: ' || NEW.grade || '/' || a.max_score,
           'grade'
    FROM public.assignments a WHERE a.id = NEW.assignment_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_grade
AFTER UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_grade();

-- Trigger: notify enrolled students when a new lesson is added
CREATE OR REPLACE FUNCTION public.notify_on_new_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  SELECT e.student_id,
         'New lesson "' || NEW.title || '" has been added to your course',
         'content'
  FROM public.modules m
  JOIN public.enrollments e ON e.course_id = m.course_id
  WHERE m.id = NEW.module_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_new_lesson
AFTER INSERT ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_lesson();

-- Trigger: notify enrolled students when a new assignment is added
CREATE OR REPLACE FUNCTION public.notify_on_new_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type)
  SELECT e.student_id,
         'New assignment "' || NEW.title || '" has been posted in your course',
         'assignment'
  FROM public.enrollments e
  WHERE e.course_id = NEW.course_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_new_assignment
AFTER INSERT ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_assignment();
