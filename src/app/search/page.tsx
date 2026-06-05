import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import SearchTable from "./SearchTable";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const allDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.uploadDate)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Search Database</h2>
        <p className="text-zinc-400">Search across all extracted individual operational records.</p>
      </div>

      <SearchTable initialDocs={allDocs} />
    </div>
  );
}
