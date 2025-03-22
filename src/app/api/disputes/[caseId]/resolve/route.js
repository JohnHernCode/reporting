import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import User from "@/app/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;

    // ✅ Ensure only Admins can resolve disputes
    const user = await User.findById(session.user.id).select("role");
    if (user.role !== "Admin") {
      return NextResponse.json({ message: "Permission Denied" }, { status: 403 });
    }

    const dispute = await Dispute.findOneAndUpdate(
      { caseId },
      { status: "Resolved" },
      { new: true }
    );

    if (!dispute) {
      return NextResponse.json({ message: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dispute marked as resolved." });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
