import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function Header({ login, repo }: { login?: string; repo: string }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
          Release Timeline
        </h1>
        <span className="font-mono text-[11px] text-zinc-500">{repo}</span>
      </div>
      <div className="flex items-center gap-3 text-[12px]">
        {login && <span className="text-zinc-400">@{login}</span>}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/signin" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
          >
            <LogOut size={12} /> sign out
          </button>
        </form>
      </div>
    </header>
  );
}
