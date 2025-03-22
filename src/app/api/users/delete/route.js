import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import mongoose from "mongoose";

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Extract the 'id' from the query string

  console.log("Delete API triggered with ID:", id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return new Response("Invalid or missing user ID", { status: 400 });
  }

  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
