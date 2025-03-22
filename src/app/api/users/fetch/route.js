import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch all users
    const users = await User.find({}, "username email role team");

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching users.", error: error.message },
      { status: 500 }
    );
  }
}
