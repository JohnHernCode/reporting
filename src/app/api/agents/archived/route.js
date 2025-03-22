import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";

export async function GET(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch archived agents
    const archivedAgents = await Agent.find({ archived: true });

    return new Response(
      JSON.stringify({ success: true, agents: archivedAgents }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching archived agents:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
