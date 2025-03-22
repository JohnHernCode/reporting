import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Get only disputes for this user that are still "Open"
    const disputes = await Dispute.find({ agentId: session.user.id, status: "Open" })
      .select("_id status createdAt")
      .lean();

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("Error fetching user disputes:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
