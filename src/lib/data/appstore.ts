import type { Lane } from "@/lib/types";

// TODO: wire App Store Connect API — TestFlight builds (internal+external),
// app store version states (PREPARE_FOR_SUBMISSION, WAITING_FOR_REVIEW,
// IN_REVIEW, READY_FOR_SALE, etc.) for the iOS app.
export async function appStoreLane(): Promise<Lane> {
  throw new Error("App Store Connect adapter not implemented yet (DATA_SOURCE=mock).");
}
