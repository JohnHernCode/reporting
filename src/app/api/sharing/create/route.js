import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Share from "@/app/models/Share";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
  try {
    // Get the session (authenticated user)
    const session = await getServerSession(authOptions); // ✅ FIXED: No need to pass `req, res`

    console.log("Session data received:", session); // ✅ Debugging session data

    // Ensure user is authenticated
    if (!session || !session.user || !session.user.id) {
      console.error("Unauthorized: No session found or missing user ID.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id; // ✅ Extract logged-in user's ID

    // Parse request body
    const body = await req.json();
    const { recordingId, objectKey, email } = body;

    // Validate request data
    if (!recordingId || !objectKey || !email) {
      return new Response(
        JSON.stringify({ message: "Recording ID, Object Key, and email are required." }),
        { status: 400 }
      );
    }

    // Generate a secure password
    const password = crypto.randomBytes(8).toString("hex");

    // Set expiration (48 hours)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 48);

    // Create share entry with userId
    const newShare = new Share({
      userId, // ✅ Ensure we store the user who shared
      password,
      recordingId,
      objectKey,
      email,
      expiration,
    });

    await newShare.save();

    return new Response(JSON.stringify({ message: "Share created successfully." }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating share:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error.", error: error.message }), {
      status: 500,
    });
  }
}
