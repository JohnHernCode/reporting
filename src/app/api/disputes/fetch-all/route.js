import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import User from "@/app/models/User";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();
    console.log("Fetching all disputes...");

    const disputes = await Dispute.find().sort({ createdAt: -1 });

    if (!disputes.length) {
      console.warn("No disputes found.");
      return NextResponse.json({ message: "No disputes found." }, { status: 404 });
    }

    // ✅ Helper function to resolve agent name
    const resolveAgentName = async (agentId) => {
      if (!agentId) return "Unknown Agent";

      // 🔎 Check in User model
      const user = await User.findById(agentId).select("username");
      if (user) return user.username;

      // 🔎 Check in Agent model
      const agent = await Agent.findById(agentId).select("agentName");
      if (agent) return agent.agentName;

      return "Unknown Agent";
    };

    // 🔄 Process disputes to include resolved agentName
    const formattedDisputes = await Promise.all(
      disputes.map(async (dispute) => {
        const agentName = await resolveAgentName(dispute.agentId);

        return {
          _id: dispute._id,
          caseId: dispute.caseId,
          agentId: dispute.agentId?.toString() || "N/A",
          agentName, // ✅ Unified field for frontend
          status: dispute.status,
          createdAt: dispute.createdAt,
        };
      })
    );

    console.log("Formatted Disputes:", formattedDisputes); // ✅ Debugging log
    return NextResponse.json({ disputes: formattedDisputes });
  } catch (error) {
    console.error("Error fetching all disputes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
