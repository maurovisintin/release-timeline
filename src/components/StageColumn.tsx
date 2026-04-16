import type { Lane, Stage } from "@/lib/types";
import { VersionCard } from "@/components/VersionCard";

export function StageColumn({ stage, laneId }: { stage: Stage; laneId: Lane["id"] }) {
  return (
    <div className="flex min-w-0 flex-col rounded-md bg-zinc-950/40 border border-zinc-900 p-2">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          {stage.label}
        </h3>
        <span className="text-[11px] text-zinc-600">{stage.cards.length}</span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[60vh]">
        {stage.cards.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-800 p-3 text-center text-[11px] text-zinc-600">
            empty
          </div>
        ) : (
          stage.cards.map((c) => <VersionCard key={`${c.sha}-${stage.id}`} card={c} laneId={laneId} />)
        )}
      </div>
    </div>
  );
}
