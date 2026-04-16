import { z } from "zod";

export const CardSchema = z.object({
  sha: z.string(),
  version: z.string(),
  title: z.string(),
  author: z.string(),
  updatedAt: z.string(), // ISO string
  links: z.record(z.string()).optional(),
});

export const StageSchema = z.object({
  id: z.string(),
  label: z.string(),
  cards: z.array(CardSchema),
});

export const LaneSchema = z.object({
  id: z.enum(["shared", "ios", "android"]),
  label: z.string(),
  stages: z.array(StageSchema),
});

export const PipelineSchema = z.object({
  repo: z.string(),
  generatedAt: z.string(),
  lanes: z.array(LaneSchema),
});

export type Card = z.infer<typeof CardSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type Lane = z.infer<typeof LaneSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;
