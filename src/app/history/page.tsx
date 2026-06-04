import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import HistoryTable from "./HistoryTable";

export default async function HistoryPage() {
  // Fetch all documents, ordered by newest first (Server-side)
  const allDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.uploadDate)],
  });

  // Group by fileName so the history page shows 1 row per image
  const groupedDocs = new Map();
  for (const doc of allDocs) {
    if (!groupedDocs.has(doc.fileName)) {
      groupedDocs.set(doc.fileName, doc);
    } else {
      // If any document in the batch is PENDING, the whole batch is PENDING
      if (doc.status === "PENDING") {
        groupedDocs.get(doc.fileName).status = "PENDING";
      }
    }
  }
  const uniqueDocs = Array.from(groupedDocs.values());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Upload History</h2>
        <p className="text-zinc-400">View and manage previously processed documents.</p>
      </div>

      <HistoryTable initialDocs={uniqueDocs} />
    </div>
  );
}
