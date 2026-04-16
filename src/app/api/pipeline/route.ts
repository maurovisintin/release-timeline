import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPipeline } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pipeline = await getPipeline();
  return NextResponse.json(pipeline);
}
