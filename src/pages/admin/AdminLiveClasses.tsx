import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Video, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminLiveClasses() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [startTime, setStartTime] = useState("");

  const { data: classes, isLoading } = useQuery({
    queryKey: ["admin-live-classes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("live_classes")
        .select("*, courses(title)")
        .order("start_time", { ascending: false });
      return data ?? [];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["admin-teachers-for-classes"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      if (!roles?.length) return [];
      const teacherIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", teacherIds);
      return profiles ?? [];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-for-classes", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } = await supabase.from("courses").select("id, title").eq("teacher_id", teacherId);
      return data ?? [];
    },
    enabled: !!teacherId,
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, name, email");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !teacherId || !courseId || !startTime) {
        throw new Error("Please fill all required fields");
      }
      const { error } = await supabase.from("live_classes").insert({
        title: title.trim(),
        teacher_id: teacherId,
        course_id: courseId,
        meeting_url: meetingUrl.trim() || null,
        start_time: new Date(startTime).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-live-classes"] });
      toast({ title: "Live class created" });
      resetForm();
      setCreateOpen(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-live-classes"] });
      toast({ title: "Live class deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function resetForm() {
    setTitle("");
    setTeacherId("");
    setCourseId("");
    setMeetingUrl("");
    setStartTime("");
  }

  const getTeacherName = (tid: string) => {
    const p = profiles?.find((pr) => pr.user_id === tid);
    return p?.name || p?.email || "Unknown";
  };

  const now = new Date();
  const upcoming = classes?.filter((c) => new Date(c.start_time) >= now) ?? [];
  const past = classes?.filter((c) => new Date(c.start_time) < now) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
          <p className="text-muted-foreground">Schedule and manage live classes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Schedule Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Live Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={teacherId} onValueChange={(v) => { setTeacherId(v); setCourseId(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.name || t.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId} disabled={!teacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder={teacherId ? "Select course" : "Select teacher first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chapter 5 - Live Q&A" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meeting URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !teacherId || !courseId || !startTime || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Upcoming ({upcoming.length})</CardTitle></CardHeader>
            <CardContent>
              {!upcoming.length ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No upcoming classes</p>
              ) : (
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((lc: any) => (
                        <TableRow key={lc.id}>
                          <TableCell className="font-medium">{lc.title}</TableCell>
                          <TableCell className="text-muted-foreground">{lc.courses?.title || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{getTeacherName(lc.teacher_id)}</TableCell>
                          <TableCell>{format(new Date(lc.start_time), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {lc.meeting_url && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                                  <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-3 w-3" /> Join
                                  </a>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs gap-1"
                                onClick={() => { if (confirm("Delete this class?")) deleteMutation.mutate(lc.id); }}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {past.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Past Classes ({past.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((lc: any) => (
                        <TableRow key={lc.id} className="opacity-60">
                          <TableCell className="font-medium">{lc.title}</TableCell>
                          <TableCell className="text-muted-foreground">{lc.courses?.title || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{getTeacherName(lc.teacher_id)}</TableCell>
                          <TableCell>{format(new Date(lc.start_time), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
