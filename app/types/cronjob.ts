// lib/types/cronjob.ts
export interface CronJob {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  requestBody?: string;
  schedule: string; // Cron expression
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  lastStatus?: "success" | "error" | "never";
  lastError?: string;
  runCount: number;
}

export interface CronJobExecution {
  id: string;
  cronJobId: string;
  executedAt: Date;
  status: "success" | "error";
  duration: number; // milliseconds
  response?: any;
  error?: string;
}

// app/api/admin/cronjobs/route.ts
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { CronJob } from "@/lib/types/cronjob";

// GET - Fetch all cron jobs
export async function GET() {
  try {
    const cronJobsQuery = query(
      collection(db, "cronJobs"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(cronJobsQuery);
    const cronJobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      lastRun: doc.data().lastRun?.toDate?.() || null,
    }));

    return NextResponse.json({ cronJobs });
  } catch (error) {
    console.error("Error fetching cron jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron jobs" },
      { status: 500 }
    );
  }
}

// POST - Create a new cron job
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.url || !data.method || !data.schedule) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate cron expression (basic validation)
    const cronPattern =
      /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([01]?\d|[12]\d|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/;
    if (!cronPattern.test(data.schedule)) {
      return NextResponse.json(
        { error: "Invalid cron expression" },
        { status: 400 }
      );
    }

    const cronJob = {
      name: data.name,
      description: data.description || "",
      url: data.url,
      method: data.method,
      requestBody: data.requestBody || "",
      schedule: data.schedule,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastStatus: "never",
      runCount: 0,
    };

    const docRef = await addDoc(collection(db, "cronJobs"), cronJob);

    return NextResponse.json({
      id: docRef.id,
      message: "Cron job created successfully",
    });
  } catch (error) {
    console.error("Error creating cron job:", error);
    return NextResponse.json(
      { error: "Failed to create cron job" },
      { status: 500 }
    );
  }
}

// app/api/admin/cronjobs/[id]/route.ts

interface RouteParams {
  params: { id: string };
}

// PUT - Update a cron job
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await req.json();

    const cronJobRef = doc(db, "cronJobs", id);

    // Check if cron job exists
    const cronJobDoc = await getDoc(cronJobRef);
    if (!cronJobDoc.exists()) {
      return NextResponse.json(
        { error: "Cron job not found" },
        { status: 404 }
      );
    }

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(cronJobRef, updateData);

    return NextResponse.json({ message: "Cron job updated successfully" });
  } catch (error) {
    console.error("Error updating cron job:", error);
    return NextResponse.json(
      { error: "Failed to update cron job" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a cron job
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const cronJobRef = doc(db, "cronJobs", id);

    // Check if cron job exists
    const cronJobDoc = await getDoc(cronJobRef);
    if (!cronJobDoc.exists()) {
      return NextResponse.json(
        { error: "Cron job not found" },
        { status: 404 }
      );
    }

    await deleteDoc(cronJobRef);

    return NextResponse.json({ message: "Cron job deleted successfully" });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        status: 500,
        error: "Internal server error",
      })
    );
  }
}
