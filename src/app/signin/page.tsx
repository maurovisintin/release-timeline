import { signIn } from "@/auth";
import { Github } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-zinc-900 bg-zinc-950/60 p-6">
        <h1 className="text-base font-semibold text-zinc-100">Release Timeline</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Sign in with GitHub. Only members of the configured org may continue.
        </p>
        <form
          action={async () => {
            "use server";
            const params = await searchParams;
            await signIn("github", { redirectTo: params?.callbackUrl ?? "/" });
          }}
          className="mt-5"
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
          >
            <Github size={14} /> Sign in with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
