import { useState, useMemo } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useTimetableClasses, TimetableClass } from "@/hooks/useTimetableClasses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Printer, Video, CalendarOff } from "lucide-react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
} from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 – 20:00

const CLASS_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-teal-100 border-teal-300 text-teal-800",
];

export default function TimetablePage() {
  const { isTeacher } = useUserRole();
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [courseFilter, setCourseFilter] = useState("all");

  const { classes, courses, isLoading } = useTimetableClasses(weekStart);

  // Assign consistent colors per course
  const courseColorMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c, i) => {
      map.set(c.id, CLASS_COLORS[i % CLASS_COLORS.length]);
    });
    return map;
  }, [courses]);

  const filteredClasses = useMemo(
    () =>
      courseFilter === "all"
        ? classes
        : classes.filter((c) => c.courseId === courseFilter),
    [classes, courseFilter],
  );

  // Build a lookup: `${dayOfWeek}-${hour}` → TimetableClass[]
  const cellMap = useMemo(() => {
    const map = new Map<string, TimetableClass[]>();
    for (const c of filteredClasses) {
      const key = `${c.dayOfWeek}-${c.startHour}`;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [filteredClasses]);

  const monday = startOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isTeacher ? "Teacher" : "Student"} Timetable
          </h1>
          <p className="text-muted-foreground mt-1">
            Weekly schedule of live classes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="w-fit"
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm font-medium">
          {format(monday, "MMM d")} – {format(addDays(monday, 6), "MMM d, yyyy")}
        </span>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timetable Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <CalendarOff className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No classes scheduled this week
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table className="print:shadow-none print:border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Time</TableHead>
                  {DAYS.map((day, i) => (
                    <TableHead key={day} className="text-center min-w-[120px]">
                      <div>{day}</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {format(addDays(monday, i), "MMM d")}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {HOURS.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {hour.toString().padStart(2, "0")}:00
                    </TableCell>
                    {DAYS.map((_, dayIdx) => {
                      const cellClasses = cellMap.get(`${dayIdx}-${hour}`) ?? [];
                      return (
                        <TableCell
                          key={dayIdx}
                          className="p-1 align-top h-14"
                        >
                          {cellClasses.map((cls) => (
                            <ClassCard
                              key={cls.id}
                              cls={cls}
                              colorClass={
                                courseColorMap.get(cls.courseId) ??
                                CLASS_COLORS[0]
                              }
                            />
                          ))}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}

function ClassCard({
  cls,
  colorClass,
}: {
  cls: TimetableClass;
  colorClass: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`rounded-md border p-1.5 text-xs cursor-default ${colorClass}`}
        >
          <p className="font-medium truncate">{cls.title}</p>
          <p className="truncate opacity-75">{cls.courseTitle}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span>
              {format(cls.startTime, "h:mm a")}
              {cls.endTime && ` – ${format(cls.endTime, "h:mm a")}`}
            </span>
            {cls.meetingUrl && <Video className="h-3 w-3 shrink-0" />}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{cls.title}</p>
          <p className="text-xs">{cls.courseTitle}</p>
          <p className="text-xs">
            {format(cls.startTime, "h:mm a")}
            {cls.endTime && ` – ${format(cls.endTime, "h:mm a")}`}
          </p>
          {cls.meetingUrl && /^https?:\/\//.test(cls.meetingUrl) && (
            <a
              href={cls.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              Join Meeting
            </a>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
