import { auth } from "@/auth";
import { PipelineSchema, type Pipeline, type Lane } from "@/lib/types";
import { mockPipeline } from "@/lib/data/mock";
import { sharedLane as githubSharedLane, GitHubError } from "@/lib/data/github";

const REPO = process.env.TRACKED_REPO ?? "org/mobile-app";

export class PipelineAuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function iosLaneFallback(): Promise<Lane> {
  // Until the App Store Connect adapter is implemented, serve the iOS lane from
  // the mock so the UI still has something to render.
  const mock = await mockPipeline();
  return mock.lanes.find((l) => l.id === "ios") as Lane;
}

async function androidLaneFallback(): Promise<Lane> {
  const mock = await mockPipeline();
  return mock.lanes.find((l) => l.id === "android") as Lane;
}

async function livePipeline(): Promise<Pipeline> {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) {
    throw new PipelineAuthError(
      "No GitHub access token on the current session; sign in again.",
    );
  }
  const [shared, ios, android] = await Promise.all([
    githubSharedLane(token, REPO),
    iosLaneFallback(),
    androidLaneFallback(),
  ]);
  return {
    repo: REPO,
    generatedAt: new Date().toISOString(),
    lanes: [shared, ios, android],
  };
}

export async function getPipeline(): Promise<Pipeline> {
  const raw =
    process.env.DATA_SOURCE === "live" ? await livePipeline() : await mockPipeline();
  return PipelineSchema.parse(raw);
}

export { GitHubError };
