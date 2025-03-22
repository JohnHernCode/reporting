import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    // Insert dummy user with all required fields
    const user = await User.create({
      username: "testuser123", // Required field
      password: "hashed_password_example", // Replace with hashed password
      email: "test@example.com", // Required field
    });

    return Response.json({ message: "User created successfully!", user });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ message: "Failed to create user", error }, { status: 500 });
  }
}
