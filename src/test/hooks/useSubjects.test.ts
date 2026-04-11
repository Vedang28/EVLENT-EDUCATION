import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { useSubjects } from "@/hooks/useSubjects";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function setupChain(finalData: any[]) {
  const resolved = { data: finalData, error: null };
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (cb: any) => cb(resolved),
  };
  mockFrom.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSubjects", () => {
  it("returns empty array when no subjects exist", async () => {
    setupChain([]);
    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches and returns subjects ordered by name", async () => {
    const subjects = [
      { id: "1", name: "Art", description: null, icon: "palette", created_at: "2026-01-01" },
      { id: "2", name: "Biology", description: "Life sciences", icon: "leaf", created_at: "2026-01-01" },
      { id: "3", name: "Mathematics", description: "Numbers", icon: "calculator", created_at: "2026-01-01" },
    ];
    const chain = setupChain(subjects);
    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("subjects");
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(chain.order).toHaveBeenCalledWith("name");
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].name).toBe("Art");
  });

  it("throws on supabase error", async () => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: null, error: new Error("DB error") }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("DB error");
  });
});
