import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true, // Required field for the agent name
  },
  agentEmail: {
    type: String,
    required: true, // Required field for the agent email
    unique: true, // Ensure agent email is unique
  },
  archived: {
    type: Boolean,
    default: false, // Default value for archived status
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: false
  },
});

export default mongoose.models.Agent || mongoose.model("Agent", AgentSchema);
