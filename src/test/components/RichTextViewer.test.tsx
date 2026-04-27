import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@tiptap/react", () => ({
  useEditor: () => ({ isEditable: false }),
  EditorContent: ({ editor }: any) => (
    <div data-testid="viewer-content">{editor ? "Viewer loaded" : null}</div>
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({ default: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-link", () => ({ default: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-image", () => ({ default: {} }));
vi.mock("@tiptap/extension-code-block-lowlight", () => ({ default: { configure: () => ({}) } }));
vi.mock("lowlight", () => ({
  common: {},
  createLowlight: () => ({}),
}));

import RichTextViewer from "@/components/RichTextViewer";

describe("RichTextViewer", () => {
  it("renders viewer content", () => {
    render(<RichTextViewer content="<p>Hello world</p>" />);
    expect(screen.getByTestId("viewer-content")).toBeInTheDocument();
    expect(screen.getByText("Viewer loaded")).toBeInTheDocument();
  });

  it("renders without toolbar buttons", () => {
    render(<RichTextViewer content="<p>Read only</p>" />);
    expect(screen.queryByLabelText("Bold")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Italic")).not.toBeInTheDocument();
  });

  it("renders with empty content", () => {
    render(<RichTextViewer content="" />);
    expect(screen.getByTestId("viewer-content")).toBeInTheDocument();
  });
});
