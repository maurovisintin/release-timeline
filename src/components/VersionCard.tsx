import type { Card, Lane } from "@/lib/types";
import { ExternalLink } from "lucide-react";

const LANE_ACCENT: Record<Lane["id"], string> = {
  shared: "border-l-sky-500/70",
  ios: "border-l-violet-500/70",
  android: "border-l-emerald-500/70",
};

const STALE_HOURS = 14 * 24;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function isStale(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > STALE_HOURS * 3_600_000;
}

export function VersionCard({ card, laneId }: { card: Card; laneId: Lane["id"] }) {
  const stale = isStale(card.updatedAt);
  const links = Object.entries(card.links ?? {});
  return (
    <div
      className={[
        "rounded-md bg-zinc-900/70 border border-zinc-800 border-l-4 p-2.5 text-xs",
        LANE_ACCENT[laneId],
        stale ? "ring-1 ring-amber-600/40" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-zinc-400">{card.sha.slice(0, 7)}</span>
        <span className="text-[11px] text-zinc-500">{relativeTime(card.updatedAt)}</span>
      </div>
      {card.version !== "—" && (
        <div className="mt-1 font-mono text-[11px] text-zinc-300">{card.version}</div>
      )}
      <div className="mt-1 text-zinc-100 leading-snug line-clamp-2">{card.title}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">@{card.author}</span>
        {links.length > 0 && (
          <div className="flex gap-1.5">
            {links.map(([key, href]) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                title={key}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
