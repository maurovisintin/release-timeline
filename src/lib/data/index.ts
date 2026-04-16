import { PipelineSchema, type Pipeline } from "@/lib/types";
import { mockPipeline } from "@/lib/data/mock";
import { githubStages } from "@/lib/data/github";
import { appStoreLane } from "@/lib/data/appstore";
import { googlePlayLane } from "@/lib/data/googleplay";

async function livePipeline(): Promise<Pipeline> {
  // Stub: assemble from real adapters once they're implemented.
  const [shared, ios, android] = await Promise.all([
    githubStages(),
    appStoreLane(),
    googlePlayLane(),
  ]);
  void shared;
  void ios;
  void android;
  throw new Error("Live data source not implemented yet — set DATA_SOURCE=mock.");
}

export async function getPipeline(): Promise<Pipeline> {
  const raw =
    process.env.DATA_SOURCE === "live" ? await livePipeline() : await mockPipeline();
  return PipelineSchema.parse(raw);
}
