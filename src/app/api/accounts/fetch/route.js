import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch all accounts
    const accounts = await Account.find({});

    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching accounts.", error: error.message },
      { status: 500 }
    );
  }
}
