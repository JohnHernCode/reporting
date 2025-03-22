import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import User from "@/app/models/User"; // ✅ Import User model
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { caseId } = params;
    console.log(`Fetching dispute for caseId: ${caseId}`); // ✅ Debugging log

    if (!caseId) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    // ✅ Fetch dispute and populate agentId with user details
    const dispute = await Dispute.findOne({ caseId }).populate("agentId", "username");

    if (!dispute) {
      console.error(`Dispute not found for caseId: ${caseId}`);
      return NextResponse.json({ message: `Dispute not found for ID: ${caseId}` }, { status: 404 });
    }

    // ✅ Capitalize the username
    const agentUsername = dispute.agentId?.username || "Unknown Agent";
    const capitalizedUsername =
      agentUsername.charAt(0).toUpperCase() + agentUsername.slice(1).toLowerCase();

    // ✅ Return the response with the updated username
    return NextResponse.json({
      ...dispute.toObject(),
      agentUsername: capitalizedUsername, // ✅ Added capitalized username
    });
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
