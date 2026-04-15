import type { Lane as LaneT } from "@/lib/types";
import { StageColumn } from "@/components/StageColumn";

const LANE_BADGE: Record<LaneT["id"], string> = {
  shared: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  ios: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  android: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function Lane({ lane }: { lane: LaneT }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${LANE_BADGE[lane.id]}`}
        >
          {lane.label}
        </span>
        <div className="h-px flex-1 bg-zinc-900" />
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${lane.stages.length}, minmax(180px, 1fr))` }}
      >
        {lane.stages.map((s) => (
          <StageColumn key={s.id} stage={s} laneId={lane.id} />
        ))}
      </div>
    </section>
  );
}
