import mongoose from 'mongoose';

// Document schema for multiple files
const documentSchema = mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
}, {
  _id: true,
  timestamps: true,
});

// Attribute schema for additional key-value pairs
const attributeSchema = mongoose.Schema({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
}, {
  _id: false,
});

const tenderSchema = mongoose.Schema({
  tenderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  documents: [documentSchema],
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  attributes: [attributeSchema],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
tenderSchema.index({ createdAt: -1 });
tenderSchema.index({ dueDate: 1, status: 1 });
tenderSchema.index({ organization: 1 });

const Tender = mongoose.model('Tender', tenderSchema);

export default Tender;