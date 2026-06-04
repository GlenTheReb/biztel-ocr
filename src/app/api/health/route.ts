import { NextResponse } from "next/server";

export async function GET() {
  // Simple health check to verify the environment is configured
  // In a full production app, this might ping the actual Google API.
  if (process.env.GEMINI_API_KEY) {
    return NextResponse.json({ status: "UP", service: "Gemini 3.5 Flash" }, { status: 200 });
  }
  
  return NextResponse.json({ status: "DOWN", error: "Missing API Key" }, { status: 503 });
}
