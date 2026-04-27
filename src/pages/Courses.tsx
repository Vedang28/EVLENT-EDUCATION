import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type CourseWithJoins = CourseRow & {
  subjects: { id: string; name: string } | null;
  grade_levels: { id: string; name: string } | null;
};

export default function Courses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const { data: subjects } = useSubjects();
  const { isStudent } = useUserRole();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, grade_levels(name)")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: allCourses, isLoading } = useQuery({
    queryKey: ["all-courses", "approved"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, subjects(id, name), grade_levels(id, name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      return (data ?? []) as CourseWithJoins[];
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("course_id").eq("student_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const enrolledIds = new Set(enrollments?.map((e) => e.course_id) ?? []);

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("enrollments").insert({ student_id: user!.id, course_id: courseId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrolled successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const studentGradeId = isStudent ? profile?.grade_level_id : null;

  const filtered = useMemo(() => {
    return (allCourses ?? []).filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesSubject = subjectFilter === "all" || c.subject_id === subjectFilter;
      const matchesGrade = !studentGradeId || c.grade_level_id === studentGradeId;
      return matchesSearch && matchesSubject && matchesGrade;
    });
  }, [allCourses, debouncedSearch, subjectFilter, studentGradeId]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Browse and enroll in courses</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {studentGradeId && (profile as any)?.grade_levels?.name && (
          <Badge variant="outline" className="h-9 px-3 text-sm">
            {(profile as any).grade_levels.name}
          </Badge>
        )}

        {subjectFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubjectFilter("all")}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No courses available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {course.subjects && (
                      <Badge variant="secondary" className="text-xs">
                        {course.subjects.name}
                      </Badge>
                    )}
                    {course.grade_levels && (
                      <Badge variant="outline" className="text-xs">
                        {course.grade_levels.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    <Link to={`/courses/${course.id}`} className="hover:text-primary transition-colors">
                      {course.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{course.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEnrolled ? (
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to={`/courses/${course.id}`}>
                        <Check className="mr-2 h-4 w-4" /> Continue Learning
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => enrollMutation.mutate(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Enroll
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
