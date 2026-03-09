import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function TeacherStudents() {
  const { user } = useAuth();
  const { isTeacher, isLoading: roleLoading } = useUserRole();

  const { data: assignedStudents, isLoading } = useQuery({
    queryKey: ["teacher-assigned-students", user?.id],
    queryFn: async () => {
      // Get student IDs assigned to this teacher
      const { data: assignments } = await supabase
        .from("teacher_students")
        .select("student_id")
        .eq("teacher_id", user!.id);

      if (!assignments?.length) return [];

      const studentIds = assignments.map((a) => a.student_id);

      // Get profiles for those students
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", studentIds)
        .order("name");

      return profiles ?? [];
    },
    enabled: !!user,
  });

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isTeacher) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
        <p className="text-muted-foreground mt-1">Students assigned to you by the administrator</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" /> Assigned Students ({assignedStudents?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading students…</p>
          ) : !assignedStudents?.length ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No students have been assigned to you yet. Contact your administrator.
            </p>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
