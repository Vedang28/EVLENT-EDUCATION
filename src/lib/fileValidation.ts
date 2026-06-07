export const ALLOWED_SUBMISSION_TYPES = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const ALLOWED_THUMBNAIL_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_SUBMISSION_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSubmissionFile(file: File): FileValidationResult {
  if (!ALLOWED_SUBMISSION_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: PDF, TXT, images (JPG/PNG/GIF), Word, PowerPoint.",
    };
  }
  if (file.size > MAX_SUBMISSION_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_SUBMISSION_SIZE / (1024 * 1024)}MB.`,
    };
  }
  return { valid: true };
}

export function validateThumbnailFile(file: File): FileValidationResult {
  if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: JPG, PNG, WebP.",
    };
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_THUMBNAIL_SIZE / (1024 * 1024)}MB.`,
    };
  }
  return { valid: true };
}

export function getFileIcon(filename: string): "file-text" | "image" | "file" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "doc" || ext === "docx" || ext === "txt" || ext === "ppt" || ext === "pptx") {
    return "file-text";
  }
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp") {
    return "image";
  }
  return "file";
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() ?? "FILE";
}
