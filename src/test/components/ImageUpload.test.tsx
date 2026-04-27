import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/img.jpg" } }),
      }),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import ImageUpload from "@/components/ImageUpload";

describe("ImageUpload", () => {
  const onChange = vi.fn();

  it("renders upload zone when no value", () => {
    render(<ImageUpload value={null} onChange={onChange} bucket="test" folder="f" />);
    expect(screen.getByText("Click or drag to upload")).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG, or WebP (max 2MB)")).toBeInTheDocument();
  });

  it("renders preview image when value is set", () => {
    render(<ImageUpload value="https://example.com/photo.jpg" onChange={onChange} bucket="test" folder="f" />);
    const img = screen.getByAltText("Thumbnail preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("shows remove button when value is set", () => {
    render(<ImageUpload value="https://example.com/photo.jpg" onChange={onChange} bucket="test" folder="f" />);
    const removeBtn = screen.getByRole("button");
    expect(removeBtn).toBeInTheDocument();
  });

  it("calls onChange with null when remove is clicked", () => {
    render(<ImageUpload value="https://example.com/photo.jpg" onChange={onChange} bucket="test" folder="f" />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("has hidden file input with correct accept attribute", () => {
    render(<ImageUpload value={null} onChange={onChange} bucket="test" folder="f" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe("image/jpeg,image/png,image/webp");
    expect(input.className).toContain("hidden");
  });
});
