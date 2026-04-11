import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// Mock supabase
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

const mockUser = { id: "user-1" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

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

import { useTimetableClasses } from "@/hooks/useTimetableClasses";

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

describe("useTimetableClasses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTeacher = false;
  });

  it("returns empty classes when no enrollments", async () => {
    mockFrom.mockReturnValue(setupChain([]));

    const { result } = renderHook(
      () => useTimetableClasses(new Date("2026-04-07")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.classes).toEqual([]);
    expect(result.current.courses).toEqual([]);
  });

  it("fetches live classes for selected week", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") return setupChain([{ course_id: "c1" }]);
      if (table === "live_classes") {
        return setupChain([
          {
            id: "lc1",
            title: "Lecture",
            start_time: "2026-04-09T10:00:00Z", // Wednesday
            end_time: "2026-04-09T11:00:00Z",
            course_id: "c1",
            meeting_url: "https://meet.example.com",
            courses: { id: "c1", title: "Physics" },
          },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useTimetableClasses(new Date("2026-04-07")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.classes.length).toBe(1));
    expect(result.current.classes[0].title).toBe("Lecture");
    expect(result.current.classes[0].courseTitle).toBe("Physics");
  });

  it("computes dayOfWeek and startHour correctly", async () => {
    // Wednesday 2026-04-09 at 10:00 UTC
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") return setupChain([{ course_id: "c1" }]);
      if (table === "live_classes") {
        return setupChain([
          {
            id: "lc1",
            title: "L",
            start_time: "2026-04-09T10:00:00Z",
            end_time: null,
            course_id: "c1",
            meeting_url: null,
            courses: { id: "c1", title: "C" },
          },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useTimetableClasses(new Date("2026-04-07")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.classes.length).toBe(1));
    const cls = result.current.classes[0];
    // Thursday = dayOfWeek 3 (0=Mon, 1=Tue, 2=Wed, 3=Thu)
    expect(cls.dayOfWeek).toBe(3);
    expect(cls.startTime).toBeInstanceOf(Date);
  });

  it("extracts unique courses for filter dropdown", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") return setupChain([{ course_id: "c1" }]);
      if (table === "live_classes") {
        return setupChain([
          { id: "lc1", title: "L1", start_time: "2026-04-09T10:00:00Z", end_time: null, course_id: "c1", meeting_url: null, courses: { id: "c1", title: "Physics" } },
          { id: "lc2", title: "L2", start_time: "2026-04-10T10:00:00Z", end_time: null, course_id: "c1", meeting_url: null, courses: { id: "c1", title: "Physics" } },
        ]);
      }
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useTimetableClasses(new Date("2026-04-07")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.classes.length).toBe(2));
    // Same course used twice → only 1 entry in courses list
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses[0].title).toBe("Physics");
  });

  it("teacher mode uses teacher_id filter", async () => {
    mockIsTeacher = true;

    mockFrom.mockImplementation((table: string) => {
      if (table === "courses") return setupChain([{ id: "c1" }]);
      if (table === "live_classes") return setupChain([]);
      return setupChain([]);
    });

    const { result } = renderHook(
      () => useTimetableClasses(new Date("2026-04-07")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFrom).toHaveBeenCalledWith("courses");
  });
});
