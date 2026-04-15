import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-zinc-900 bg-zinc-950/60 p-6 text-center">
        <h1 className="text-base font-semibold text-zinc-100">Not authorized</h1>
        <p className="mt-2 text-xs text-zinc-500">
          Your GitHub account isn&apos;t a member of the org allowed to view this page.
        </p>
        <Link
          href="/signin"
          className="mt-4 inline-block rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Try a different account
        </Link>
      </div>
    </main>
  );
}
