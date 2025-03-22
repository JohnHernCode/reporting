import mongoose from "mongoose";

const qaManagementChatSchema = new mongoose.Schema(
  {
    disputeId: { type: String, required: true },  // 🔹 Store as String instead of ObjectId
    qaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    managementId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
        senderRole: { type: String, enum: ["QA", "Admin"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


const QAManagementChat =
  mongoose.models.QAManagementChat || mongoose.model("QAManagementChat", qaManagementChatSchema);

export default QAManagementChat;
