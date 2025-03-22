import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { accounts } = await request.json();

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { message: "No accounts provided or invalid format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bulkOps = accounts.map(account => ({
      updateOne: {
        filter: { dnis: account.dnis },
        update: { $set: account },
        upsert: true,
      },
    }));

    const result = await Account.bulkWrite(bulkOps);

    return NextResponse.json({
      message: "Accounts imported successfully.",
      result,
    });
  } catch (error) {
    console.error("Error importing accounts:", error);
    return NextResponse.json(
      { message: "An error occurred while importing accounts.", error: error.message },
      { status: 500 }
    );
  }
}

