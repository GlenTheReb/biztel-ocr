"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchTable({ initialDocs }: { initialDocs: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = initialDocs.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    
    // Combine all fields into a single searchable string
    const searchableText = [
      doc.fileName, doc.date, doc.shift, doc.employeeNumber, 
      doc.operationCode, doc.machineNumber, doc.workOrderNumber,
      doc.quantityProduced, doc.timeTaken, doc.status
    ].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(searchLower);
  });

  return (
    <div className="space-y-4">
      <div className="flex bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-zinc-800 bg-zinc-900 p-2.5 pl-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search by Employee ID, Machine, Shift, Work Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-zinc-800 shadow">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Emp ID</th>
              <th className="px-6 py-4">Machine</th>
              <th className="px-6 py-4">Operation</th>
              <th className="px-6 py-4">Work Order</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{doc.date || "-"}</td>
                  <td className="px-6 py-4">{doc.shift || "-"}</td>
                  <td className="px-6 py-4">{doc.employeeNumber || "-"}</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{doc.machineNumber || "-"}</td>
                  <td className="px-6 py-4">{doc.operationCode || "-"}</td>
                  <td className="px-6 py-4 text-indigo-400">{doc.workOrderNumber || "-"}</td>
                  <td className="px-6 py-4">{doc.quantityProduced || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      doc.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                      doc.status === "PENDING" ? "bg-amber-500/10 text-amber-400" :
                      "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {doc.status === "APPROVED" ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                  {initialDocs.length === 0 ? "No records in the database." : "No records match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
