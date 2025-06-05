// app/api/admin/run-cronjob/route.ts
import { NextRequest, NextResponse } from "next/server";

interface CronJobRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  requestBody?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url, method, requestBody }: CronJobRequest = await req.json();

    // Validate the request
    if (!url || !method) {
      return NextResponse.json(
        { status: 400, message: "URL and method are required" },
        { status: 400 }
      );
    }

    // Ensure the URL is for internal cron jobs only
    if (!url.startsWith("/api/cronjobs/")) {
      return NextResponse.json(
        { status: 403, message: "Only internal cron job URLs are allowed" },
        { status: 403 }
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(req.url).origin;
    const fullUrl = `${baseUrl}${url}`;

    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CronJobRunner/1.0",
      },
    };

    // Add request body for non-GET requests
    if (method !== "GET" && requestBody) {
      try {
        // Validate JSON if provided
        JSON.parse(requestBody);
        fetchOptions.body = requestBody;
      } catch (error) {
        return NextResponse.json(
          { status: 400, message: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    }

    console.log(`Running cron job: ${method} ${fullUrl}`);

    // Execute the cron job
    const response = await fetch(fullUrl, fetchOptions);
    const result = await response.text();

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { message: result };
    }

    // Log the result
    console.log(`Cron job completed with status: ${response.status}`);
    console.log("Response:", parsedResult);

    return NextResponse.json({
      status: response.status,
      success: response.ok,
      message: response.ok
        ? "Cron job executed successfully"
        : "Cron job failed",
      data: parsedResult,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error running cron job:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Internal server error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
