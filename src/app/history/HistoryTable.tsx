"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Eye, CheckCircle, Clock, Search, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Define a type for the document
type DocumentRecord = any;

export default function HistoryTable({ initialDocs }: { initialDocs: DocumentRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredDocs = initialDocs.filter((doc) => {
    // Search filter
    const matchesSearch = 
      (doc.fileName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.machineNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
          <input
            type="text"
            className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Search filenames or machine numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
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
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No documents found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-zinc-900/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-indigo-400">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-zinc-200">
                          {doc.fileName.length > 37 ? doc.fileName.substring(37) : doc.fileName}
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
                        href={`/review/${encodeURIComponent(doc.fileName)}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition-colors hover:bg-indigo-600/20"
                      >
                        View Batch
                        <ArrowRight size={14} />
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
