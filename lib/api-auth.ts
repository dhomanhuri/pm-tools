import { NextResponse } from "next/server";

export function validateApiKey(req: Request): boolean {
  const apiKeyHeader = req.headers.get("x-api-key");
  const envApiKey = process.env.PM_TOOLS_API_KEY;

  if (!envApiKey) {
    // Fail closed if no key is configured
    console.error("PM_TOOLS_API_KEY is not defined in environment variables");
    return false;
  }

  return apiKeyHeader === envApiKey;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized: Invalid or missing API Key" },
    { status: 401 }
  );
}
