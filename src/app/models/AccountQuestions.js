// models/AccountQuestions.js
import mongoose from 'mongoose';

const AccountQuestionsSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: false },
  accountName: { type: String, required: false }, // Alternative to accountId
  questions: { type: [String], required: true },
  default: { type: Boolean, default: false },
});

export default mongoose.models.AccountQuestions || mongoose.model('AccountQuestions', AccountQuestionsSchema);
