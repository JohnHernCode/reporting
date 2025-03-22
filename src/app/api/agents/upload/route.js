import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { agents } = await request.json();

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json(
        { message: "No agents provided or invalid format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bulkOps = agents.map((agent) => ({
      updateOne: {
        filter: { agentEmail: agent.agentEmail },
        update: { $set: agent },
        upsert: true,
      },
    }));

    const result = await Agent.bulkWrite(bulkOps);

    return NextResponse.json({
      message: "Agents imported successfully.",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while importing agents.", error: error.message },
      { status: 500 }
    );
  }
}
