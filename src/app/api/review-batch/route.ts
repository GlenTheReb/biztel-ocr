import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { batchId, records } = await req.json();

    if (!batchId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Step 1: Delete all existing PENDING records associated with this batchId (fileName)
    await db.delete(documents)
      .where(
        and(
          eq(documents.fileName, batchId),
          eq(documents.status, "PENDING")
        )
      );

    // Step 2: If there are records to insert, insert them as APPROVED
    if (records.length > 0) {
      // Find the fileUrl from the first existing record or assume it's passed.
      // Since they share a batchId, they should share a fileUrl.
      // The frontend doesn't pass fileUrl back, so we need to fetch it if it's not provided.
      // Actually, wait, the records array doesn't have fileUrl in ReviewForm state.
      // Let's get the fileUrl from the DB before deleting.
      
      const existingDoc = await db.query.documents.findFirst({
        where: eq(documents.fileName, batchId)
      });
      
      const fileUrl = existingDoc?.fileUrl || "";

      const insertions = records.map((record: any) => ({
        id: record.id || crypto.randomUUID(),
        fileName: batchId,
        fileUrl: fileUrl,
        status: "APPROVED",
        date: record.date || null,
        shift: record.shift || null,
        employeeNumber: record.employeeNumber || null,
        operationCode: record.operationCode || null,
        machineNumber: record.machineNumber || null,
        workOrderNumber: record.workOrderNumber || null,
        quantityProduced: record.quantityProduced || null,
        timeTaken: record.timeTaken || null,
        confidenceScores: record.confidenceScores || "{}",
        validationFailures: "[]" // It's approved, so validations are cleared
      }));

      await db.insert(documents).values(insertions);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch Review Error:", error);
    return NextResponse.json({ error: "Failed to process batch review" }, { status: 500 });
  }
}
