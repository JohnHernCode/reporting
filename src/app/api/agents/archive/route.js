import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Agent ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { message: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Agent archived successfully.",
      agent: updatedAgent,
    });
  } catch (error) {
    console.error("Error archiving agent:", error);
    return NextResponse.json(
      { message: "An error occurred while archiving the agent.", error: error.message },
      { status: 500 }
    );
  }
}
