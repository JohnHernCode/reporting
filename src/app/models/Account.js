import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true, // Required field for the account name
  },
  dnis: {
    type: String,
    required: true, // Required field for the DNIS
  },
  testingNumber: {
    type: String, // Optional field for testing numbers
  },
  archived: {
    type: Boolean,
    default: false, // Default value for archived status
  },
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
