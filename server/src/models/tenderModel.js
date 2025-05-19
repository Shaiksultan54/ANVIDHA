import mongoose from 'mongoose';

// Generate tender ID
function generateTenderId() {
  // Format: TDR-YEAR-RANDOM (e.g., TDR-2023-12345)
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `TDR-${year}-${random}`;
}

const tenderSchema = mongoose.Schema(
  {
    tenderId: {
      type: String,
      default: generateTenderId,
      unique: true,
    },
    organization: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Tender = mongoose.model('Tender', tenderSchema);

export default Tender;