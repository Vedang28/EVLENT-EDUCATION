import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit2, BookOpen } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];

const subjectNameMax = 100;
const subjectDescMax = 500;

export default function AdminSubjects() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      if (trimmedName.length > subjectNameMax) throw new Error("Name too long");
      if (description.length > subjectDescMax) throw new Error("Description too long");
      const { error } = await supabase.from("subjects").insert({
        name: trimmedName,
        description: description.trim() || null,
        icon: icon.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      resetForm();
      setAddOpen(false);
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject added!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editSubject) return;
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      if (trimmedName.length > subjectNameMax) throw new Error("Name too long");
      if (description.length > subjectDescMax) throw new Error("Description too long");
      const { error } = await supabase.from("subjects").update({
        name: trimmedName,
        description: description.trim() || null,
        icon: icon.trim() || null,
      }).eq("id", editSubject.id);
      if (error) throw error;
    },
    onSuccess: () => {
      resetForm();
      setEditOpen(false);
      setEditSubject(null);
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("");
  }

  function openEdit(subject: SubjectRow) {
    setEditSubject(subject);
    setName(subject.name);
    setDescription(subject.description ?? "");
    setIcon(subject.icon ?? "");
    setEditOpen(true);
  }

  const SubjectForm = ({ onSubmit, isPending, buttonLabel }: { onSubmit: () => void; isPending: boolean; buttonLabel: string }) => (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input placeholder="e.g., Mathematics" value={name} onChange={(e) => setName(e.target.value)} maxLength={subjectNameMax} />
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={subjectDescMax} />
      </div>
      <div className="space-y-2">
        <Label>Icon name (optional, lucide icon)</Label>
        <Input placeholder="e.g., calculator" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={50} />
      </div>
      <Button onClick={onSubmit} disabled={!name.trim() || isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects available on the platform</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Subject</DialogTitle></DialogHeader>
            <SubjectForm onSubmit={() => addMutation.mutate()} isPending={addMutation.isPending} buttonLabel="Add Subject" />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">{s.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.icon || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => { if (confirm(`Delete "${s.name}"?`)) deleteMutation.mutate(s.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(subjects?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No subjects yet. Add one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { resetForm(); setEditSubject(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
          <SubjectForm onSubmit={() => updateMutation.mutate()} isPending={updateMutation.isPending} buttonLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
