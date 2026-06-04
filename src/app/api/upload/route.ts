import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { documents } from "@/db/schema";
import path from "path";

// Using Gemini API SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for Gemini SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save file locally to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await require("fs/promises").mkdir(uploadDir, { recursive: true });
    
    const id = crypto.randomUUID();
    const fileName = `${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    
    await require("fs/promises").writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    // Call Gemini Model (using the 1.5-flash string as it is the current fast multimodal SDK string)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a manufacturing operational document extraction system.
Analyze this handwritten/semi-structured document.
Extract the following fields. If a field is missing, leave it null.
Also, assign a confidence score from 0.0 to 1.0 for each field indicating how certain you are of your extraction.

Return ONLY a valid JSON object with exactly this schema (do not include markdown block ticks like \`\`\`json):
{
  "extracted": {
    "date": "YYYY-MM-DD",
    "shift": "string",
    "employeeNumber": "string",
    "operationCode": "string",
    "machineNumber": "string",
    "workOrderNumber": "string",
    "quantityProduced": integer,
    "timeTaken": "string"
  },
  "confidenceScores": {
    "date": 0.0,
    "shift": 0.0,
    "employeeNumber": 0.0,
    "operationCode": 0.0,
    "machineNumber": 0.0,
    "workOrderNumber": 0.0,
    "quantityProduced": 0.0,
    "timeTaken": 0.0
  }
}`;

    const imageParts = [{
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type
      }
    }];

    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    // Clean up markdown ticks if Gemini included them
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(responseText);

    // Save to Database via Drizzle
    await db.insert(documents).values({
      id,
      fileName: file.name,
      fileUrl,
      status: "PENDING",
      date: parsedData.extracted.date || null,
      shift: parsedData.extracted.shift || null,
      employeeNumber: parsedData.extracted.employeeNumber || null,
      operationCode: parsedData.extracted.operationCode || null,
      machineNumber: parsedData.extracted.machineNumber || null,
      workOrderNumber: parsedData.extracted.workOrderNumber || null,
      quantityProduced: parsedData.extracted.quantityProduced || null,
      timeTaken: parsedData.extracted.timeTaken || null,
      confidenceScores: JSON.stringify(parsedData.confidenceScores || {}),
      validationFailures: JSON.stringify([])
    });

    return NextResponse.json({ success: true, documentId: id });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Failed to process document" }, { status: 500 });
  }
}
