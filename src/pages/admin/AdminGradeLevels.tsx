import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit2, GraduationCap } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type GradeLevelRow = Database["public"]["Tables"]["grade_levels"]["Row"];

const nameMax = 50;

export default function AdminGradeLevels() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editGrade, setEditGrade] = useState<GradeLevelRow | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("0");

  const { data: gradeLevels, isLoading } = useQuery({
    queryKey: ["grade-levels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grade_levels").select("*").order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      if (trimmedName.length > nameMax) throw new Error("Name too long");
      const pos = parseInt(position);
      if (isNaN(pos) || pos < 0) throw new Error("Position must be a non-negative number");
      const { error } = await supabase.from("grade_levels").insert({
        name: trimmedName,
        position: pos,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      resetForm();
      setAddOpen(false);
      qc.invalidateQueries({ queryKey: ["grade-levels"] });
      toast.success("Grade level added!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editGrade) return;
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      if (trimmedName.length > nameMax) throw new Error("Name too long");
      const pos = parseInt(position);
      if (isNaN(pos) || pos < 0) throw new Error("Position must be a non-negative number");
      const { error } = await supabase.from("grade_levels").update({
        name: trimmedName,
        position: pos,
      }).eq("id", editGrade.id);
      if (error) throw error;
    },
    onSuccess: () => {
      resetForm();
      setEditOpen(false);
      setEditGrade(null);
      qc.invalidateQueries({ queryKey: ["grade-levels"] });
      toast.success("Grade level updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grade_levels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grade-levels"] });
      toast.success("Grade level deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function resetForm() {
    setName("");
    setPosition("0");
  }

  function openEdit(grade: GradeLevelRow) {
    setEditGrade(grade);
    setName(grade.name);
    setPosition(String(grade.position));
    setEditOpen(true);
  }

  const GradeForm = ({ onSubmit, isPending, buttonLabel }: { onSubmit: () => void; isPending: boolean; buttonLabel: string }) => (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input placeholder="e.g., Class 1" value={name} onChange={(e) => setName(e.target.value)} maxLength={nameMax} />
      </div>
      <div className="space-y-2">
        <Label>Position (sort order)</Label>
        <Input type="number" min={0} value={position} onChange={(e) => setPosition(e.target.value)} />
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
          <h1 className="text-3xl font-bold tracking-tight">Grade Levels</h1>
          <p className="text-muted-foreground">Manage grade levels available on the platform</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Grade Level</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Grade Level</DialogTitle></DialogHeader>
            <GradeForm onSubmit={() => addMutation.mutate()} isPending={addMutation.isPending} buttonLabel="Add Grade Level" />
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
                <TableHead className="w-[80px]">Position</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeLevels?.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="text-muted-foreground">{g.position}</TableCell>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => { if (confirm(`Delete "${g.name}"?`)) deleteMutation.mutate(g.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(gradeLevels?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No grade levels yet. Add one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { resetForm(); setEditGrade(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Grade Level</DialogTitle></DialogHeader>
          <GradeForm onSubmit={() => updateMutation.mutate()} isPending={updateMutation.isPending} buttonLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
