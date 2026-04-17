import { auth } from "@/auth";
import { getPipeline, GitHubError, PipelineAuthError } from "@/lib/data";
import { Header } from "@/components/Header";
import { Pipeline } from "@/components/Pipeline";
import type { Pipeline as PipelineT } from "@/lib/types";

export const dynamic = "force-dynamic";

const REPO = process.env.TRACKED_REPO ?? "org/mobile-app";

function emptyPipeline(): PipelineT {
  return {
    repo: REPO,
    generatedAt: new Date().toISOString(),
    lanes: [
      { id: "shared", label: "Source", stages: [
        { id: "pr", label: "Open PR", cards: [] },
        { id: "merged", label: "Merged", cards: [] },
        { id: "building", label: "Building", cards: [] },
      ] },
      { id: "ios", label: "iOS", stages: [
        { id: "testflight", label: "TestFlight", cards: [] },
        { id: "review", label: "App Store Review", cards: [] },
        { id: "prod", label: "Production", cards: [] },
      ] },
      { id: "android", label: "Android", stages: [
        { id: "internal", label: "Internal testing", cards: [] },
        { id: "closed", label: "Closed/Open testing", cards: [] },
        { id: "prod", label: "Production", cards: [] },
      ] },
    ],
  };
}

export default async function Home() {
  const session = await auth();
  let pipeline: PipelineT;
  let error: string | null = null;
  try {
    pipeline = await getPipeline();
  } catch (err) {
    if (err instanceof PipelineAuthError) {
      error = "Your session is missing a GitHub access token. Sign out and back in.";
    } else if (err instanceof GitHubError) {
      error =
        err.status === 404
          ? `GitHub 404 for ${REPO}. Check TRACKED_REPO and that your account has access.`
          : `GitHub returned ${err.status}. ${err.message}`;
    } else {
      console.error("SSR getPipeline failed:", err);
      error = "Failed to load pipeline. See server logs.";
    }
    pipeline = emptyPipeline();
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header login={session?.login} repo={pipeline.repo} />
      {error && (
        <div className="border-b border-red-900/60 bg-red-950/40 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}
      <div className="flex-1 p-4">
        <Pipeline fallback={pipeline} />
      </div>
    </main>
  );
}
