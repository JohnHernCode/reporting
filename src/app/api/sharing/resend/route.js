import { connectToDatabase } from "@/app/lib/mongodb";
import Share from "@/app/models/Share";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { shareId, email } = await req.json();

    if (!shareId || !email) {
      return NextResponse.json(
        { message: "Share ID and recipient email are required." },
        { status: 400 }
      );
    }

    // Find the existing share
    const share = await Share.findById(shareId);

    if (!share) {
      return NextResponse.json(
        { message: "Share record not found." },
        { status: 404 }
      );
    }

    // Ensure share has not expired
    if (new Date() > new Date(share.expiration)) {
      return NextResponse.json(
        { message: "This share has expired and cannot be resent." },
        { status: 400 }
      );
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resent: You have been shared a recording",
      text: `Hi,

This is a reminder that you have been granted access to a recording. To access it, click the link below and enter your password.

🔗 Link: ${process.env.APP_URL}/authentication/lock-screen
🔑 Password: ${share.password}

This link expires on: ${new Date(share.expiration).toLocaleString()}

Regards,
CuraCall
https://curacall.com`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email resent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error resending share email:", error);
    return NextResponse.json(
      { message: "Error resending share email.", error: error.message },
      { status: 500 }
    );
  }
}
