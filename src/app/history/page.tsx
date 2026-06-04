import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import HistoryTable from "./HistoryTable";

export default async function HistoryPage() {
  // Fetch all documents, ordered by newest first (Server-side)
  const allDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.uploadDate)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Upload History</h2>
      </div>

      <HistoryTable initialDocs={allDocs} />
    </div>
  );
}
