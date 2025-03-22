import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongodb";
import Dispute from "@/app/models/Dispute";
import Grade from "@/app/models/Grade";
import User from "@/app/models/User"; // ✅ Import User model
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { gradeId, message } = await req.json();

    if (!gradeId || !message) {
      return NextResponse.json({ message: "Grade ID and dispute message are required." }, { status: 400 });
    }

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return NextResponse.json({ message: `Grade not found for ID: ${gradeId}` }, { status: 404 });
    }

    // ✅ Generate unique Case ID
    const caseId = uuidv4();

    // ✅ Create and save dispute
    const newDispute = new Dispute({
      caseId,
      gradeId,
      agentId: session.user.id,
      messages: [
        {
          senderId: session.user.id,
          senderRole: "Agent",
          message,
          timestamp: new Date(),
        },
      ],
      status: "Open",
    });

    await newDispute.save();

    // ✅ Fetch all Admin users
    const admins = await User.find({ role: "Admin" }).select("email");
    const adminEmails = admins.map((admin) => admin.email);

    console.log("Admin Emails:", adminEmails); // 🛠 Debugging log

    if (!adminEmails.length) {
      console.error("🚨 No admins found in the database!");
      return NextResponse.json({ message: "No admin users found" }, { status: 500 });
    }

    // ✅ Send Email Notification to all Admins
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails.join(","), // ✅ Send to all Admins
      subject: "New Dispute Submitted",
      text: `A new dispute has been submitted by an agent.

📌 Dispute ID: ${newDispute.caseId}
🔗 View Dispute: ${process.env.APP_URL}/disputes/${newDispute.caseId}

Message from Agent:
"${message}"

Please review and resolve the dispute.

Regards,
CuraCall`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Dispute submitted successfully." }, { status: 201 });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
