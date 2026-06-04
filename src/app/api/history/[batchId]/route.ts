import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    
    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId" }, { status: 400 });
    }

    // Decode in case the client sent URL encoded filename
    const decodedBatchId = decodeURIComponent(batchId);

    // Delete all records associated with this batch (fileName)
    await db.delete(documents).where(eq(documents.fileName, decodedBatchId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Batch Error:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
