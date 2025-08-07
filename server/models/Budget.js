import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others']
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  threshold: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 80
  }
}, {
  timestamps: true
});

// Ensure one budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);