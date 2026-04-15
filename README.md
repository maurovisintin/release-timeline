# Release Timeline

A small dashboard that visualizes the release pipeline for a single iOS + Android
mobile app as a swimlane / pipeline view. Each version (commit / build) appears
as a card flowing left → right through the stages so you can see at a glance
"where is everything right now".

```
Source       │ Open PR │ Merged │ Building
iOS          │ TestFlight │ App Store Review │ Production
Android      │ Internal testing │ Closed/Open testing │ Production
```

Stack: Next.js 15 (App Router) + TypeScript, Tailwind, Auth.js v5 (GitHub OAuth
restricted to a single org), SWR for revalidation. Designed to deploy on Vercel.

> v1 ships with **mock data** behind a clean adapter interface. The real GitHub
> / App Store Connect / Google Play integrations are stubbed out and clearly
> marked `TODO` in `src/lib/data/`.

## Local setup

```bash
pnpm install   # or npm install
cp .env.example .env.local
# fill in AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, ALLOWED_GITHUB_ORG, TRACKED_REPO
pnpm dev
```

Visit `http://localhost:3000`. You'll be redirected to `/signin`, then back to
the dashboard once you authenticate with a GitHub account that belongs to
`ALLOWED_GITHUB_ORG`.

### Creating the GitHub OAuth App

1. Go to https://github.com/settings/developers → **New OAuth App**.
2. Homepage URL: your deployment URL (e.g. `https://release-timeline.vercel.app`).
3. Authorization callback URL:
   `https://<your-domain>/api/auth/callback/github`
   (For local dev also create one for `http://localhost:3000/api/auth/callback/github`.)
4. Copy the client id + secret into `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.
5. Generate `AUTH_SECRET` with `openssl rand -base64 32`.

The OAuth scope `read:org` is requested so the app can verify the signed-in
user is a member of `ALLOWED_GITHUB_ORG`. Users who aren't members land on
`/unauthorized`.

## Deploy on Vercel

1. `vercel link` (or import the repo from the Vercel dashboard).
2. Set the same env vars from `.env.example` in the Vercel project settings.
3. Deploy.

## Switching from mock to live data

The data layer is split behind interfaces in `src/lib/data/`:

- `mock.ts` — current implementation, deterministic seeded data.
- `github.ts` — TODO: fetch open PRs, recent main commits, in-flight workflow runs.
- `appstore.ts` — TODO: fetch TestFlight builds + App Store version states from
  App Store Connect.
- `googleplay.ts` — TODO: fetch Play Console tracks + rollout fractions.

Set `DATA_SOURCE=live` and implement the three adapters; `getPipeline()` in
`src/lib/data/index.ts` is the single composition point.

## Project layout

```
middleware.ts                        # auth gate
src/auth.ts                          # Auth.js v5 + GitHub + org check
src/app/page.tsx                     # server component, fetches initial pipeline
src/app/api/pipeline/route.ts        # JSON endpoint for SWR revalidation
src/app/api/auth/[...nextauth]/route.ts
src/app/signin/                      # custom sign-in page
src/app/unauthorized/                # shown to non-org members
src/components/                      # Pipeline, Lane, StageColumn, VersionCard, Header
src/lib/types.ts                     # Zod schemas
src/lib/data/                        # mock + stub adapters
```
