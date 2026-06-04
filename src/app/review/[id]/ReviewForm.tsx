"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/contexts/NotificationContext";

type DocumentRecord = any;

export default function ReviewForm({ documents, batchId }: { documents: DocumentRecord[], batchId: string }) {
  const router = useRouter();
  const { addNotification, updateNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state with all records from the batch
  const [records, setRecords] = useState<DocumentRecord[]>(
    documents.map(doc => ({
      id: doc.id || crypto.randomUUID(),
      date: doc.date || "",
      shift: doc.shift || "",
      employeeNumber: doc.employeeNumber || "",
      operationCode: doc.operationCode || "",
      machineNumber: doc.machineNumber || "",
      workOrderNumber: doc.workOrderNumber || "",
      quantityProduced: doc.quantityProduced || 0,
      timeTaken: doc.timeTaken || "",
      confidenceScores: doc.confidenceScores || "{}",
      validationFailures: doc.validationFailures || "[]"
    }))
  );

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecords(prev => {
      const newRecords = [...prev];
      newRecords[index] = {
        ...newRecords[index],
        [name]: name === "quantityProduced" ? parseInt(value) || 0 : value
      };
      return newRecords;
    });
  };

  const handleAddRow = () => {
    setRecords(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date: "",
        shift: "",
        employeeNumber: "",
        operationCode: "",
        machineNumber: "",
        workOrderNumber: "",
        quantityProduced: 0,
        timeTaken: "",
        confidenceScores: "{}",
        validationFailures: "[]"
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRecords(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const notifId = addNotification(`Approving ${records.length} records...`, "loading");
    try {
      const res = await fetch(`/api/review-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, records }),
      });
      
      if (res.ok) {
        updateNotification(notifId, `Batch approved successfully.`, "success");
        router.push("/history");
      } else {
        updateNotification(notifId, `Failed to approve batch.`, "error");
        alert("Failed to save.");
      }
    } catch (err) {
      updateNotification(notifId, `Error approving batch.`, "error");
      alert("Error saving records.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render fields
  const renderField = (index: number, label: string, name: string, type = "text") => {
    const record = records[index];
    const scores = JSON.parse(record.confidenceScores || "{}");
    const score = scores[name];
    const isLowConfidence = score !== undefined && score < 0.8;
    const value = record[name];

    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => handleChange(index, e)}
            className={cn(
              "w-full rounded-md border bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-colors focus:outline-none focus:ring-2",
              isLowConfidence 
                ? "border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20" 
                : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
            )}
          />
          {isLowConfidence && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500" title={`Low Confidence: ${(score * 100).toFixed(0)}%`}>
              <AlertTriangle size={14} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-6 flex justify-between items-center bg-zinc-950">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/history")}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors -ml-2"
            title="Close Review"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Bulk Review</h2>
            <p className="text-sm text-zinc-400">Review {records.length} extracted rows</p>
          </div>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving || records.length === 0}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Approve All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {records.map((record, index) => {
          const failures: string[] = JSON.parse(record.validationFailures || "[]");
          return (
            <div key={record.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-indigo-400">Row {index + 1}</h4>
                <button 
                  onClick={() => handleRemoveRow(index)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove Row"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {failures.length > 0 && (
                <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-3">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">Validation Rules Failed</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-red-300 space-y-1">
                    {failures.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {renderField(index, "Date", "date")}
                {renderField(index, "Shift", "shift")}
                {renderField(index, "Employee No", "employeeNumber")}
                {renderField(index, "Operation Code", "operationCode")}
                {renderField(index, "Machine No", "machineNumber")}
                {renderField(index, "Work Order", "workOrderNumber")}
                {renderField(index, "Qty Produced", "quantityProduced", "number")}
                {renderField(index, "Time Taken", "timeTaken")}
              </div>
            </div>
          );
        })}

        <button 
          onClick={handleAddRow}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 p-4 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <Plus size={16} />
          Add Missing Row
        </button>
      </div>
    </div>
  );
}
