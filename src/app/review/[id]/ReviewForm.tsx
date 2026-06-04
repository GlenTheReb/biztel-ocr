"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/contexts/NotificationContext";

// Define a type for the document
type DocumentRecord = any;

export default function ReviewForm({ document }: { document: DocumentRecord }) {
  const router = useRouter();
  const { addNotification, updateNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form state with AI extracted values
  const [formData, setFormData] = useState({
    date: document.date || "",
    shift: document.shift || "",
    employeeNumber: document.employeeNumber || "",
    operationCode: document.operationCode || "",
    machineNumber: document.machineNumber || "",
    workOrderNumber: document.workOrderNumber || "",
    quantityProduced: document.quantityProduced || 0,
    timeTaken: document.timeTaken || "",
  });

  const confidenceScores = JSON.parse(document.confidenceScores || "{}");
  const validationFailures: string[] = JSON.parse(document.validationFailures || "[]");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantityProduced" ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const notifId = addNotification(`Approving record ${document.fileName}...`, "loading");
    try {
      const res = await fetch(`/api/review/${document.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        updateNotification(notifId, `Record ${document.fileName} approved.`, "success");
        // Redirect to history upon successful approval
        router.push("/history");
      } else {
        updateNotification(notifId, `Failed to approve record.`, "error");
        alert("Failed to save.");
      }
    } catch (err) {
      updateNotification(notifId, `Error approving record.`, "error");
      alert("Error saving record.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render fields with confidence highlighting (Requirements 4 & 5)
  const renderField = (name: string, label: string, type: string = "text") => {
    // Treat missing scores as low confidence
    const score = confidenceScores[name];
    const isLowConfidence = score === undefined || score < 0.8;
    const isMissing = !formData[name as keyof typeof formData];
    
    // The field needs attention if confidence is low OR if it's missing entirely
    const needsAttention = isLowConfidence || isMissing;

    return (
      <div className="mb-4">
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-zinc-300">
          {label}
          {needsAttention && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle size={14} /> 
              {isMissing ? "Missing Data" : `Low Confidence (${(score * 100).toFixed(0)}%)`}
            </span>
          )}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name as keyof typeof formData] as string | number}
          onChange={handleChange}
          className={cn(
            "w-full rounded-md border bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 transition-colors focus:outline-none focus:ring-2",
            needsAttention 
              ? "border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20" 
              : "border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20"
          )}
        />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-medium text-zinc-100">AI Extraction Review</h3>
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
          document.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        )}>
          {document.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {validationFailures.length > 0 && (
          <div className="mb-6 rounded-md border border-red-500/50 bg-red-500/10 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
              <AlertTriangle size={16} /> Business Rule Violations
            </h4>
            <ul className="list-disc pl-5 text-xs text-red-300">
              {validationFailures.map((failure, idx) => (
                <li key={idx} className="mb-1">{failure}</li>
              ))}
            </ul>
          </div>
        )}
        {renderField("date", "Date (YYYY-MM-DD)")}
        {renderField("shift", "Shift")}
        {renderField("employeeNumber", "Employee Number")}
        {renderField("operationCode", "Operation Code")}
        {renderField("machineNumber", "Machine Number")}
        {renderField("workOrderNumber", "Work Order Number")}
        {renderField("quantityProduced", "Quantity Produced", "number")}
        {renderField("timeTaken", "Time Taken")}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={18} />}
          {isSaving ? "Saving..." : "Save & Approve Record"}
        </button>
      </div>
    </div>
  );
}
