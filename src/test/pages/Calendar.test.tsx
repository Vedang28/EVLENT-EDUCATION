import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock the hook
const mockCalendarEvents = {
  events: [],
  eventDates: [],
  isLoading: false,
};

vi.mock("@/hooks/useCalendarEvents", () => ({
  useCalendarEvents: () => mockCalendarEvents,
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

import CalendarPage from "@/pages/Calendar";

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

describe("Calendar Page", () => {
  it("renders calendar widget and event panel", () => {
    renderWithProviders(<CalendarPage />);
    expect(screen.getByText("Student Calendar")).toBeInTheDocument();
    expect(screen.getByText(/Events for/)).toBeInTheDocument();
  });

  it("shows loading spinner while fetching", () => {
    mockCalendarEvents.isLoading = true;
    renderWithProviders(<CalendarPage />);
    // Spinner is an animated div
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    mockCalendarEvents.isLoading = false;
  });

  it("shows empty state when no events for selected day", () => {
    mockCalendarEvents.events = [];
    renderWithProviders(<CalendarPage />);
    expect(screen.getByText("No events scheduled for this day")).toBeInTheDocument();
  });

  it("displays assignment events with correct badge", () => {
    mockCalendarEvents.events = [
      {
        id: "a1",
        title: "Homework 1",
        date: new Date(),
        type: "assignment",
        courseTitle: "Math 101",
        courseId: "c1",
        assignmentId: "a1",
      },
    ];
    renderWithProviders(<CalendarPage />);
    expect(screen.getByText("Homework 1")).toBeInTheDocument();
    expect(screen.getByText("Assignment")).toBeInTheDocument();
    expect(screen.getByText("Math 101")).toBeInTheDocument();
    mockCalendarEvents.events = [];
  });

  it("displays live class events with join button", () => {
    mockCalendarEvents.events = [
      {
        id: "lc1",
        title: "Lecture 1",
        date: new Date(),
        type: "live_class",
        courseTitle: "Physics",
        courseId: "c1",
        meetingUrl: "https://meet.example.com",
        startTime: new Date().toISOString(),
        endTime: null,
      },
    ];
    renderWithProviders(<CalendarPage />);
    expect(screen.getByText("Lecture 1")).toBeInTheDocument();
    expect(screen.getByText("Live Class")).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
    mockCalendarEvents.events = [];
  });

  it("clicking an assignment has link to assignment page", () => {
    mockCalendarEvents.events = [
      {
        id: "a1",
        title: "Essay",
        date: new Date(),
        type: "assignment",
        courseTitle: "English",
        courseId: "c1",
        assignmentId: "a1",
      },
    ];
    renderWithProviders(<CalendarPage />);
    const viewLink = screen.getByText("View").closest("a");
    expect(viewLink).toHaveAttribute("href", "/courses/c1/assignments/a1");
    mockCalendarEvents.events = [];
  });
});
