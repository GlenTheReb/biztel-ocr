import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // The user has manually reviewed and is saving corrections.
    await db.update(documents)
      .set({
        status: "APPROVED",
        date: body.date,
        shift: body.shift,
        employeeNumber: body.employeeNumber,
        operationCode: body.operationCode,
        machineNumber: body.machineNumber,
        workOrderNumber: body.workOrderNumber,
        quantityProduced: body.quantityProduced,
        timeTaken: body.timeTaken,
      })
      .where(eq(documents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review save error:", error);
    return NextResponse.json({ success: false, error: "Failed to save record" }, { status: 500 });
  }
}
