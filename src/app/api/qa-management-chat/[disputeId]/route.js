import { connectToDatabase } from "@/app/lib/mongodb";
import QAManagementChat from "@/app/models/QAManagementChat";
import Dispute from "@/app/models/Dispute";
import Agent from "@/app/models/Agent";
import User from "@/app/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Grade from "@/app/models/Grade";

export async function GET(req, { params }) {
  await connectToDatabase();
  const { disputeId } = params;

  try {
    // ✅ Fetch dispute details without population
    const dispute = await Dispute.findOne({ caseId: disputeId });

    if (!dispute) {
      console.log(`❌ Dispute not found for caseId: ${disputeId}`);
      return new Response(JSON.stringify({ message: "Dispute not found" }), { status: 404 });
    }

    console.log("📌 Full Dispute Record:", dispute);

    // ✅ Convert `ObjectId` fields to strings
    const agentIdString = dispute.agentId ? dispute.agentId.toString() : null;
    const gradeRecord = await Grade.findById(dispute.gradeId);

    if (!gradeRecord) {
      console.log("❌ Grade record not found");
      return new Response(JSON.stringify({ message: "Grade record not found" }), { status: 404 });
    }

    const qaIdString = gradeRecord.evaluatorId ? gradeRecord.evaluatorId.toString() : null;

    console.log("📌 Agent ID:", agentIdString);
    console.log("📌 QA ID:", qaIdString);

    // ✅ Fetch Agent Name (Fixing `Unknown Agent` issue)
    let agentName = "Unknown Agent";
    if (agentIdString) {
      const agent = await Agent.findById(agentIdString);
      agentName = agent?.agentName || "Unknown Agent";
    }

    // ✅ Fetch Evaluator (QA) Name
    let evaluatorName = "Unknown QA";
    let evaluatorMongoId = null;
    if (qaIdString) {
      const evaluator = await User.findById(qaIdString);
      if (evaluator) {
        evaluatorName = evaluator.username;
        evaluatorMongoId = evaluator._id;
      }
    }

    // ✅ Get the currently logged-in user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      console.log("❌ Unauthorized request");
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const managementUser = await User.findById(session.user.id);
    if (!managementUser) {
      console.log("❌ Management user not found");
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const managementName = managementUser.username;

    console.log(`📌 Dispute ID: ${dispute.caseId}`);
    console.log(`📌 Agent Name: ${agentName}`);
    console.log(`📌 QA Name: ${evaluatorName}`);
    console.log(`📌 Manager Name: ${managementName}`);

    // ✅ Fetch or Create Chat Manually
    let chat = await QAManagementChat.findOne({
      disputeId,
      qaId: evaluatorMongoId,
      managementId: managementUser._id,
    }).populate("messages.senderId", "username role");

    if (!chat) {
      console.log("💬 No existing chat, creating one...");

      // 🚀 Create a new chat entry
      chat = new QAManagementChat({
        disputeId: dispute.caseId,
        qaId: evaluatorMongoId,
        managementId: managementUser._id,
        messages: [],
      });

      await chat.save();
      console.log("✅ Chat Created:", chat);
    }

    const formattedMessages = (chat?.messages || []).map(msg => ({
      _id: msg._id,
      senderRole: msg.senderRole,
      message: msg.message,
      timestamp: msg.timestamp,
      senderUsername: msg.senderId?.username || "",
      senderId: msg.senderId?._id || msg.senderId,
    }));

    return new Response(
      JSON.stringify({
        dispute: {
          disputeId: dispute.caseId,
          agentName,
          evaluatorName,
          managementName,
        },
        chat: {
          messages: formattedMessages,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { disputeId } = params;

  try {
    const { message } = await req.json();

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // Get user details
    const sender = await User.findById(session.user.id);
    if (!sender) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // Find or create the chat
    let chat = await QAManagementChat.findOne({ disputeId });
    if (!chat) {
      return new Response(JSON.stringify({ message: "Chat not found" }), { status: 404 });
    }

    // Add new message to chat
    const newMessage = {
      senderId: sender._id,
      senderRole: sender.role || "Admin", // Set role dynamically
      message,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    return new Response(JSON.stringify({ message: "Message sent", newMessage }), { status: 200 });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
