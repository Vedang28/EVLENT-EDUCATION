import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockChain = {
  focus: () => mockChain,
  toggleBold: () => mockChain,
  toggleItalic: () => mockChain,
  toggleStrike: () => mockChain,
  toggleHeading: () => mockChain,
  toggleBulletList: () => mockChain,
  toggleOrderedList: () => mockChain,
  toggleBlockquote: () => mockChain,
  toggleCodeBlock: () => mockChain,
  setLink: () => mockChain,
  unsetLink: () => mockChain,
  extendMarkRange: () => mockChain,
  setImage: () => mockChain,
  setHorizontalRule: () => mockChain,
  undo: () => mockChain,
  redo: () => mockChain,
  run: vi.fn(),
};

const mockEditor = {
  chain: () => mockChain,
  isActive: vi.fn().mockReturnValue(false),
  getAttributes: vi.fn().mockReturnValue({}),
  getHTML: vi.fn().mockReturnValue("<p>test</p>"),
  can: () => ({ undo: () => true, redo: () => true }),
};

vi.mock("@tiptap/react", () => ({
  useEditor: () => mockEditor,
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">{editor ? "Editor loaded" : null}</div>
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

import RichTextEditor from "@/components/RichTextEditor";

describe("RichTextEditor", () => {
  const onChange = vi.fn();

  it("renders editor with toolbar buttons", () => {
    render(<RichTextEditor content="" onChange={onChange} />);
    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Strikethrough")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Bullet List")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordered List")).toBeInTheDocument();
    expect(screen.getByLabelText("Blockquote")).toBeInTheDocument();
    expect(screen.getByLabelText("Code Block")).toBeInTheDocument();
    expect(screen.getByLabelText("Link")).toBeInTheDocument();
    expect(screen.getByLabelText("Image")).toBeInTheDocument();
  });

  it("renders editor content area", () => {
    render(<RichTextEditor content="<p>Hello</p>" onChange={onChange} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.getByText("Editor loaded")).toBeInTheDocument();
  });

  it("has undo and redo buttons", () => {
    render(<RichTextEditor content="" onChange={onChange} />);
    expect(screen.getByLabelText("Undo")).toBeInTheDocument();
    expect(screen.getByLabelText("Redo")).toBeInTheDocument();
  });

  it("bold button triggers chain command", () => {
    render(<RichTextEditor content="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Bold"));
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("opens link dialog when link button is clicked", () => {
    render(<RichTextEditor content="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Link"));
    expect(screen.getByText("Insert Link")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument();
  });

  it("opens image dialog when image button is clicked", () => {
    render(<RichTextEditor content="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Image"));
    expect(screen.getByRole("heading", { name: "Insert Image" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://example.com/image.png")).toBeInTheDocument();
  });
});
