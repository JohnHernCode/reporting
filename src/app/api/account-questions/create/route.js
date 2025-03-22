import { connectToDatabase } from "@/app/lib/mongodb";
import AccountQuestions from "@/app/models/AccountQuestions";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { accountId, accountName, questions, isDefault } = await request.json();

    // Check if a default already exists if trying to create another default
    if (isDefault) {
      const defaultExists = await AccountQuestions.findOne({ default: true });
      if (defaultExists) {
        return NextResponse.json({ message: "Default question set already exists." }, { status: 400 });
      }
    }

    // Check if a question set already exists for the given account
    const existingSet = await AccountQuestions.findOne({ accountId });
    if (existingSet) {
      return NextResponse.json({ message: "Questions for this account already exist." }, { status: 400 });
    }

    const newQuestionSet = new AccountQuestions({
      accountId,
      accountName,
      questions,
      default: isDefault || false,
    });

    await newQuestionSet.save();

    return NextResponse.json({ message: "Question set created successfully." });
  } catch (error) {
    console.error("Error creating question set:", error);
    return NextResponse.json({ message: "Failed to create question set." }, { status: 500 });
  }
}
