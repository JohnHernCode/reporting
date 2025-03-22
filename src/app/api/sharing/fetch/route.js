import { connectToDatabase } from "@/app/lib/mongodb";
import Share from "@/app/models/Share";
import User from "@/app/models/User"; // Import the User model
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch shares and populate user details
    const shares = await Share.find({})
      .populate({
        path: "userId",
        select: "username email", // Only fetch necessary fields
        model: User, // Explicitly specify the model
      })
      .populate("recordingId");

    return NextResponse.json({ shares });
  } catch (error) {
    console.error("Error fetching shares:", error);
    return NextResponse.json(
      { message: "Error fetching shares.", error: error.message },
      { status: 500 }
    );
  }
}
