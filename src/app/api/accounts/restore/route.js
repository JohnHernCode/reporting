import { connectToDatabase } from "@/app/lib/mongodb";
import Account from "@/app/models/Account";

export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "Account ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Restore the account
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { archived: false },
      { new: true }
    );

    if (!updatedAccount) {
      return new Response(
        JSON.stringify({ success: false, message: "Account not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, account: updatedAccount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error restoring account:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
