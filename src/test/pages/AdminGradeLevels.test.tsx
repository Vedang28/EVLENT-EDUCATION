import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// Mock supabase
const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "admin-1" } }),
}));

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({
    isTeacher: false,
    isStudent: false,
    isAdmin: true,
    roles: ["admin"],
    isLoading: false,
  }),
}));

import AdminGradeLevels from "@/pages/admin/AdminGradeLevels";

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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminGradeLevels />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminGradeLevels Page", () => {
  it("renders the page title and add button", async () => {
    setupChain([
      { id: "1", name: "KG", position: 0, created_at: "2026-01-01" },
    ]);
    renderPage();
    expect(screen.getByText("Grade Levels")).toBeInTheDocument();
    expect(screen.getByText("Add Grade Level")).toBeInTheDocument();
  });

  it("displays grade levels in the table", async () => {
    setupChain([
      { id: "1", name: "KG", position: 0, created_at: "2026-01-01" },
      { id: "2", name: "Class 1", position: 1, created_at: "2026-01-01" },
      { id: "3", name: "Class 2", position: 2, created_at: "2026-01-01" },
    ]);
    renderPage();
    expect(await screen.findByText("KG")).toBeInTheDocument();
    expect(screen.getByText("Class 1")).toBeInTheDocument();
    expect(screen.getByText("Class 2")).toBeInTheDocument();
  });

  it("shows empty state when no grade levels", async () => {
    setupChain([]);
    renderPage();
    expect(await screen.findByText(/No grade levels yet/)).toBeInTheDocument();
  });

  it("renders table headers correctly", async () => {
    setupChain([]);
    renderPage();
    expect(await screen.findByText(/No grade levels yet/)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Position" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
  });

  it("shows position numbers for each grade", async () => {
    setupChain([
      { id: "1", name: "KG", position: 0, created_at: "2026-01-01" },
      { id: "2", name: "Class 1", position: 1, created_at: "2026-01-01" },
    ]);
    renderPage();
    expect(await screen.findByText("0")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
