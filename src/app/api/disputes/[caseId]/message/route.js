import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import User from "@/app/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      console.error("Unauthorized: No session found or missing user ID.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;
    const { message } = await req.json();

    console.log(`📩 New message for caseId: ${caseId}, from: ${session.user.id}`);

    if (!caseId) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    // ✅ Find the dispute by `caseId`
    const dispute = await Dispute.findOne({ caseId });

    if (!dispute) {
      console.error(`🚨 Dispute not found for caseId: ${caseId}`);
      return NextResponse.json({ message: `Dispute not found for ID: ${caseId}` }, { status: 404 });
    }

    // ✅ Fetch user role
    const user = await User.findById(session.user.id);
    const senderRole = user.role === "Admin" ? "Admin" : "Agent"; // ✅ Fix the incorrect "User" role

    console.log(`🔍 Sender Role Mapped: ${senderRole}`);

    // ✅ Add the message to the dispute
    dispute.messages.push({
      senderId: session.user.id,
      senderRole, // ✅ Use the corrected senderRole ("Admin" or "Agent")
      message,
      timestamp: new Date(),
    });

    await dispute.save();

    return NextResponse.json({ message: "Message added successfully." }, { status: 201 });
  } catch (error) {
    console.error("Error adding message to dispute:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
