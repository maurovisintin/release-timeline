import type { Lane } from "@/lib/types";

// TODO: wire Google Play Developer API — internal, closed, open, and
// production tracks plus rollout fractions for the Android app.
export async function googlePlayLane(): Promise<Lane> {
  throw new Error("Google Play adapter not implemented yet (DATA_SOURCE=mock).");
}
