import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Mark the user as archived
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User archived successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error archiving user:", error);
    return NextResponse.json(
      { message: "An error occurred while archiving the user.", error: error.message },
      { status: 500 }
    );
  }
}
