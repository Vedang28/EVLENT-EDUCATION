import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AssignmentRow = Database["public"]["Tables"]["assignments"]["Row"];
type LiveClassRow = Database["public"]["Tables"]["live_classes"]["Row"];
type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

type AssignmentWithCourse = AssignmentRow & { courses: Pick<CourseRow, "title"> | null };
type LiveClassWithCourse = LiveClassRow & { courses: Pick<CourseRow, "title"> | null };

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "assignment" | "live_class";
  courseTitle: string;
  courseId: string;
  assignmentId?: string;
  meetingUrl?: string | null;
  startTime?: string;
  endTime?: string | null;
}

export function useCalendarEvents(selectedMonth: Date) {
  const { user } = useAuth();
  const { isTeacher } = useUserRole();

  const monthStart = startOfMonth(selectedMonth).toISOString();
  const monthEnd = endOfMonth(selectedMonth).toISOString();

  // Step 1: Get course IDs based on role
  const { data: courseIds, isLoading: courseIdsLoading } = useQuery({
    queryKey: ["calendar-course-ids", user?.id, isTeacher],
    queryFn: async () => {
      if (isTeacher) {
        const { data } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user!.id);
        return (data ?? []).map((c) => c.id);
      } else {
        const { data } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user!.id);
        return (data ?? []).map((e) => e.course_id);
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Step 2: Fetch assignments for the month
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["calendar-assignments", courseIds, monthStart, monthEnd],
    queryFn: async () => {
      if (!courseIds || courseIds.length === 0) return [];
      const { data } = await supabase
        .from("assignments")
        .select("*, courses(title)")
        .in("course_id", courseIds)
        .gte("deadline", monthStart)
        .lte("deadline", monthEnd);
      return data ?? [];
    },
    enabled: !!courseIds && courseIds.length > 0,
  });

  // Step 3: Fetch live classes for the month
  const { data: liveClasses, isLoading: liveClassesLoading } = useQuery({
    queryKey: ["calendar-live-classes", courseIds, monthStart, monthEnd],
    queryFn: async () => {
      if (!courseIds || courseIds.length === 0) return [];
      const { data } = await supabase
        .from("live_classes")
        .select("*, courses(title)")
        .in("course_id", courseIds)
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd);
      return data ?? [];
    },
    enabled: !!courseIds && courseIds.length > 0,
  });

  // Normalize into unified CalendarEvent[]
  const assignmentEvents: CalendarEvent[] = (assignments ?? []).map((a: AssignmentWithCourse) => ({
    id: a.id,
    title: a.title,
    date: parseISO(a.deadline),
    type: "assignment" as const,
    courseTitle: a.courses?.title ?? "Unknown Course",
    courseId: a.course_id,
    assignmentId: a.id,
  }));

  const liveClassEvents: CalendarEvent[] = (liveClasses ?? []).map((lc: LiveClassWithCourse) => ({
    id: lc.id,
    title: lc.title,
    date: parseISO(lc.start_time),
    type: "live_class" as const,
    courseTitle: lc.courses?.title ?? "Unknown Course",
    courseId: lc.course_id,
    meetingUrl: lc.meeting_url,
    startTime: lc.start_time,
    endTime: lc.end_time,
  }));

  const events = [...assignmentEvents, ...liveClassEvents];

  // Extract unique dates that have events (for calendar highlighting)
  const eventDates = events.map((e) => e.date);

  const isLoading = courseIdsLoading || assignmentsLoading || liveClassesLoading;

  return { events, eventDates, isLoading };
}
