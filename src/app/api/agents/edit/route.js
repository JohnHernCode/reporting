import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { agentName, agentEmail } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Agent ID is required." },
        { status: 400 }
      );
    }

    if (!agentName && !agentEmail) {
      return NextResponse.json(
        { message: "At least one field (agentName or agentEmail) is required to update." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { ...(agentName && { agentName }), ...(agentEmail && { agentEmail }) },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { message: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agent updated successfully.", agent: updatedAgent });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while updating the agent.", error: error.message },
      { status: 500 }
    );
  }
}
