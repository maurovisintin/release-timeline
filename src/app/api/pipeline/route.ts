import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPipeline, GitHubError, PipelineAuthError } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const pipeline = await getPipeline();
    return NextResponse.json(pipeline);
  } catch (err) {
    if (err instanceof PipelineAuthError) {
      return NextResponse.json({ error: "reauth_required", message: err.message }, { status: 401 });
    }
    if (err instanceof GitHubError) {
      const status = err.status === 404 ? 404 : 502;
      return NextResponse.json(
        { error: "github", status: err.status, message: err.message },
        { status },
      );
    }
    console.error("getPipeline failed:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
