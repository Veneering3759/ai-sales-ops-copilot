import mongoose from 'mongoose';

const importSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  totalRecords: { type: Number, default: 0 },
  processedRecords: { type: Number, default: 0 },
  duplicatesFound: { type: Number, default: 0 },
  errorMessage: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

export default mongoose.model('Import', importSchema);
