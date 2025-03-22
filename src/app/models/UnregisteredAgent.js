import mongoose from "mongoose";

const unregisteredAgentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    isRegistered: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UnregisteredAgent =
  mongoose.models.UnregisteredAgent ||
  mongoose.model("UnregisteredAgent", unregisteredAgentSchema);

export default UnregisteredAgent;