// app/api/account-questions/fetch/route.js
import { connectToDatabase } from "@/app/lib/mongodb";
import AccountQuestions from "@/app/models/AccountQuestions";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  try {
    await connectToDatabase();

    let questionsData;
    if (accountId) {
      questionsData = await AccountQuestions.findOne({ accountId });
    }

    if (!questionsData) {
      // Fetch default questions if no specific questions found
      questionsData = await AccountQuestions.findOne({ default: true });
    }

    if (!questionsData) {
      return NextResponse.json({ message: "No questions found." }, { status: 404 });
    }

    return NextResponse.json({ questions: questionsData.questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ message: "Failed to fetch questions." }, { status: 500 });
  }
}
