import type { Pipeline, Card } from "@/lib/types";

const REPO = process.env.TRACKED_REPO ?? "org/mobile-app";

// Build a deterministic-ish pipeline that always looks fresh by anchoring
// timestamps to "now". Authors/titles/shas are seeded so card identities stay
// stable across requests (so SWR re-renders are gentle).
function ago(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function repoLink(path: string): string {
  return `https://github.com/${REPO}/${path}`;
}

function card(
  sha: string,
  version: string,
  title: string,
  author: string,
  hoursAgo: number,
  links: Record<string, string> = {},
): Card {
  return { sha, version, title, author, updatedAt: ago(hoursAgo), links };
}

export async function mockPipeline(): Promise<Pipeline> {
  return {
    repo: REPO,
    generatedAt: new Date().toISOString(),
    lanes: [
      {
        id: "shared",
        label: "Source",
        stages: [
          {
            id: "pr",
            label: "Open PR",
            cards: [
              card("a1b2c3d", "—", "feat(login): biometric unlock", "alice", 2, {
                pr: repoLink("pull/812"),
              }),
              card("e4f5g6h", "—", "fix(cart): rounding off-by-one", "bob", 6, {
                pr: repoLink("pull/811"),
              }),
              card("i7j8k9l", "—", "chore: bump RN to 0.76", "carol", 26, {
                pr: repoLink("pull/809"),
              }),
            ],
          },
          {
            id: "merged",
            label: "Merged",
            cards: [
              card("m0n1o2p", "2.14.0 (1424)", "feat(home): new hero carousel", "dave", 1, {
                commit: repoLink("commit/m0n1o2p"),
              }),
            ],
          },
          {
            id: "building",
            label: "Building",
            cards: [
              card("q3r4s5t", "2.14.0 (1423)", "release: 2.14.0 candidate", "ci-bot", 0.3, {
                build: repoLink("actions/runs/9912345678"),
              }),
            ],
          },
        ],
      },
      {
        id: "ios",
        label: "iOS",
        stages: [
          {
            id: "testflight",
            label: "TestFlight",
            cards: [
              card("u6v7w8x", "2.14.0 (1422)", "TestFlight build (internal)", "ci-bot", 5, {
                testflight: "https://appstoreconnect.apple.com/apps/123/testflight",
              }),
              card("y9z0a1b", "2.13.1 (1418)", "Hotfix candidate", "ci-bot", 30),
            ],
          },
          {
            id: "review",
            label: "App Store Review",
            cards: [
              card("c2d3e4f", "2.13.0 (1410)", "2.13.0 — submitted for review", "release-mgr", 18, {
                review: "https://appstoreconnect.apple.com/apps/123/appstore",
              }),
            ],
          },
          {
            id: "prod",
            label: "Production",
            cards: [
              card("g5h6i7j", "2.12.2 (1402)", "Live on App Store", "release-mgr", 96, {
                store: "https://apps.apple.com/app/id123",
              }),
            ],
          },
        ],
      },
      {
        id: "android",
        label: "Android",
        stages: [
          {
            id: "internal",
            label: "Internal testing",
            cards: [
              card("k8l9m0n", "2.14.0 (1422)", "Internal testing build", "ci-bot", 5, {
                play: "https://play.google.com/console/.../tracks/internal",
              }),
            ],
          },
          {
            id: "closed",
            label: "Closed/Open testing",
            cards: [
              card("o1p2q3r", "2.13.0 (1410)", "Open testing rollout 20%", "release-mgr", 36, {
                play: "https://play.google.com/console/.../tracks/open",
              }),
            ],
          },
          {
            id: "prod",
            label: "Production",
            cards: [
              card("s4t5u6v", "2.12.2 (1402)", "Live on Play Store (100%)", "release-mgr", 120, {
                store: "https://play.google.com/store/apps/details?id=com.example.app",
              }),
            ],
          },
        ],
      },
    ],
  };
}
