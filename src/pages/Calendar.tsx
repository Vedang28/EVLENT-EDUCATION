import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useUserRole } from "@/hooks/useUserRole";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarOff, Video, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isSameDay } from "date-fns";

export default function CalendarPage() {
  const { isTeacher } = useUserRole();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const { events, eventDates, isLoading } = useCalendarEvents(selectedMonth);

  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.date, selectedDay)),
    [events, selectedDay],
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isTeacher ? "Teacher" : "Student"} Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          View assignment deadlines and live class sessions
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel: Calendar widget */}
        <Card className="md:w-auto shrink-0">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={(day) => day && setSelectedDay(day)}
              onMonthChange={setSelectedMonth}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent:
                  "bg-primary/20 text-primary font-semibold rounded-md",
              }}
            />
          </CardContent>
        </Card>

        {/* Right panel: Events for selected day */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">
              Events for {format(selectedDay, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : dayEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <CalendarOff className="h-12 w-12" />
                <p className="text-sm">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  if (event.type === "assignment") {
    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
              <FileText className="mr-1 h-3 w-3" />
              Assignment
            </Badge>
          </div>
          <p className="font-medium">{event.title}</p>
          <p className="text-xs text-muted-foreground">{event.courseTitle}</p>
          <p className="text-xs text-muted-foreground">
            Due: {format(event.date, "h:mm a")}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/courses/${event.courseId}/assignments/${event.assignmentId}`}>
            View
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
            <Video className="mr-1 h-3 w-3" />
            Live Class
          </Badge>
        </div>
        <p className="font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">{event.courseTitle}</p>
        <p className="text-xs text-muted-foreground">
          {event.startTime && format(new Date(event.startTime), "h:mm a")}
          {event.endTime && ` – ${format(new Date(event.endTime), "h:mm a")}`}
        </p>
      </div>
      {event.meetingUrl && /^https?:\/\//.test(event.meetingUrl) && (
        <a
          href={event.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Video className="h-4 w-4" /> Join
        </a>
      )}
    </div>
  );
}
