import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { STUDENT_COLORS } from '@/lib/utils'
import type { Student, Tutor } from '@/lib/types'

const emptyForm = {
  studentName: '', parentName: '', parentContact: '', parentEmail: '',
  tutorId: '' as string, notes: '', color: STUDENT_COLORS[0],
}

export default function AdminStudents() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get<Student[]>('/students'),
  })

  const { data: tutors = [] } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => api.get<Tutor[]>('/tutors'),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/students', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setShowForm(false)
      setForm(emptyForm)
      toast.success('Student created')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/students/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setEditing(null)
      setShowForm(false)
      toast.success('Student updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, color: STUDENT_COLORS[students.length % STUDENT_COLORS.length] })
    setShowForm(true)
  }

  function openEdit(s: Student) {
    setEditing(s)
    setForm({
      studentName: s.studentName,
      parentName: s.parentName || '',
      parentContact: s.parentContact || '',
      parentEmail: s.parentEmail || '',
      tutorId: s.tutorId?.toString() || '',
      notes: s.notes || '',
      color: s.color,
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      ...form,
      tutorId: form.tutorId ? Number(form.tutorId) : null,
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filtered = students.filter(s =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    (s.tutor?.fullName || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
      </div>

      <Input
        placeholder="Search students..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !filtered.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {search ? 'No students match your search' : 'No students yet. Click "Add Student" to create one.'}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Parent</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Assigned Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Classes</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-medium">{s.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {s.parentName || '—'}
                    {s.parentContact && <span className="ml-2">({s.parentContact})</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {s.tutor ? s.tutor.fullName : <span className="text-muted-foreground">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">{s._count?.classes ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Delete student ${s.studentName}?`)) deleteMutation.mutate(s.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update student details' : 'Create a new student profile'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Name</Label>
                <Input value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Parent Contact</Label>
                <Input value={form.parentContact} onChange={e => setForm({ ...form, parentContact: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parent Email</Label>
              <Input type="email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned Tutor</Label>
                <Select value={form.tutorId} onValueChange={v => setForm({ ...form, tutorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tutor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {tutors.filter(t => t.status === 'ACTIVE').map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-1.5 pt-1">
                  {STUDENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`h-6 w-6 rounded-full border-2 ${form.color === c ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Create Student'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
