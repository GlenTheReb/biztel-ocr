"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/contexts/NotificationContext";

export default function UploadPage() {
  const router = useRouter();
  const { addNotification, updateNotification } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const notifId = addNotification(`Uploading and analyzing ${file.name}...`, "loading");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        updateNotification(notifId, `Extracted ${data.count} records from ${file.name}.`, "success");
        router.push(`/review/${encodeURIComponent(data.batchId)}`);
      } else {
        updateNotification(notifId, `Failed to analyze ${file.name}.`, "error");
        setUploadError(data.error || "Upload failed. Please ensure the file is valid and try again.");
      }
    } catch (e) {
      updateNotification(notifId, `Error uploading ${file.name}.`, "error");
      setUploadError("An unexpected error occurred while uploading the file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Upload Document</h2>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
          isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50"
        )}
      >
        <div className="mb-4 rounded-full bg-zinc-800 p-4">
          <UploadCloud className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-zinc-100">Click or drag document to upload</h3>
        <p className="text-sm text-zinc-400 mb-6">Supports JPG, PNG, and PDF (max 10MB)</p>
        
        <label className="cursor-pointer rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
          Browse Files
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-800 text-indigo-400">
              <File size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading ? "Extracting Data..." : "Upload & Analyze"}
          </button>
        </div>
      )}

      {/* Upload Error Modal */}
      {uploadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              Upload Failed
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {uploadError}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setUploadError(null)}
                className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
