import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // Required field
  },
  password: {
    type: String,
    required: true, // Required field
  },
  email: {
    type: String,
    required: true, // Email is also required
  },
  archived: {
    type: Boolean,
    default: false, // Default value for archived status
  },
  loggedIn: {
    type: Boolean,
    default: false, // Default value for logged-in status
  },
  role: {
    type: String,
    enum: ["Admin", "Management", "QA", "Agent"],
    default: "Agent",
  },
  team: { type: String, required: function () { return this.role === "Agent"; } },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
