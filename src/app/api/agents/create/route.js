import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { agentName, agentEmail } = await request.json();

    if (!agentName || !agentEmail) {
      return NextResponse.json(
        { message: "Both agentName and agentEmail are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ agentEmail });
    if (existingAgent) {
      return NextResponse.json(
        { message: "Agent with this email already exists.", agent: existingAgent },
        { status: 409 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: agentEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists.", user: existingUser },
        { status: 409 }
      );
    }

    // Generate default values
    const generatedUsername = agentName.toLowerCase().replace(/\s+/g, "");
    const defaultPassword = "123456";
    const defaultRole = "Agent";
    const defaultTeam = "AgentsTeam";

    // Create user
    const newUser = new User({
      username: generatedUsername,
      email: agentEmail,
      password: defaultPassword,
      role: defaultRole,
      team: defaultTeam,
    });

    await newUser.save();

    // Create agent and link userId
    const newAgent = new Agent({
      agentName,
      agentEmail,
      userId: newUser._id,
    });

    await newAgent.save();

    return NextResponse.json({
      message: "Agent and User created successfully.",
      agent: newAgent,
    });
  } catch (error) {
    console.error("Error creating agent/user:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the agent.", error: error.message },
      { status: 500 }
    );
  }
}
