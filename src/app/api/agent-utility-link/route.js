import { connectToDatabase } from "@/app/lib/mongodb";
import Agent from "@/app/models/Agent";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // 🔹 Step 1: Pull all agents & users
    const agents = await Agent.find({});
    const users = await User.find({});
    console.log(`🔄 Found ${agents.length} agents & ${users.length} users.`);

    // 🔹 Step 2: Create a user lookup dictionary (email -> userId)
    const userLookup = {};
    users.forEach((user) => {
      userLookup[user.email.trim().toLowerCase()] = user._id.toString(); // 🔥 Store as a string
    });

    let updates = [];
    let notFound = [];

    // 🔹 Step 3: Assign userId to each agent
    for (const agent of agents) {
      const matchedUserId = userLookup[agent.agentEmail.trim().toLowerCase()];

      if (matchedUserId) {
        console.log(`✅ Matching ${agent.agentEmail} -> User ${matchedUserId}`);

        // 🔥 Step 4: Push bulk updates, ensuring userId is defined
        updates.push({
          updateOne: {
            filter: { _id: agent._id },
            update: { $set: { userId: matchedUserId } }, // ✅ Always use `$set`
          },
        });
      } else {
        notFound.push(agent.agentEmail);
      }
    }

    // 🔹 Step 5: Perform bulk update only if updates exist
    if (updates.length > 0) {
      const updateResult = await Agent.bulkWrite(updates);
      console.log(`🔄 Bulk Update Result:`, updateResult);
    } else {
      console.warn("⚠️ No updates performed, all agents already linked.");
    }

    return NextResponse.json({
      message: "Linking complete",
      linked: updates.length,
      notFound,
    });
  } catch (error) {
    console.error("🚨 Error linking agents to users:", error);
    return NextResponse.json(
      { message: "Linking failed", error: error.message },
      { status: 500 }
    );
  }
}
