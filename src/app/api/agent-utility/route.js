import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import User from "@/app/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const agents = await Agent.find({ userId: { $exists: false } });
    const created = [];
    const linked = [];
    const skipped = [];

    for (const agent of agents) {
      const username = agent.agentName.toLowerCase().replace(/\s+/g, "");
      const existingUser = await User.findOne({ email: agent.agentEmail });

      if (existingUser) {
        agent.userId = existingUser._id;
        await agent.save();
        linked.push(agent.agentEmail);
        continue;
      }

      const password = await bcrypt.hash("123456", 10);

      const newUser = new User({
        username,
        email: agent.agentEmail,
        password,
        role: "Agent",
        team: "AgentsTeam",
      });

      await newUser.save();
      agent.userId = newUser._id;
      await agent.save();

      created.push(agent.agentEmail);
    }

    

    return NextResponse.json({
      message: "Migration complete",
      createdCount: created.length,
      linkedCount: linked.length,
      skippedCount: skipped.length,
      created,
      linked,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
