import { formatTime, DAYS_OF_WEEK, DAY_LABELS } from '@/lib/utils'
import type { ClassItem } from '@/lib/types'

interface CalendarGridProps {
  classes: ClassItem[]
  showTutor?: boolean
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function CalendarGrid({ classes, showTutor = false }: CalendarGridProps) {
  const minHour = Math.min(
    7,
    ...classes.map(c => Math.floor(timeToMinutes(c.startTime) / 60))
  )
  const maxHour = Math.max(
    20,
    ...classes.map(c => Math.ceil(timeToMinutes(c.endTime) / 60))
  )
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour)
  const totalMinutes = hours.length * 60

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/50">
          <div className="p-2 text-xs font-medium text-muted-foreground">Time</div>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="border-l p-2 text-center text-xs font-medium">
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)]" style={{ height: `${hours.length * 60}px` }}>
          {/* Time labels */}
          <div className="relative">
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute w-full border-b px-2 text-right text-xs text-muted-foreground"
                style={{ top: `${i * 60}px`, height: '60px', lineHeight: '14px' }}
              >
                {formatTime(`${h.toString().padStart(2, '0')}:00`)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS_OF_WEEK.map(day => {
            const dayClasses = classes.filter(c => c.dayOfWeek === day)
            return (
              <div key={day} className="relative border-l">
                {/* Hour gridlines */}
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-dashed border-muted"
                    style={{ top: `${i * 60}px`, height: '60px' }}
                  />
                ))}

                {/* Class blocks */}
                {dayClasses.map(cls => {
                  const startMin = timeToMinutes(cls.startTime) - minHour * 60
                  const endMin = timeToMinutes(cls.endTime) - minHour * 60
                  const top = startMin
                  const height = Math.max(endMin - startMin, 20)

                  return (
                    <div
                      key={cls.id}
                      className="absolute left-1 right-1 overflow-hidden rounded-md px-1.5 py-1 text-white shadow-sm"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: cls.student.color,
                      }}
                      title={`${cls.student.studentName}${showTutor ? ` - ${cls.tutor.fullName}` : ''}\n${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`}
                    >
                      <p className="truncate text-xs font-medium">{cls.student.studentName}</p>
                      {showTutor && (
                        <p className="truncate text-[10px] opacity-90">{cls.tutor.fullName}</p>
                      )}
                      <p className="text-[10px] opacity-80">
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
