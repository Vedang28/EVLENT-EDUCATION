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
import { DAY_LABELS, DAYS_OF_WEEK, formatTime } from '@/lib/utils'
import type { ClassItem, Student, Tutor } from '@/lib/types'

const emptyForm = {
  studentId: '', tutorId: '', dayOfWeek: '', startTime: '', endTime: '', notes: '',
}

export default function AdminClasses() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClassItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get<ClassItem[]>('/classes'),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get<Student[]>('/students'),
  })

  const { data: tutors = [] } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => api.get<Tutor[]>('/tutors'),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/classes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      setShowForm(false)
      setForm(emptyForm)
      toast.success('Class scheduled')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/classes/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      setEditing(null)
      setShowForm(false)
      toast.success('Class updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Class deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c: ClassItem) {
    setEditing(c)
    setForm({
      studentId: c.studentId.toString(),
      tutorId: c.tutorId.toString(),
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      notes: c.notes || '',
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      ...form,
      studentId: Number(form.studentId),
      tutorId: Number(form.tutorId),
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const grouped = DAYS_OF_WEEK.reduce((acc, day) => {
    const dayClasses = classes.filter(c => c.dayOfWeek === day)
    if (dayClasses.length) acc.push({ day, classes: dayClasses })
    return acc
  }, [] as { day: string; classes: ClassItem[] }[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Class Schedule</h1>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Schedule Class</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !classes.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No classes scheduled. Click "Schedule Class" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ day, classes: dayClasses }) => (
            <div key={day}>
              <h2 className="mb-3 text-lg font-semibold">{DAY_LABELS[day]}</h2>
              <div className="space-y-2">
                {dayClasses.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.student.color }} />
                      <div>
                        <p className="text-sm font-medium">{c.student.studentName}</p>
                        <p className="text-xs text-muted-foreground">with {c.tutor.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        {formatTime(c.startTime)} - {formatTime(c.endTime)}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Delete this class?')) deleteMutation.mutate(c.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Class' : 'Schedule New Class'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update class details' : 'Create a new recurring weekly class'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.studentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tutor</Label>
                <Select value={form.tutorId} onValueChange={v => setForm({ ...form, tutorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tutor" /></SelectTrigger>
                  <SelectContent>
                    {tutors.filter(t => t.status === 'ACTIVE').map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={form.dayOfWeek} onValueChange={v => setForm({ ...form, dayOfWeek: v })}>
                <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(d => (
                    <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Schedule Class'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
