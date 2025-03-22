import mongoose from 'mongoose';

const { Schema } = mongoose;

const recordingSchema = new Schema({
  agent: {
    type: String,
    required: true,
  },
  dnis: {
    type: String,
    required: true,
  },
  callTime: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  testingNumber: {
    type: String,
  },
  duration: {
    type: String,
  },
  objectKey: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Recording || mongoose.model('Recording', recordingSchema);
