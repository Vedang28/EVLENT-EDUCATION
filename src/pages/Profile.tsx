import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubjects } from "@/hooks/useSubjects";
import { useGradeLevels } from "@/hooks/useGradeLevels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, User, GraduationCap, BookOpen, X } from "lucide-react";
import { profileNameSchema, passwordSchema } from "@/lib/validations";
import type { Database } from "@/integrations/supabase/types";

type TeacherSubjectRow = Database["public"]["Tables"]["teacher_subjects"]["Row"];
type TeacherSubjectWithJoin = TeacherSubjectRow & {
  subjects: { id: string; name: string } | null;
};

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isTeacher, isStudent } = useUserRole();
  const { data: subjects } = useSubjects();
  const { data: gradeLevels } = useGradeLevels();
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Teacher subject expertise
  const { data: teacherSubjects } = useQuery({
    queryKey: ["teacher-subjects", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_subjects")
        .select("*, subjects(id, name)")
        .eq("teacher_id", user!.id);
      return (data ?? []) as TeacherSubjectWithJoin[];
    },
    enabled: !!user && isTeacher,
  });

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const result = profileNameSchema.safeParse({ name });
      if (!result.success) throw new Error(result.error.errors[0].message);
      const { error } = await supabase.from("profiles").update({ name: result.data.name }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const result = passwordSchema.safeParse({ password: newPassword });
      if (!result.success) throw new Error(result.error.errors[0].message);
      const { error } = await supabase.auth.updateUser({ password: result.data.password });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword("");
      toast.success("Password updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateGradeLevelMutation = useMutation({
    mutationFn: async (gradeLevelId: string | null) => {
      const { error } = await supabase
        .from("profiles")
        .update({ grade_level_id: gradeLevelId })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Grade level updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addSubjectExpertise = useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase
        .from("teacher_subjects")
        .insert({ teacher_id: user!.id, subject_id: subjectId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Subject added!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeSubjectExpertise = useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", user!.id)
        .eq("subject_id", subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Subject removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const teacherSubjectIds = new Set(teacherSubjects?.map((ts) => ts.subject_id) ?? []);
  const availableSubjects = subjects?.filter((s) => !teacherSubjectIds.has(s.id)) ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Student: Grade Level */}
      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Grade Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Select your current grade level to get personalized course recommendations.</p>
            <Select
              value={profile?.grade_level_id ?? ""}
              onValueChange={(v) => updateGradeLevelMutation.mutate(v || null)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Teacher: Subject Expertise */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Subject Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Select the subjects you teach or have expertise in.</p>
            {teacherSubjects && teacherSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teacherSubjects.map((ts) => (
                  <Badge key={ts.id} variant="secondary" className="gap-1 pr-1">
                    {ts.subjects?.name}
                    <button
                      onClick={() => removeSubjectExpertise.mutate(ts.subject_id)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {availableSubjects.length > 0 && (
              <Select onValueChange={(v) => addSubjectExpertise.mutate(v)}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Add a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
          </div>
          <Button onClick={() => updatePasswordMutation.mutate()} disabled={updatePasswordMutation.isPending || newPassword.length < 6}>
            {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
