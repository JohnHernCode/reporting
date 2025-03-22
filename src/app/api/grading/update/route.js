import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectToDatabase();
    const { evaluationId, recordingId, agentName, answers, score, feedback } = await req.json();

    if (!evaluationId || !recordingId || !agentName || !answers) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const grade = await Grade.findById(evaluationId);
    if (!grade) {
      return NextResponse.json({ message: "Grade not found." }, { status: 404 });
    }

    // Save current feedback to qaFeedback if it exists
    if (grade.feedback) {
      grade.qaFeedback = grade.feedback;  // Move old feedback to qaFeedback
    }

    grade.isConfirmed = true;
    grade.recordingId = recordingId;
    grade.answers = answers;
    grade.score = score;
    grade.feedback = feedback;
    await grade.save();

    return NextResponse.json({ message: "Grade updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}