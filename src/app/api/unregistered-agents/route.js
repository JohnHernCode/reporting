
import { connectToDatabase } from "@/app/lib/mongodb";
import UnregisteredAgent from "@/app/models/UnregisteredAgent";

export async function GET() {
  await connectToDatabase();

  try {
    const agents = await UnregisteredAgent.find({ isRegistered: false, isArchived: false }).sort({ createdAt: -1 });
    return new Response(JSON.stringify(agents), { status: 200 });
  } catch (error) {
    console.error("GET /api/unregistered-agents error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch unregistered agents." }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDatabase();

  try {
    const { fullName } = await req.json();
    if (!fullName) {
      return new Response(JSON.stringify({ message: "Full name is required." }), { status: 400 });
    }

    const existing = await UnregisteredAgent.findOne({ fullName });
    if (existing) {
      return new Response(JSON.stringify({ message: "Agent already exists." }), { status: 409 });
    }

    const newAgent = new UnregisteredAgent({ fullName });
    await newAgent.save();
    return new Response(JSON.stringify(newAgent), { status: 201 });
  } catch (error) {
    console.error("POST /api/unregistered-agents error:", error);
    return new Response(JSON.stringify({ message: "Failed to add unregistered agent." }), { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDatabase();

  try {
    const { fullName } = await req.json();
    if (!fullName) {
      return new Response(JSON.stringify({ message: "Full name is required for deletion." }), { status: 400 });
    }

    const deleted = await UnregisteredAgent.findOneAndDelete({
      fullName: { $regex: new RegExp(`^${fullName}$`, "i") }, // 👈 Case-insensitive exact match
    });

    if (!deleted) {
      return new Response(JSON.stringify({ message: "Unregistered agent not found." }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Unregistered agent deleted." }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/unregistered-agents error:", error);
    return new Response(JSON.stringify({ message: "Failed to delete agent." }), { status: 500 });
  }
}