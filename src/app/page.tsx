import { auth } from "@/auth";
import { getPipeline } from "@/lib/data";
import { Header } from "@/components/Header";
import { Pipeline } from "@/components/Pipeline";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const pipeline = await getPipeline();

  return (
    <main className="flex min-h-screen flex-col">
      <Header login={session?.login} repo={pipeline.repo} />
      <div className="flex-1 p-4">
        <Pipeline fallback={pipeline} />
      </div>
    </main>
  );
}
