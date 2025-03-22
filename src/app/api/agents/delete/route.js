import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Agent ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedAgent = await Agent.findByIdAndDelete(id);

    if (!deletedAgent) {
      return NextResponse.json(
        { message: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agent deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while deleting the agent.", error: error.message },
      { status: 500 }
    );
  }
}
