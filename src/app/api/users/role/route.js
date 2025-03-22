import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await connectToDatabase();

    // ✅ Fetch user role
    const user = await User.findById(userId).select("role");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log("role:", user.role);

    return NextResponse.json({ role: user.role });

  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { message: "Error fetching user role", error: error.message },
      { status: 500 }
    );
  }
}
