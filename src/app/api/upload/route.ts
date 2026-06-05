import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { put } from "@vercel/blob";

// Using Gemini API SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[API] Processing new upload: ${file.name}`);

    // Convert file to base64 for Gemini SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save file to Vercel Blob (Serverless-friendly)
    const id = crypto.randomUUID();
    const fileName = `${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    const blob = await put(fileName, file, { access: 'public' });
    const fileUrl = blob.url;

    // Define Prompt and Image Parts
    const prompt = `You are a manufacturing operational document extraction system.
Analyze this handwritten/semi-structured document.
This document is a tabular ledger containing multiple rows of data. Extract EVERY single row you can read into an array of records.
For each row, extract the following fields (leave null if missing).
Also, assign a confidence score from 0.0 to 1.0 for each field indicating how certain you are of your extraction.

Return ONLY a valid JSON object with exactly this schema (do not include markdown block ticks like \`\`\`json):
{
  "records": [
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
    }
  ]
}`;

    const imageParts = [{
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type
      }
    }];

    let responseText = "";

    // Retry and Fallback Logic
    try {
      console.log("[API] Attempt 1: Using gemini-3.5-flash");
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent([prompt, ...imageParts]);
      responseText = result.response.text();
    } catch (e1: any) {
      console.warn(`[API] Attempt 1 Failed (${e1.message}). Retrying with gemini-3.5-flash...`);
      
      try {
        console.log("[API] Attempt 2: Using gemini-3.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent([prompt, ...imageParts]);
        responseText = result.response.text();
      } catch (e2: any) {
        console.warn(`[API] Attempt 2 Failed (${e2.message}). Falling back to gemini-1.5-flash...`);
        
        try {
          console.log("[API] Attempt 3: Using gemini-1.5-flash");
          const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await fallbackModel.generateContent([prompt, ...imageParts]);
          responseText = result.response.text();
        } catch (e3: any) {
          console.error(`[API] All model attempts failed due to capacity (${e3.message}).`);
          return NextResponse.json({ success: false, error: "AI Models are currently experiencing high capacity. Please wait a few moments and try again." }, { status: 503 });
        }
      }
    }

    console.log("[API] Raw Gemini Response:", responseText);

    // Clean up markdown ticks if Gemini included them
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(responseText);
    const records = parsedData.records || [];
    
    if (records.length === 0) {
      return NextResponse.json({ success: false, error: "No records found in document" }, { status: 400 });
    }

    const insertions = records.map((record: any) => {
      const extracted = record.extracted || {};
      const validationFailures: string[] = [];
      
      // Rule: Empty or invalid quantity
      if (extracted.quantityProduced === null || extracted.quantityProduced === undefined || extracted.quantityProduced <= 0) {
        validationFailures.push("Empty or invalid quantity produced");
      } else if (extracted.quantityProduced > 10000) {
        validationFailures.push("Suspiciously high quantity produced (>10,000)");
      }

      // Rule: Invalid shift values
      const validShifts = ["Morning", "Evening", "Night", "1", "2", "3", "Day", "I", "II", "III", "i", "ii", "iii"];
      if (extracted.shift && !validShifts.includes(extracted.shift)) {
        validationFailures.push(`Invalid shift value detected: '${extracted.shift}'`);
      }

      // Rule: Missing mandatory fields
      if (!extracted.machineNumber) validationFailures.push("Missing mandatory field: Machine Number");
      if (!extracted.date) validationFailures.push("Missing mandatory field: Date");

      if (validationFailures.length > 0) {
        console.log(`[API] Validation Failures in row:`, validationFailures);
      }

      return {
        id: crypto.randomUUID(),
        fileName, // Use the generated fileName as the batch grouping ID
        fileUrl,
        status: "PENDING",
        date: extracted.date || null,
        shift: extracted.shift || null,
        employeeNumber: extracted.employeeNumber || null,
        operationCode: extracted.operationCode || null,
        machineNumber: extracted.machineNumber ? String(extracted.machineNumber).toUpperCase() : null,
        workOrderNumber: extracted.workOrderNumber || null,
        quantityProduced: extracted.quantityProduced || null,
        timeTaken: extracted.timeTaken || null,
        confidenceScores: JSON.stringify(record.confidenceScores || {}),
        validationFailures: JSON.stringify(validationFailures)
      };
    });

    // Save to Database via Drizzle (Batch Insert)
    await db.insert(documents).values(insertions);

    return NextResponse.json({ success: true, batchId: fileName, count: records.length });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Failed to process document" }, { status: 500 });
  }
}
