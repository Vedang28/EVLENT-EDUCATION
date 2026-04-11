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

import { useGradeLevels } from "@/hooks/useGradeLevels";

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

describe("useGradeLevels", () => {
  it("returns empty array when no grade levels exist", async () => {
    setupChain([]);
    const { result } = renderHook(() => useGradeLevels(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches grade levels ordered by position", async () => {
    const grades = [
      { id: "1", name: "KG", position: 0, created_at: "2026-01-01" },
      { id: "2", name: "Class 1", position: 1, created_at: "2026-01-01" },
      { id: "3", name: "Class 2", position: 2, created_at: "2026-01-01" },
    ];
    const chain = setupChain(grades);
    const { result } = renderHook(() => useGradeLevels(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("grade_levels");
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(chain.order).toHaveBeenCalledWith("position");
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].name).toBe("KG");
    expect(result.current.data![2].position).toBe(2);
  });

  it("throws on supabase error", async () => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (cb: any) => cb({ data: null, error: new Error("DB error") }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useGradeLevels(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("DB error");
  });
});
