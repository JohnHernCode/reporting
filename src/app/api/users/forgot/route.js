import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return new Response(
      JSON.stringify({ message: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connectToDatabase();

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Save the hashed token and its expiry to the user's record
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send reset link (Placeholder for email logic)
    console.log(
      `Password reset token for ${email}: ${resetToken} (use this for testing)`
    );

    // In production, you would send an email containing the reset link.
    // Example: `https://yourdomain.com/reset-password?token=${resetToken}`

    return new Response(
      JSON.stringify({ message: "Password reset email sent successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending password reset:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH(req) {
  const { email, token, newPassword } = await req.json();

  if (!email || !newPassword) {
    return new Response(
      JSON.stringify({ message: "Email and new password are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connectToDatabase();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Uncomment this block when re-enabling token validation
    /*
    if (!token) {
      return new Response(
        JSON.stringify({ message: "Token is required for password reset" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify the token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    */

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear any existing token
    user.resetPasswordExpires = undefined;
    await user.save();

    return new Response(
      JSON.stringify({ message: "Password reset successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

