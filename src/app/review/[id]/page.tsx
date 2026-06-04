import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id)
  });

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left side: Document Preview */}
      <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 overflow-hidden flex flex-col shadow-xl">
        <h3 className="mb-4 text-sm font-medium text-zinc-400">Original Document Preview</h3>
        <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden relative">
          {/* Using standard iframe/img for prototype to avoid next/image domain config issues with uploads */}
          {doc.fileUrl.endsWith(".pdf") ? (
             <iframe src={doc.fileUrl} className="w-full h-full" title="Document Preview" />
          ) : (
             <img src={doc.fileUrl} alt="Document" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      </div>

      {/* Right side: Review Form (Client Component) */}
      <div className="w-[450px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <ReviewForm document={doc} />
      </div>
    </div>
  );
}
