import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import Recording from "@/app/models/Recording";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const evaluationId = searchParams.get("id");

    if (!evaluationId) {
      return NextResponse.json({ message: "Missing evaluation ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch the evaluation details
    const evaluation = await Grade.findById(evaluationId)
      .populate({
        path: "recordingId",
        select: "uploadDate account objectKey callTime agent _id",
      })
      .populate("evaluatorId", "username")
      .select("score feedback answers recordingId evaluatorId");

    if (!evaluation) {
      return NextResponse.json({ message: "Evaluation not found" }, { status: 404 });
    }

    // Prepare the response object
    const formattedEvaluation = {
      _id: evaluation._id,
      callDate: evaluation.recordingId?.uploadDate || "N/A",
      account: evaluation.recordingId?.account || "Unknown",
      objectKey: evaluation.recordingId?.objectKey || "N/A",
      callTime: evaluation.recordingId?.callTime || "N/A",
      agent: evaluation.recordingId?.agent || "Unknown",
      evaluator: evaluation.evaluatorId?.username || "Unknown",
      score: evaluation.score ?? 0,
      feedback: evaluation.feedback || "N/A",
      answers: evaluation.answers || {},
      isGraded: evaluation.score !== null,
    };

    return NextResponse.json(formattedEvaluation);
  } catch (error) {
    console.error("Error fetching single evaluation:", error);
    return NextResponse.json(
      { message: "Error fetching evaluation", error: error.message },
      { status: 500 }
    );
  }
}
