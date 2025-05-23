import mongoose from 'mongoose';

const tenderAttributeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  }
});

const tenderDocumentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  }
});

const tenderSchema = mongoose.Schema(
  {
    tenderId: {
      type: String,
      required: true,
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
    documents: [tenderDocumentSchema],
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
    attributes: [tenderAttributeSchema],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tender = mongoose.model('Tender', tenderSchema);

export default Tender;