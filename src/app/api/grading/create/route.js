import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

    console.log('API ROUTE HIT: /api/grading/create')
    const body = await req.json();
    console.log("📩 Received Payload:", body);

    const { recordingId, agentName, answers, score, feedback } = body;

    await connectToDatabase();

    // ✅ Get the authenticated session (user)
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const evaluatorId = session.user.id; // ✅ The user submitting the grade
    const evaluatorRole = session.user.role; // ✅ Ensure this is an Admin
    const isAdmin = evaluatorRole === "Admin"; // ✅ Admins can update

    // ✅ Parse the request body
    if (!recordingId || !agentName || !answers) {
      console.log("❌ Missing required fields:", body);
      return new Response(JSON.stringify({ message: "Missing required fields." }), { status: 400 });
    }

    // ✅ Find the agent by name (from Agent model)
    const agent = await Agent.findOne({
      agentName: { $regex: `^${agentName.trim()}$`, $options: "i" }
    });

    if (!agent) {
      console.log(`❌ Agent Not Found: ${agentName}`);

      return new Response(
        JSON.stringify({
          message: `Agent "${agentName}" does not exist. Please ask an admin to create "${agentName.charAt(0).toUpperCase() + agentName.slice(1)}" before grading.`,
        }),
        { status: 404 }
      );
    }

    const agentId = agent._id;

    // ✅ Check if grade already exists
    let existingGrade = await Grade.findOne({ recordingId });

    if (existingGrade) {
      // ✅ Only allow updates by Admins
      if (!isAdmin) {
        return new Response(JSON.stringify({ message: "Permission denied" }), { status: 403 });
      }

      // ✅ Update existing grade
      existingGrade.score = score;
      existingGrade.answers = answers;
      existingGrade.feedback = feedback;
      existingGrade.evaluatorId = evaluatorId; // ✅ Track who updated it
      await existingGrade.save();

      return new Response(JSON.stringify({ message: "Grade updated successfully." }), { status: 200 });
    }

    // ✅ Create a new grade if none exists
    const newGrade = new Grade({
      recordingId,
      agentId,
      evaluatorId,
      answers,
      score,
      feedback,
    });

    await newGrade.save();

    return new Response(JSON.stringify({ message: "Grade recorded successfully." }), { status: 201 });
  } catch (error) {
    console.error("Error saving grade:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), { status: 500 });
  }
}
