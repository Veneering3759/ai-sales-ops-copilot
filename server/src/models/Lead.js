import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  firstName: String,
  lastName: String,
  company: String,
  title: String,
  phone: String,
  linkedin: String,
  status: { type: String, default: 'new' },
  
  // Enrichment fields
  industry: String,
  seniority: String,
  emailValid: Boolean,
  
  // Scoring
  score: { type: Number, default: 0 },
  scoreBreakdown: {
    email: Number,
    title: Number,
    company: Number,
    phone: Number,
    linkedin: Number,
    completeness: Number
  },
  nextBestAction: String,
  
  // Metadata
  importId: { type: mongoose.Schema.Types.ObjectId, ref: 'Import' },
  rawData: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

leadSchema.index({ email: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ score: -1 });

export default mongoose.model('Lead', leadSchema);
