import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch unique team names from users
    const teams = await User.distinct("team", { team: { $ne: null } });

    return NextResponse.json({ teams });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching teams.", error: error.message },
      { status: 500 }
    );
  }
}
