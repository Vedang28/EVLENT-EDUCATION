import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { startOfWeek, endOfWeek, parseISO, getDay, getHours } from "date-fns";

export interface TimetableClass {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  startTime: Date;
  endTime: Date | null;
  meetingUrl: string | null;
  dayOfWeek: number; // 0=Mon, 1=Tue ... 5=Sat
  startHour: number;
}

export interface TimetableCourse {
  id: string;
  title: string;
}

export function useTimetableClasses(weekStart: Date) {
  const { user } = useAuth();
  const { isTeacher } = useUserRole();

  const weekOpts = { weekStartsOn: 1 as const };
  const weekBegin = startOfWeek(weekStart, weekOpts).toISOString();
  const weekFinish = endOfWeek(weekStart, weekOpts).toISOString();

  // Step 1: Get course IDs based on role
  const { data: courseIds, isLoading: courseIdsLoading } = useQuery({
    queryKey: ["timetable-course-ids", user?.id, isTeacher],
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
  });

  // Step 2: Fetch live classes for the week
  const { data: rawClasses, isLoading: classesLoading } = useQuery({
    queryKey: ["timetable-classes", courseIds, weekBegin, weekFinish],
    queryFn: async () => {
      if (!courseIds || courseIds.length === 0) return [];
      const { data } = await supabase
        .from("live_classes")
        .select("*, courses(id, title)")
        .in("course_id", courseIds)
        .gte("start_time", weekBegin)
        .lte("start_time", weekFinish)
        .order("start_time", { ascending: true });
      return data ?? [];
    },
    enabled: !!courseIds && courseIds.length > 0,
  });

  // Normalize into TimetableClass[]
  const classes: TimetableClass[] = (rawClasses ?? []).map((lc: any) => {
    const start = parseISO(lc.start_time);
    // Convert JS getDay (0=Sun) to Mon-start (0=Mon ... 5=Sat, 6=Sun)
    const jsDay = getDay(start);
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    return {
      id: lc.id,
      title: lc.title,
      courseId: lc.course_id,
      courseTitle: lc.courses?.title ?? "Unknown Course",
      startTime: start,
      endTime: lc.end_time ? parseISO(lc.end_time) : null,
      meetingUrl: lc.meeting_url,
      dayOfWeek,
      startHour: getHours(start),
    };
  });

  // Extract unique courses for filter dropdown
  const coursesMap = new Map<string, TimetableCourse>();
  for (const c of classes) {
    if (!coursesMap.has(c.courseId)) {
      coursesMap.set(c.courseId, { id: c.courseId, title: c.courseTitle });
    }
  }
  const courses = Array.from(coursesMap.values());

  const isLoading = courseIdsLoading || classesLoading;

  return { classes, courses, isLoading };
}
