import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const profileNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().max(50000, "Content too long").optional(),
  video_url: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https:\/\//, "Must be an HTTPS URL")
    .optional()
    .or(z.literal("")),
});

export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  deadline: z.string().optional(),
  max_score: z.number().int().min(1, "Must be at least 1").max(10000, "Score too high"),
});

export const liveClassSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  meeting_url: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https?:\/\//, "Must be an HTTP or HTTPS URL")
    .optional()
    .or(z.literal("")),
  start_time: z.string().min(1, "Start time is required"),
});

export const submissionSchema = z.object({
  text_response: z.string().max(50000, "Response too long").optional(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  time_limit: z.number().int().min(1).max(300).nullable().optional(),
  attempt_limit: z.number().int().min(1, "At least 1 attempt").max(100).optional(),
  randomize: z.boolean().optional(),
  show_answers: z.boolean().optional(),
});

export const quizQuestionSchema = z.object({
  type: z.enum(["mcq", "true_false", "fill_blank"]),
  question_text: z.string().min(1, "Question is required").max(5000),
  options: z.array(z.string().min(1)).min(2).max(10).nullable(),
  correct_answer: z.union([z.number(), z.boolean(), z.string()]),
  points: z.number().int().min(1).max(100).optional(),
});
