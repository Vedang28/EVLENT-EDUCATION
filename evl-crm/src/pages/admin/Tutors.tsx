import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { DAYS_OF_WEEK, DAY_LABELS, formatTime } from '@/lib/utils'
import type { Tutor, TutorAvailability } from '@/lib/types'

const emptyForm = {
  fullName: '', email: '', phone: '', tutorId: '', username: '', password: '', status: 'ACTIVE' as const,
}

export default function AdminTutors() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/tutor" replace />

  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tutor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showAvail, setShowAvail] = useState<Tutor | null>(null)
  const [availSlots, setAvailSlots] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({})

  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => api.get<Tutor[]>('/tutors'),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/tutors', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      setShowForm(false)
      setForm(emptyForm)
      toast.success('Tutor created')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/tutors/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      setEditing(null)
      setShowForm(false)
      toast.success('Tutor updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tutors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      toast.success('Tutor deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const availMutation = useMutation({
    mutationFn: ({ tutorId, slots }: { tutorId: number; slots: any[] }) =>
      api.put(`/availability/${tutorId}`, { slots }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      setShowAvail(null)
      toast.success('Availability updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(t: Tutor) {
    setEditing(t)
    setForm({
      fullName: t.fullName,
      email: t.email,
      phone: t.phone || '',
      tutorId: t.tutorId,
      username: t.user.username,
      password: '',
      status: t.status,
    })
    setShowForm(true)
  }

  function openAvailability(t: Tutor) {
    api.get<TutorAvailability[]>(`/availability/${t.id}`).then(avail => {
      const slots: Record<string, { enabled: boolean; start: string; end: string }> = {}
      DAYS_OF_WEEK.forEach(day => {
        const existing = avail.find(a => a.dayOfWeek === day)
        slots[day] = existing
          ? { enabled: true, start: existing.startTime, end: existing.endTime }
          : { enabled: false, start: '09:00', end: '17:00' }
      })
      setAvailSlots(slots)
      setShowAvail(t)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  function saveAvailability() {
    if (!showAvail) return
    const slots = Object.entries(availSlots)
      .filter(([, v]) => v.enabled)
      .map(([day, v]) => ({ dayOfWeek: day, startTime: v.start, endTime: v.end }))
    availMutation.mutate({ tutorId: showAvail.id, slots })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tutors</h1>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Tutor</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !tutors.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No tutors yet. Click "Add Tutor" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map(t => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t.fullName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.email}</p>
                  </div>
                  <Badge variant={t.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {t.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>ID: {t.tutorId}</p>
                  <p>Username: {t.user.username}</p>
                  {t.phone && <p>Phone: {t.phone}</p>}
                  <p>{t._count?.students ?? 0} students &middot; {t._count?.classes ?? 0} classes</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAvailability(t)}>
                    <Clock className="mr-1 h-3 w-3" /> Availability
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(`Delete tutor ${t.fullName}?`)) deleteMutation.mutate(t.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tutor' : 'Add New Tutor'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update tutor details' : 'Create a new tutor account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tutor ID</Label>
                <Input required value={form.tutorId} onChange={e => setForm({ ...form, tutorId: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required disabled={!!editing} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{editing ? 'New Password (leave blank to keep)' : 'Password'}</Label>
                <Input type="password" required={!editing} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Create Tutor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={!!showAvail} onOpenChange={() => setShowAvail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Availability</DialogTitle>
            <DialogDescription>{showAvail?.fullName}'s weekly schedule</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="flex items-center gap-3">
                <label className="flex w-24 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={availSlots[day]?.enabled ?? false}
                    onChange={e =>
                      setAvailSlots(prev => ({
                        ...prev,
                        [day]: { ...prev[day], enabled: e.target.checked },
                      }))
                    }
                    className="rounded"
                  />
                  {DAY_LABELS[day]?.slice(0, 3)}
                </label>
                {availSlots[day]?.enabled && (
                  <>
                    <Input
                      type="time"
                      className="w-28"
                      value={availSlots[day].start}
                      onChange={e =>
                        setAvailSlots(prev => ({
                          ...prev,
                          [day]: { ...prev[day], start: e.target.value },
                        }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-28"
                      value={availSlots[day].end}
                      onChange={e =>
                        setAvailSlots(prev => ({
                          ...prev,
                          [day]: { ...prev[day], end: e.target.value },
                        }))
                      }
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAvail(null)}>Cancel</Button>
            <Button onClick={saveAvailability} disabled={availMutation.isPending}>
              Save Availability
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
