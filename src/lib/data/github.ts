import type { Card, Lane } from "@/lib/types";

const RELEASE_BRANCH = process.env.RELEASE_BRANCH ?? "main";
const API = "https://api.github.com";

type GhPR = {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  head: { sha: string };
  user: { login: string } | null;
  draft: boolean;
};

type GhCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
    committer: { name: string; date: string } | null;
  };
  author: { login: string } | null;
};

type GhWorkflowRun = {
  id: number;
  head_sha: string;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: string | null;
  html_url: string;
  updated_at: string;
};

export class GitHubError extends Error {
  constructor(
    public status: number,
    public url: string,
    message: string,
  ) {
    super(`GitHub ${status} on ${url}: ${message}`);
  }
}

async function gh<T>(token: string, path: string): Promise<T> {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "release-timeline",
    },
    // Always hit the network; upstream /api/pipeline is `force-dynamic` anyway.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubError(res.status, path, body.slice(0, 200));
  }
  return (await res.json()) as T;
}

function shortTitle(message: string): string {
  return message.split("\n", 1)[0];
}

function prCard(pr: GhPR): Card {
  return {
    sha: pr.head.sha,
    version: pr.draft ? "draft" : "—",
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    updatedAt: pr.updated_at,
    links: { pr: pr.html_url },
  };
}

function commitCard(c: GhCommit, extraLinks: Record<string, string> = {}): Card {
  const when =
    c.commit.committer?.date ?? c.commit.author?.date ?? new Date().toISOString();
  return {
    sha: c.sha,
    version: "—",
    title: shortTitle(c.commit.message),
    author: c.author?.login ?? c.commit.author?.name ?? "unknown",
    updatedAt: when,
    links: { commit: c.html_url, ...extraLinks },
  };
}

/**
 * Build the "Source" lane (Open PR / Merged / Building) for the tracked repo
 * from the GitHub API. `token` is the viewer's OAuth access token.
 */
export async function sharedLane(token: string, repo: string): Promise<Lane> {
  const encodedBranch = encodeURIComponent(RELEASE_BRANCH);

  const [prs, commits, runsResp] = await Promise.all([
    gh<GhPR[]>(
      token,
      `/repos/${repo}/pulls?state=open&base=${encodedBranch}&sort=updated&direction=desc&per_page=30`,
    ),
    gh<GhCommit[]>(token, `/repos/${repo}/commits?sha=${encodedBranch}&per_page=20`),
    gh<{ workflow_runs: GhWorkflowRun[] }>(
      token,
      `/repos/${repo}/actions/runs?branch=${encodedBranch}&per_page=50`,
    ),
  ]);

  const runs = runsResp.workflow_runs;
  const activeRunBySha = new Map<string, GhWorkflowRun>();
  for (const r of runs) {
    if (r.status !== "completed" && !activeRunBySha.has(r.head_sha)) {
      activeRunBySha.set(r.head_sha, r);
    }
  }

  // PR stage: open PRs targeting the release branch.
  const prStage = prs.map(prCard);

  // Split recent main commits into "Building" (has an active workflow run) and
  // "Merged" (everything else). Cap each list so the UI stays tidy.
  const building: Card[] = [];
  const merged: Card[] = [];
  for (const c of commits) {
    const activeRun = activeRunBySha.get(c.sha);
    if (activeRun) {
      building.push(commitCard(c, { build: activeRun.html_url }));
    } else {
      merged.push(commitCard(c));
    }
  }

  return {
    id: "shared",
    label: "Source",
    stages: [
      { id: "pr", label: "Open PR", cards: prStage },
      { id: "merged", label: "Merged", cards: merged.slice(0, 10) },
      { id: "building", label: "Building", cards: building.slice(0, 10) },
    ],
  };
}
