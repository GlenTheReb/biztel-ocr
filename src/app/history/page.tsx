import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { FileText, Eye, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function HistoryPage() {
  // Fetch all documents, ordered by newest first
  const allDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.uploadDate)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Upload History</h2>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Upload Date</th>
                <th className="px-6 py-4 font-medium">Shift</th>
                <th className="px-6 py-4 font-medium">Machine #</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {allDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No documents processed yet.
                  </td>
                </tr>
              ) : (
                allDocs.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-zinc-900/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-indigo-400">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-zinc-200 truncate max-w-[200px]">
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.uploadDate?.toLocaleDateString() || "N/A"}
                    </td>
                    <td className="px-6 py-4">{doc.shift || "-"}</td>
                    <td className="px-6 py-4">{doc.machineNumber || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        doc.status === "APPROVED" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-amber-500/10 text-amber-400"
                      )}>
                        {doc.status === "APPROVED" ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/review/${doc.id}`}
                        className="inline-flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
