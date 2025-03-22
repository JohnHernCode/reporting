import mongoose from "mongoose";

const ShareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recordingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  objectKey: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  expiration: {
    type: Date,
    required: true,
  },
});

export default mongoose.models.Share || mongoose.model("Share", ShareSchema);
