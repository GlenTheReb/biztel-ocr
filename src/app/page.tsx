import { db } from "@/db";
import { documents } from "@/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { FileStack, CheckCircle2, Clock, Factory } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  // Aggregate queries using Drizzle
  const totalUploadsResult = await db.select({ count: count() }).from(documents);
  const totalUploads = totalUploadsResult[0].count;

  const approvedResult = await db.select({ count: count() }).from(documents).where(eq(documents.status, "APPROVED"));
  const approvedCount = approvedResult[0].count;

  const pendingCount = totalUploads - approvedCount;

  const totalQuantityResult = await db.select({ total: sum(documents.quantityProduced) }).from(documents);
  // @ts-ignore - sum result can be string in some drivers, so we handle it safely
  const totalQuantity = Number(totalQuantityResult[0].total) || 0;

  // Fetch all docs for JS aggregations (easier for JSON parsing in SQLite/Postgres prototype)
  const allDocs = await db.query.documents.findMany({
    orderBy: (docs, { desc }) => [desc(docs.uploadDate)],
  });

  const recentDocs = allDocs.slice(0, 5);

  const validationFailuresCount = allDocs.filter(d => {
    try { return JSON.parse(d.validationFailures || "[]").length > 0; } catch { return false; }
  }).length;

  const shiftSummaries = allDocs.reduce((acc, doc) => {
    const shift = doc.shift || "Unknown";
    acc[shift] = (acc[shift] || 0) + (doc.quantityProduced || 0);
    return acc;
  }, {} as Record<string, number>);

  const machineSummaries = allDocs.reduce((acc, doc) => {
    const machine = doc.machineNumber || "Unknown";
    acc[machine] = (acc[machine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Operational Dashboard</h2>
        <p className="text-zinc-400 mt-1">Overview of AI document processing and manufacturing outputs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-zinc-400">Total Uploads</h3>
            <FileStack className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-100">{totalUploads}</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-zinc-400">Pending Review</h3>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-zinc-400">Approved</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">{approvedCount}</div>
        </div>

        <div className="rounded-xl border border-red-900/50 bg-zinc-950 p-6 shadow">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-red-400">Validation Failures</h3>
            <FileStack className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">{validationFailuresCount}</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-zinc-400">Total Quantity</h3>
            <Factory className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-indigo-400">{totalQuantity}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shift Summaries */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="font-semibold text-zinc-100">Shift-wise Quantity</h3>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-zinc-800">
              {Object.entries(shiftSummaries).map(([shift, qty]) => (
                <li key={shift} className="flex justify-between py-2">
                  <span className="text-sm text-zinc-400">{shift}</span>
                  <span className="text-sm font-medium text-zinc-200">{qty} units</span>
                </li>
              ))}
              {Object.keys(shiftSummaries).length === 0 && <p className="text-sm text-zinc-500 py-2">No data yet.</p>}
            </ul>
          </div>
        </div>

        {/* Machine Summaries */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="font-semibold text-zinc-100">Machine-wise Uploads</h3>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-zinc-800">
              {Object.entries(machineSummaries).map(([machine, count]) => (
                <li key={machine} className="flex justify-between py-2">
                  <span className="text-sm text-zinc-400">{machine}</span>
                  <span className="text-sm font-medium text-zinc-200">{count} docs</span>
                </li>
              ))}
              {Object.keys(machineSummaries).length === 0 && <p className="text-sm text-zinc-500 py-2">No data yet.</p>}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h3 className="font-semibold text-zinc-100">Recent AI Extractions</h3>
        </div>
        <div className="p-6">
          {recentDocs.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent activity. Upload a document to see it here.</p>
          ) : (
            <div className="space-y-4">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
                  <div>
                    <p className="font-medium text-zinc-200">{doc.fileName}</p>
                    <p className="text-xs text-zinc-500 mt-1">Machine: {doc.machineNumber || 'Unknown'} • Shift: {doc.shift || 'Unknown'}</p>
                  </div>
                  <Link 
                    href={`/review/${doc.id}`}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    View Record
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
