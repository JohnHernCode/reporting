import { connectToDatabase } from "@/app/lib/mongodb";
import Recording from "@/app/models/Recording";
import Agent from "@/app/models/Agent";
import UnregisteredAgent from "@/app/models/UnregisteredAgent";

// Explicitly mark this route as dynamic
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const account = decodeURIComponent(searchParams.get("account") || ""); // Decode account
    const agent = searchParams.get("agent") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build the query
    const query = {};

    if (account) {
      query.account = account; // Exact match for the account
    }
    if (agent) {
      query.agent = { $regex: new RegExp(`^${agent}$`, "i") }; // Case-insensitive exact match
    }
    if (startDate && endDate) {
      query.uploadDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log("Query Parameters:", { account, agent, startDate, endDate });
    console.log("MongoDB Query:", query);

    // Fetch all matching recordings
    const recordings = await Recording.find(query).sort({ uploadDate: -1 });

    console.log("Fetched Recordings:", recordings);

    // ✅ Identify unregistered agents
    const seen = new Set(); // prevent duplicate checks in same batch

    for (const rec of recordings) {
      const name = rec.agent?.replace(/\s+/g, " ").trim();
      if (!name || seen.has(name.toLowerCase())) continue;

      seen.add(name.toLowerCase());

      const agentExists = await Agent.findOne({
        agentName: { $regex: `^${name}$`, $options: 'i' },
      });
      if (!agentExists) {
        const alreadyUnregistered = await UnregisteredAgent.findOne({ fullName: name });
        if (!alreadyUnregistered) {
          console.log(`🚨 Adding unregistered agent: ${name}`);
          await UnregisteredAgent.create({ fullName: name });
        }
      }
    }

    // Return recordings
    return new Response(
      JSON.stringify({
        recordings,
        total: recordings.length, // Provide total count for frontend
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch recordings." }),
      { status: 500 }
    );
  }
}
