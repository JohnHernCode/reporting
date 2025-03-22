import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import Grade from "@/app/models/Grade";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path if needed
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions); // use getServerSession in App Router

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const agent = await Agent.findOne({ userId: session.user.id });

    if (!agent) {
      return NextResponse.json({ message: "No grades found", grades: [] });
    }

    const grades = await Grade.find({ agentId: agent._id })
      .populate("recordingId") // get call details from the recording
      .lean(); // optional: returns plain JS objects for easy modification

    // remove evaluator info before sending to frontend
    const sanitizedGrades = grades.map((grade) => ({
      _id: grade._id,
      score: grade.score,
      feedback: grade.feedback || "",
      isConfirmed: grade.isConfirmed,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt,
      recording: {
        callDate: grade.recordingId?.callDate || null,
        callTime: grade.recordingId?.callTime || null,
        account: grade.recordingId?.account || null,
        objectKey: grade.recordingId?.objectKey || null,
      },
    }));

    return NextResponse.json({ grades: sanitizedGrades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { message: "Error fetching grades", error: error.message },
      { status: 500 }
    );
  }
}
