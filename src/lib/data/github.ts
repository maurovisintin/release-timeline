import type { Pipeline } from "@/lib/types";

// TODO: wire GitHub REST/GraphQL — open PRs to the release branch, recent
// commits on main, and in-flight workflow runs for the configured TRACKED_REPO.
export async function githubStages(): Promise<Partial<Pipeline>> {
  throw new Error("GitHub adapter not implemented yet (DATA_SOURCE=mock).");
}
