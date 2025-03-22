import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import Recording from "@/app/models/Recording";
import User from "@/app/models/User";
import Dispute from "@/app/models/Dispute";  // ✅ Import Dispute model
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    await connectToDatabase();

    // ✅ Fetch user role
    const user = await User.findById(session.user.id).select("role");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Fetch all evaluations and populate relevant details
    const evaluations = await Grade.find({})
      .populate({
        path: "recordingId",
        select: "uploadDate account objectKey callTime agent _id",
      })
      .populate("evaluatorId", "username")
      .select("score feedback qaFeedback answers recordingId evaluatorId isConfirmed");

    // ✅ Check for disputes
    const disputes = await Dispute.find({ status: { $ne: "Resolved" } }).select("gradeId");

    // Create a Set of disputed grade IDs for quick lookup
    const disputedGradeIds = new Set(disputes.map((dispute) => dispute.gradeId.toString()));

    // ✅ Transform data for frontend
    const formattedEvaluations = evaluations.map((evaluation) => ({
      _id: evaluation.recordingId?._id || "N/A",
      callDate: evaluation.recordingId?.uploadDate || "N/A",
      account: evaluation.recordingId?.account || "Unknown",
      objectKey: evaluation.recordingId?.objectKey || "N/A",
      callTime: evaluation.recordingId?.callTime || "N/A",
      agent: evaluation.recordingId?.agent || "Unknown",
      evaluator: evaluation.evaluatorId?.username || "Unknown",
      score: evaluation.score ?? 0,
      feedback: evaluation.feedback || "N/A",
      qaFeedback: evaluation.qaFeedback || "N/A",
      answers: evaluation.answers || {},
      isGraded: evaluation.score !== null,
      isConfirmed: evaluation.isConfirmed || false,
      // ✅ Add dispute status
      dispute: disputedGradeIds.has(evaluation._id.toString()) ? true : false,
      evaluationId: evaluation._id || "N/A",
      recordingId: evaluation.recordingId?._id || "N/A",
    }));

    console.log('evaluations: ', formattedEvaluations);
    console.log('user role: ', user.role);

    return NextResponse.json({ evaluations: formattedEvaluations, userRole: user.role });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { message: "Error fetching evaluations", error: error.message },
      { status: 500 }
    );
  }
}



// import { connectToDatabase } from "@/app/lib/mongodb";
// import Grade from "@/app/models/Grade";
// import Recording from "@/app/models/Recording";
// import User from "@/app/models/User";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
//
// export async function GET(request) {
//   try {
//     // ✅ Get logged-in user session
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user || !session.user.id) {
//       return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
//     }
//
//     await connectToDatabase();
//
//     // ✅ Fetch user role
//     const user = await User.findById(session.user.id).select("role");
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }
//
//     // ✅ Fetch all evaluations and populate relevant details
//     const evaluations = await Grade.find({})
//       .populate({
//         path: "recordingId",
//         select: "uploadDate account objectKey callTime agent _id",
//       })
//       .populate("evaluatorId", "username")
//       .select("score feedback answers recordingId evaluatorId");
//
//     // ✅ Transform data for frontend
//     const formattedEvaluations = evaluations.map((evaluation) => ({
//       _id: evaluation.recordingId?._id || "N/A",
//       callDate: evaluation.recordingId?.uploadDate || "N/A",
//       account: evaluation.recordingId?.account || "Unknown",
//       objectKey: evaluation.recordingId?.objectKey || "N/A",
//       callTime: evaluation.recordingId?.callTime || "N/A",
//       agent: evaluation.recordingId?.agent || "Unknown",
//       evaluator: evaluation.evaluatorId?.username || "Unknown",
//       score: evaluation.score ?? 0,
//       feedback: evaluation.feedback || "N/A",
//       answers: evaluation.answers || {},
//       isGraded: evaluation.score !== null,
//     }));
//
//     console.log('evaluations: ', formattedEvaluations);
//     console.log('user role: ', user.role);
//
//     return NextResponse.json({ evaluations: formattedEvaluations, userRole: user.role });
//   } catch (error) {
//     console.error("Error fetching evaluations:", error);
//     return NextResponse.json(
//       { message: "Error fetching evaluations", error: error.message },
//       { status: 500 }
//     );
//   }
// }
