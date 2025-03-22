import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Restore the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: updatedUser }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error restoring user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
