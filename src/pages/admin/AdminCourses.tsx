import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Trash2, BookOpen, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

type CourseStatus = "pending" | "approved" | "rejected";

const statusConfig: Record<CourseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export default function AdminCourses() {
  const qc = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data ?? [];
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*");
      return data ?? [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ courseId, status }: { courseId: string; status: CourseStatus }) => {
      const { error } = await supabase.from("courses").update({ status } as any).eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: `Course ${status}` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const getTeacherName = (teacherId: string) => profiles?.find((p) => p.user_id === teacherId)?.name || "Unknown";
  const getEnrollmentCount = (courseId: string) => enrollments?.filter((e) => e.course_id === courseId).length ?? 0;

  const pendingCourses = courses?.filter((c) => (c as any).status === "pending") ?? [];
  const approvedCourses = courses?.filter((c) => (c as any).status === "approved") ?? [];
  const rejectedCourses = courses?.filter((c) => (c as any).status === "rejected") ?? [];

  const renderTable = (list: typeof courses) => (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list?.map((c) => {
            const status = ((c as any).status || "pending") as CourseStatus;
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium max-w-[250px] truncate">{c.title}</TableCell>
                <TableCell className="text-muted-foreground">{getTeacherName(c.teacher_id)}</TableCell>
                <TableCell>
                  <Badge variant={cfg.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" /> {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {getEnrollmentCount(c.id)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1"
                          onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "approved" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs gap-1"
                          onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "rejected" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                    {status === "rejected" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs gap-1"
                        onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "approved" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3" /> Approve
                      </Button>
                    )}
                    {status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "rejected" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="h-3 w-3" /> Revoke
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        if (confirm("Delete this course? This cannot be undone.")) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {(list?.length ?? 0) === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No courses</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">Approve, reject, and manage all platform courses</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-3.5 w-3.5" /> Pending ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Approved ({approvedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1">
              <XCircle className="h-3.5 w-3.5" /> Rejected ({rejectedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1">
              <BookOpen className="h-3.5 w-3.5" /> All ({courses?.length ?? 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderTable(pendingCourses)}</TabsContent>
          <TabsContent value="approved">{renderTable(approvedCourses)}</TabsContent>
          <TabsContent value="rejected">{renderTable(rejectedCourses)}</TabsContent>
          <TabsContent value="all">{renderTable(courses)}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
