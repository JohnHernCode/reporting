import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { username, email, password, role, team } = await request.json();

    // Validate input
    if (!username || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Check if email or username already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { message: "Email is already taken" },
        { status: 409 }
      );
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      team: role === "Agent" ? team : null
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
