import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { recordingIds } = await req.json();

    if (!recordingIds || !Array.isArray(recordingIds)) {
      return NextResponse.json({ error: "Invalid request. Provide an array of recording IDs." }, { status: 400 });
    }

    // Find which recordings have already been graded
    const gradedRecords = await Grade.find({ recordingId: { $in: recordingIds } }, "recordingId");

    // Extract IDs of graded recordings
    const gradedIds = gradedRecords.map(record => record.recordingId.toString());

    return NextResponse.json({ gradedIds });
  } catch (error) {
    console.error("Error checking graded recordings:", error);
    return NextResponse.json({ error: "Failed to check graded recordings." }, { status: 500 });
  }
}
