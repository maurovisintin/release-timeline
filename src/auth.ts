import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ALLOWED_ORG = process.env.ALLOWED_GITHUB_ORG ?? "";

declare module "next-auth" {
  interface Session {
    login?: string;
    // NOTE: the viewer's GitHub OAuth access token is exposed on the session so
    // server components can call the GitHub API as the signed-in user. It is
    // THE VIEWER'S OWN TOKEN, scoped to read:org + repo + user:email. Sessions
    // are httpOnly cookies so it isn't reachable from the browser, but a server
    // component or route handler rendering for this user can read it here.
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // `repo` is the classic OAuth scope that grants read access to private
      // repositories (needed to list PRs, commits, and workflow runs on the
      // tracked mobile-app repo if it's private).
      authorization: { params: { scope: "read:org read:user user:email repo" } },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/unauthorized",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github") return false;
      if (!ALLOWED_ORG) {
        // Fail closed — refuse sign-in until the deployer configures the org.
        console.error("ALLOWED_GITHUB_ORG is not set; refusing sign-in.");
        return false;
      }
      const token = account.access_token;
      if (!token) return false;
      try {
        const res = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "release-timeline",
          },
        });
        if (!res.ok) {
          console.error("GitHub /user/orgs failed:", res.status);
          return false;
        }
        const orgs = (await res.json()) as Array<{ login: string }>;
        const allowed = orgs.some(
          (o) => o.login.toLowerCase() === ALLOWED_ORG.toLowerCase(),
        );
        if (!allowed) return "/unauthorized";
        (profile as { login?: string } | undefined) &&
          ((profile as { login?: string }).login =
            (profile as { login?: string }).login ?? undefined);
        return true;
      } catch (err) {
        console.error("Org check threw:", err);
        return false;
      }
    },
    async jwt({ token, profile, account }) {
      if (profile && typeof (profile as { login?: unknown }).login === "string") {
        (token as { login?: string }).login = (profile as { login: string }).login;
      }
      // Persist the GitHub OAuth access token on first sign-in. GitHub OAuth
      // tokens don't currently expire, so we only write it when `account` is
      // present (i.e. on the initial sign-in callback).
      if (account?.access_token) {
        (token as { accessToken?: string }).accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      const login = (token as { login?: string }).login;
      if (login) session.login = login;
      const accessToken = (token as { accessToken?: string }).accessToken;
      if (accessToken) session.accessToken = accessToken;
      return session;
    },
  },
});
