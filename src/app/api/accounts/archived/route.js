import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";

export async function GET(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch archived accounts
    const archivedAccounts = await Account.find({ archived: true });

    return new Response(
      JSON.stringify({ success: true, accounts: archivedAccounts }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching archived accounts:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
