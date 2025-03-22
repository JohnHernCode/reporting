import Share from "@/app/models/Share";

export async function POST(req) {
  try {
    // Parse the request body
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the share record
    const shareRecord = await Share.findOne({ email, password });

    if (!shareRecord) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the share record is expired
    if (new Date() > shareRecord.expiration) {
      return new Response(
        JSON.stringify({ message: "Share link has expired." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Respond with the share record ID
    return new Response(
      JSON.stringify({ shareId: shareRecord._id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
