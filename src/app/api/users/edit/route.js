import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  console.log("Received request to update user with ID:", id);

  // Validate ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.error("Invalid or missing user ID:", id);
    return new Response("Invalid or missing user ID", { status: 400 });
  }

  const { username, email, password, role, team } = await req.json();
  console.log("API received fields:", { username, email, password, role, team });

  // Check if at least one field is provided
  if (!username && !email && !password) {
    console.warn("No fields provided to update for user ID:", id);
    return new Response(
      JSON.stringify({ message: "At least one field is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log("Connecting to the database...");
    await connectToDatabase();
    console.log("Connected to the database successfully.");

    const updateFields = {};

    // Add fields to the update object
    if (username) {
      console.log("Updating username:", username);
      updateFields.username = username.toLowerCase();
    }
    if (email) {
      console.log("Updating email:", email);
      updateFields.email = email;
    }

    if (password) {
      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
      console.log("Password hashed successfully.");
    }

    if (role) updateFields.role = role;
    if (role === "Agent") updateFields.team = team;

    console.log("Prepared update fields:", updateFields);

    // Perform the update
    const user = await User.findByIdAndUpdate(id, updateFields, { new: true });
    console.log("Updated user document:", user);

    if (!user) {
      console.error("User not found for ID:", id);
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("User updated successfully for ID:", id);
    return new Response(
      JSON.stringify({ message: "User updated successfully", user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error occurred while updating user:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
