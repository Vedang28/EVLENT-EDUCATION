-- Enforce that meeting_url must be an http or https URL (or NULL)
-- Prevents javascript: URI injection and other non-web protocols
ALTER TABLE live_classes
  ADD CONSTRAINT live_classes_meeting_url_check
  CHECK (meeting_url IS NULL OR meeting_url ~ '^https?://');
