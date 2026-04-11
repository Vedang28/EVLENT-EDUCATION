import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock the hook
const mockTimetable = {
  classes: [] as any[],
  courses: [] as any[],
  isLoading: false,
};

vi.mock("@/hooks/useTimetableClasses", () => ({
  useTimetableClasses: () => mockTimetable,
}));

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({
    isTeacher: false,
    isStudent: true,
    isAdmin: false,
    roles: ["student"],
    isLoading: false,
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

import TimetablePage from "@/pages/Timetable";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TooltipProvider>{ui}</TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Timetable Page", () => {
  it("renders weekly grid with correct day headers", () => {
    mockTimetable.classes = [
      {
        id: "lc1",
        title: "Test Class",
        courseId: "c1",
        courseTitle: "Physics",
        startTime: new Date("2026-04-09T10:00:00Z"),
        endTime: new Date("2026-04-09T11:00:00Z"),
        meetingUrl: null,
        dayOfWeek: 2,
        startHour: 10,
      },
    ];
    mockTimetable.courses = [{ id: "c1", title: "Physics" }];

    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();

    mockTimetable.classes = [];
    mockTimetable.courses = [];
  });

  it("renders time slots from 8:00 to 20:00", () => {
    mockTimetable.classes = [
      {
        id: "lc1", title: "X", courseId: "c1", courseTitle: "C",
        startTime: new Date("2026-04-09T08:00:00Z"), endTime: null,
        meetingUrl: null, dayOfWeek: 2, startHour: 8,
      },
    ];
    mockTimetable.courses = [{ id: "c1", title: "C" }];

    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();

    mockTimetable.classes = [];
    mockTimetable.courses = [];
  });

  it("shows empty state when no classes", () => {
    mockTimetable.classes = [];
    mockTimetable.courses = [];

    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("No classes scheduled this week")).toBeInTheDocument();
  });

  it("shows classes in the grid", () => {
    mockTimetable.classes = [
      {
        id: "lc1",
        title: "Quantum Mechanics",
        courseId: "c1",
        courseTitle: "Physics",
        startTime: new Date("2026-04-09T10:00:00Z"),
        endTime: new Date("2026-04-09T11:00:00Z"),
        meetingUrl: null,
        dayOfWeek: 2,
        startHour: 10,
      },
    ];
    mockTimetable.courses = [{ id: "c1", title: "Physics" }];

    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("Quantum Mechanics")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();

    mockTimetable.classes = [];
    mockTimetable.courses = [];
  });

  it("print button exists", () => {
    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("Print")).toBeInTheDocument();
  });

  it("today button exists", () => {
    renderWithProviders(<TimetablePage />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
});
