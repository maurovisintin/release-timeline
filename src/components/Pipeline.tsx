"use client";

import useSWR from "swr";
import type { Pipeline as PipelineT } from "@/lib/types";
import { Lane } from "@/components/Lane";

const fetcher = async (url: string): Promise<PipelineT> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`pipeline fetch ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as PipelineT;
};

export function Pipeline({ fallback }: { fallback: PipelineT }) {
  const { data, error, isValidating } = useSWR<PipelineT>("/api/pipeline", fetcher, {
    fallbackData: fallback,
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  // Guard against a malformed response shape — fall back to the server-rendered
  // pipeline rather than crashing on `lanes.map`.
  const pipeline: PipelineT =
    data && Array.isArray((data as PipelineT).lanes) ? data : fallback;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          repo: <span className="font-mono text-zinc-300">{pipeline.repo}</span>
        </span>
        <span>
          {error ? (
            <span className="text-red-400">refresh failed</span>
          ) : isValidating ? (
            <span>refreshing…</span>
          ) : (
            <>updated {new Date(pipeline.generatedAt).toLocaleTimeString()}</>
          )}
        </span>
      </div>
      {pipeline.lanes.map((lane) => (
        <Lane key={lane.id} lane={lane} />
      ))}
    </div>
  );
}
