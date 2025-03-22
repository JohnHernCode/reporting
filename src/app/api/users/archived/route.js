import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function GET(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch archived users
    const archivedUsers = await User.find({ archived: true });

    return new Response(
      JSON.stringify({ success: true, users: archivedUsers }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching archived users:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
