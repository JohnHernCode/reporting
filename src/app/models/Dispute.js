import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    caseId: { type: String, unique: true, required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true },
    evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The evaluator who graded
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
        senderRole: { type: String, enum: ["Agent", "Admin"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Dispute = mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);
export default Dispute;
