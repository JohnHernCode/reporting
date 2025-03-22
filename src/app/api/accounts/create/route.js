import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { accountName, dnis, testingNumber } = await request.json();

    // Validate required input
    if (!accountName || !dnis) {
      return NextResponse.json(
        { message: "Both accountName and dnis are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Create a new account
    const newAccount = new Account({
      accountName,
      dnis,
      ...(testingNumber && { testingNumber }), // Only include testingNumber if provided
    });
    await newAccount.save();

    return NextResponse.json({
      message: "Account created successfully.",
      account: newAccount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while creating the account.", error: error.message },
      { status: 500 }
    );
  }
}
