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

import AdminSubjects from "@/pages/admin/AdminSubjects";

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
        <AdminSubjects />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminSubjects Page", () => {
  it("renders the page title and add button", async () => {
    setupChain([
      { id: "1", name: "Mathematics", description: "Numbers", icon: "calculator", created_at: "2026-01-01" },
    ]);
    renderPage();
    expect(screen.getByText("Subjects")).toBeInTheDocument();
    expect(screen.getByText("Add Subject")).toBeInTheDocument();
  });

  it("displays subjects in the table", async () => {
    setupChain([
      { id: "1", name: "Mathematics", description: "Numbers", icon: "calculator", created_at: "2026-01-01" },
      { id: "2", name: "Physics", description: "Forces", icon: "atom", created_at: "2026-01-01" },
    ]);
    renderPage();
    expect(await screen.findByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Numbers")).toBeInTheDocument();
  });

  it("shows empty state when no subjects", async () => {
    setupChain([]);
    renderPage();
    expect(await screen.findByText(/No subjects yet/)).toBeInTheDocument();
  });

  it("renders table headers correctly", async () => {
    setupChain([]);
    renderPage();
    expect(await screen.findByText(/No subjects yet/)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Description" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Icon" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
  });
});
