import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    // Extract the account ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Account ID is required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find and delete the account
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the account.", error: error.message },
      { status: 500 }
    );
  }
}
