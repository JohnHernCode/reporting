import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { message: "Account ID is required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find and update the account
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true } // Return the updated document
    );

    if (!updatedAccount) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Account archived successfully.",
      account: updatedAccount,
    });
  } catch (error) {
    console.error("Error archiving account:", error);
    return NextResponse.json(
      { message: "An error occurred while archiving the account.", error: error.message },
      { status: 500 }
    );
  }
}
