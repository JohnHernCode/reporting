import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { agentEmail, newName } = await request.json();

    if (!agentEmail || !newName) {
      return NextResponse.json(
        { message: "Both agentEmail and newName are required to update." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedAgent = await Agent.findOneAndUpdate(
      { agentEmail }, // Find by email
      { agentName: newName }, // Update name
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { message: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agent name updated successfully.", agent: updatedAgent });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while updating the agent.", error: error.message },
      { status: 500 }
    );
  }
}
