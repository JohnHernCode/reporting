import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function PATCH(request) {
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

    // Extract fields to update from the request body
    const { accountName, dnis, testingNumber } = await request.json();

    // Validate input
    if (!accountName && !dnis && !testingNumber) {
      return NextResponse.json(
        { message: "At least one field (accountName, dnis, or testingNumber) is required to update." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Build the update object dynamically
    const updateFields = {};
    if (accountName) updateFields.accountName = accountName;
    if (dnis) updateFields.dnis = dnis;
    if (testingNumber !== undefined) updateFields.testingNumber = testingNumber;

    // Find and update the account
    const updatedAccount = await Account.findByIdAndUpdate(id, updateFields, {
      new: true, // Return the updated document
    });

    if (!updatedAccount) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Account updated successfully.",
      account: updatedAccount,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the account.", error: error.message },
      { status: 500 }
    );
  }
}
