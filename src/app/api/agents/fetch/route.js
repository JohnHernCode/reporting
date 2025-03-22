import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const agents = await Agent.find();

    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching agents.", error: error.message },
      { status: 500 }
    );
  }
}
