import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";

export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "Agent ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Restore the agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedAgent) {
      return new Response(
        JSON.stringify({ success: false, message: "Agent not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, agent: updatedAgent }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error restoring agent:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
