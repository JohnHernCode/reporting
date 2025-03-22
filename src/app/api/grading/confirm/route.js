// /app/api/grading/confirm/route.js

import { connectToDatabase } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectToDatabase();
    const { gradeId } = await req.json();

    if (!gradeId) {
      return NextResponse.json({ message: "Missing gradeId." }, { status: 400 });
    }

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return NextResponse.json({ message: "Grade not found." }, { status: 404 });
    }

    grade.isConfirmed = true;  // ✅ Mark as confirmed
    await grade.save();

    return NextResponse.json({ message: "Grade confirmed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
