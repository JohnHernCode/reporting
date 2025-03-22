import mongoose from "mongoose";

const GradesSchema = new mongoose.Schema(
  {
      recordingId: { type: mongoose.Schema.Types.ObjectId, ref: "Recording", required: true },
      agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who graded the recording
      answers: { type: Object, required: true },  // Store answers as key-value pairs
      score: { type: Number, required: true, min: 0, max: 100 },  // Grade score
      qaFeedback: { type: String, required: false },
      feedback: { type: String, required: false },  // Optional comments
      isConfirmed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model("Grade", GradesSchema);
