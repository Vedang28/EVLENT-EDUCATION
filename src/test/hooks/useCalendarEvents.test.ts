import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// Mock supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Mock auth
const mockUser = { id: "user-1" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock role — default student
let mockIsTeacher = false;
vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({
    isTeacher: mockIsTeacher,
    isStudent: !mockIsTeacher,
    isAdmin: false,
    roles: [mockIsTeacher ? "teacher" : "student"],
    isLoading: false,
  }),
}));

import { useCalendarEvents } from "@/hooks/useCalendarEvents";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function setupChain(finalData: any[]) {
  const resolved = { data: finalData };
  const chain: any = {
    then: (fn: any) => Promise.resolve(resolved).then(fn),
  };
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  return chain;
}

describe("useCalendarEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTeacher = false;
  });

  it("returns empty events when user has no enrollments", async () => {
    const enrollmentChain = setupChain([]);
    mockFrom.mockReturnValue(enrollmentChain);

    const { result } = renderHook(
      () => useCalendarEvents(new Date("2026-04-01")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toEqual([]);
    expect(result.current.eventDates).toEqual([]);
  });

  it("fetches assignments and live classes for enrolled courses", async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") {
        return setupChain([{ course_id: "c1" }]);
      }
      if (table === "assignments") {
        return setupChain([
          {
            id: "a1",
            title: "HW 1",
            deadline: "2026-04-15T23:59:00Z",
            course_id: "c1",
            courses: { title: "Math 101" },
          },
        ]);
      }
      if (table === "live_classes") {
        return setupChain([
          {
            id: "lc1",
            title: "Lecture 1",
            start_time: "2026-04-16T10:00:00Z",
            end_time: "2026-04-16T11:00:00Z",
            course_id: "c1",
            meeting_url: "https://meet.example.com",
            courses: { title: "Math 101" },
          },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useCalendarEvents(new Date("2026-04-01")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.events.length).toBe(2));
    const assignment = result.current.events.find((e) => e.type === "assignment");
    const liveClass = result.current.events.find((e) => e.type === "live_class");

    expect(assignment).toBeDefined();
    expect(assignment!.title).toBe("HW 1");
    expect(assignment!.courseTitle).toBe("Math 101");

    expect(liveClass).toBeDefined();
    expect(liveClass!.title).toBe("Lecture 1");
    expect(liveClass!.meetingUrl).toBe("https://meet.example.com");
  });

  it("normalizes assignment events correctly", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") return setupChain([{ course_id: "c1" }]);
      if (table === "assignments") {
        return setupChain([
          {
            id: "a1",
            title: "Essay",
            deadline: "2026-04-20T17:00:00Z",
            course_id: "c1",
            courses: { title: "English" },
          },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useCalendarEvents(new Date("2026-04-01")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.events.length).toBe(1));
    const event = result.current.events[0];
    expect(event.type).toBe("assignment");
    expect(event.date).toBeInstanceOf(Date);
    expect(event.assignmentId).toBe("a1");
    expect(event.courseId).toBe("c1");
  });

  it("returns eventDates array for calendar highlighting", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") return setupChain([{ course_id: "c1" }]);
      if (table === "assignments") {
        return setupChain([
          { id: "a1", title: "HW", deadline: "2026-04-10T12:00:00Z", course_id: "c1", courses: { title: "C" } },
        ]);
      }
      if (table === "live_classes") {
        return setupChain([
          { id: "lc1", title: "L", start_time: "2026-04-10T14:00:00Z", course_id: "c1", meeting_url: null, end_time: null, courses: { title: "C" } },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useCalendarEvents(new Date("2026-04-01")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.eventDates.length).toBe(2));
    expect(result.current.eventDates[0]).toBeInstanceOf(Date);
  });

  it("teacher mode fetches own courses instead of enrollments", async () => {
    mockIsTeacher = true;

    mockFrom.mockImplementation((table: string) => {
      if (table === "courses") return setupChain([{ id: "c1" }]);
      if (table === "assignments") return setupChain([]);
      if (table === "live_classes") return setupChain([]);
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useCalendarEvents(new Date("2026-04-01")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFrom).toHaveBeenCalledWith("courses");
  });
});
