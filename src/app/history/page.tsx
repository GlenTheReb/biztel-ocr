import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import HistoryTable from "./HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  // Fetch all documents, ordered by newest first (Server-side)
  const allDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.uploadDate)],
  });

  // Group by fileName so the history page shows 1 row per image
  const groupedDocs = new Map();
  for (const doc of allDocs) {
    if (!groupedDocs.has(doc.fileName)) {
      // Store initial record but convert machine/shift to Sets for aggregation
      groupedDocs.set(doc.fileName, {
        ...doc,
        allMachines: new Set(doc.machineNumber ? [doc.machineNumber] : []),
        allShifts: new Set(doc.shift ? [doc.shift] : []),
        allSearchable: new Set([
          doc.machineNumber, doc.shift, doc.employeeNumber, doc.operationCode, doc.workOrderNumber, doc.date
        ].filter(Boolean)),
        rowCount: 1
      });
    } else {
      const existing = groupedDocs.get(doc.fileName);
      existing.rowCount += 1;
      if (doc.machineNumber) existing.allMachines.add(doc.machineNumber);
      if (doc.shift) existing.allShifts.add(doc.shift);
      
      [doc.machineNumber, doc.shift, doc.employeeNumber, doc.operationCode, doc.workOrderNumber, doc.date].forEach(val => {
        if (val) existing.allSearchable.add(val);
      });

      // If any document in the batch is PENDING, the whole batch is PENDING
      if (doc.status === "PENDING") {
        existing.status = "PENDING";
      }
    }
  }
  
  // Convert Sets back to comma-separated strings for the UI
  const uniqueDocs = Array.from(groupedDocs.values()).map(doc => ({
    ...doc,
    machineNumber: Array.from(doc.allMachines).join(", ") || "N/A",
    shift: Array.from(doc.allShifts).join(", ") || "N/A",
    searchableText: Array.from(doc.allSearchable).join(" ").toLowerCase()
  }));

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
