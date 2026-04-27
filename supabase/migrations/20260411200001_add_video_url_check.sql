-- Enforce that video_url must be an https URL (or NULL)
-- Prevents javascript: URI injection and other non-web protocols
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_video_url_check
  CHECK (video_url IS NULL OR video_url ~ '^https://');
