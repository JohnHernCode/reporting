import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      console.error("No token provided");
      return NextResponse.json(
        { message: "Token is required." },
        { status: 400 }
      );
    }

    // Decode the token
    const decodedToken = await getToken({
      token,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("Decoded Token:", decodedToken); // Debug

    if (!decodedToken) {
      console.error("Invalid token");
      return NextResponse.json(
        { message: "Invalid token." },
        { status: 401 }
      );
    }

    return NextResponse.json({ email: decodedToken.email });
  } catch (error) {
    console.error("Error decoding token:", error.message);
    return NextResponse.json(
      { message: "An error occurred while decoding the token." },
      { status: 500 }
    );
  }
}

