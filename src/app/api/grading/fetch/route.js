import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import Recording from "@/app/models/Recording";
import User from "@/app/models/User"; // ✅ Import User model
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      console.error("Unauthorized: No session found or missing user ID.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const agentId = session.user.id;

    await connectToDatabase();

    // ✅ Fetch user role from the database
    const user = await User.findById(agentId).select("role");
    if (!user) {
      console.error("User not found:", agentId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userRole = user.role; // ✅ Get the user’s role
    console.log(`User Role: ${userRole}`); // 🛠 Debugging: Check user role

    // ✅ Fetch grades for the logged-in agent
    const grades = await Grade.find({ agentId })
      .populate("recordingId", "callTime uploadDate account objectKey _id")
      .populate("evaluatorId", "username role"); // ✅ Fetch evaluator's username instead of firstName/lastName

    // ✅ Transform data for frontend
    const formattedGrades = grades.map((grade) => {
      const evaluator =
        ["Admin", "Management"].includes(userRole) // 🛠 Adjust case sensitivity
          ? grade.evaluatorId?.username || "Unknown" // ✅ Use `username` instead of `firstName lastName`
          : null;

      console.log(`Evaluator for ${grade._id}:`, evaluator); // 🛠 Debugging: Check evaluator

      return {
        _id: grade._id || "N/A",
        callTime: grade.recordingId?.callTime || "N/A",
        callDate: grade.recordingId?.uploadDate || "N/A",
        account: grade.recordingId?.account || "Unknown",
        objectKey: grade.recordingId?.objectKey || "N/A",
        score: grade.score || 0,
        feedback: grade.feedback || "No feedback provided", // ✅ Include feedback
        evaluator, // ✅ Only return evaluator if user is Admin/Management
      };
    });

    console.log("Final Grades Response:", formattedGrades); // 🛠 Debugging API response

    return NextResponse.json({ grades: formattedGrades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { message: "Error fetching grades", error: error.message },
      { status: 500 }
    );
  }
}
