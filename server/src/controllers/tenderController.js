import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import Tender from '../models/tenderModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all tenders
// @route   GET /api/tenders
// @access  Private
export const getTenders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.organization) {
    filter.organization = { $regex: req.query.organization, $options: 'i' };
  }
  if (req.query.search) {
    filter.$or = [
      { tenderId: { $regex: req.query.search, $options: 'i' } },
      { organization: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const tenders = await Tender.find(filter)
    .sort({ dueDate: 1 }) // Sort by due date ascending
    .populate('submittedBy', 'name email')
    .skip(skip)
    .limit(limit);

  const total = await Tender.countDocuments(filter);

  res.json({
    tenders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single tender
// @route   GET /api/tenders/:id
// @access  Private
export const getTenderById = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id)
    .populate('submittedBy', 'name email');

  if (tender) {
    res.json(tender);
  } else {
    res.status(404);
    throw new Error('Tender not found');
  }
});

// @desc    Create a tender
// @route   POST /api/tenders
// @access  Private
export const createTender = asyncHandler(async (req, res) => {
  const { tenderId, organization, description, dueDate, price, attributes } = req.body;

  if (!tenderId) {
    res.status(400);
    throw new Error('Tender ID is required');
  }

  // Check for existing tender with the same ID
  const existing = await Tender.findOne({ tenderId });
  if (existing) {
    res.status(409); // Conflict
    throw new Error('Tender ID already exists');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one document');
  }

  let parsedAttributes = [];
  if (attributes) {
    try {
      parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      if (Array.isArray(parsedAttributes)) {
        parsedAttributes = parsedAttributes.filter(attr =>
          attr && typeof attr === 'object' && attr.key && attr.value
        );
      } else {
        parsedAttributes = [];
      }
    } catch (error) {
      console.error('Error parsing attributes:', error);
      parsedAttributes = [];
    }
  }

  const uploadedDocuments = [];
  const uploadPromises = req.files.map(async (file) => {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'tenders',
        resource_type: 'auto',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      });
      fs.unlinkSync(file.path);
      return {
        filename: result.public_id,
        originalName: file.originalname,
        url: result.secure_url,
        size: file.size,
        mimetype: file.mimetype,
        cloudinaryId: result.public_id,
      };
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  });

  try {
    const documents = await Promise.all(uploadPromises);
    uploadedDocuments.push(...documents);

    const tender = await Tender.create({
      tenderId,
      organization,
      description,
      dueDate,
      price: price || 0,
      documents: uploadedDocuments,
      attributes: parsedAttributes,
      submittedBy: req.user._id,
    });

    const populatedTender = await Tender.findById(tender._id)
      .populate('submittedBy', 'name email');

    res.status(201).json(populatedTender);
  } catch (error) {
    // Clean up files on error
    for (const doc of uploadedDocuments) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryId);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw error;
  }
});

// @desc    Update tender
// @route   PUT /api/tenders/:id
// @access  Private/Admin or Owner
export const updateTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

  if (!tender) {
    res.status(404);
    throw new Error('Tender not found');
  }

  const isAdmin = req.user.role === 'admin'|| req.user.role ==='user';
  const isOwner = tender.submittedBy.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error('Not authorized to update this tender');
  }

  const { tenderId, organization, description, dueDate, price, attributes } = req.body;

  // Handle new documents if uploaded
  let newDocuments = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tenders',
          resource_type: 'auto',
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        });
        fs.unlinkSync(file.path);
        return {
          filename: result.public_id,
          originalName: file.originalname,
          url: result.secure_url,
          size: file.size,
          mimetype: file.mimetype,
          cloudinaryId: result.public_id,
        };
      } catch (error) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    });

    try {
      newDocuments = await Promise.all(uploadPromises);

      // Delete old documents
      for (const doc of tender.documents) {
        try {
          await cloudinary.uploader.destroy(doc.cloudinaryId);
        } catch (cleanupError) {
          console.error('Error deleting old document:', cleanupError);
        }
      }
    } catch (error) {
      for (const doc of newDocuments) {
        try {
          await cloudinary.uploader.destroy(doc.cloudinaryId);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      throw error;
    }
  }

  // Only admin can update attributes
  let parsedAttributes = tender.attributes;
  if (isAdmin && attributes !== undefined) {
    try {
      parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      if (Array.isArray(parsedAttributes)) {
        parsedAttributes = parsedAttributes.filter(attr =>
          attr && typeof attr === 'object' && attr.key && attr.value
        );
      } else {
        parsedAttributes = [];
      }
    } catch (error) {
      console.error('Error parsing attributes:', error);
    }
  }

  // Update tender fields
  tender.tenderId = tenderId || tender.tenderId;
  tender.organization = organization || tender.organization;
  tender.description = description || tender.description;
  tender.dueDate = dueDate || tender.dueDate;
  tender.price = price !== undefined ? price : tender.price;
  tender.documents = newDocuments.length > 0 ? newDocuments : tender.documents;

  if (isAdmin) {
    tender.attributes = parsedAttributes;
  }

  const updatedTender = await tender.save();
  const populatedTender = await Tender.findById(updatedTender._id)
    .populate('submittedBy', 'name email');

  res.json(populatedTender);
});


// @desc    Update tender status
// @route   PATCH /api/tenders/:id/status
// @access  Private/Admin
export const updateTenderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const tender = await Tender.findById(req.params.id)
    .populate('submittedBy', 'name email');

  if (tender) {
    tender.status = status;
    const updatedTender = await tender.save();
    res.json(updatedTender);
  } else {
    res.status(404);
    throw new Error('Tender not found');
  }
});

// @desc    Delete a tender
// @route   DELETE /api/tenders/:id
// @access  Private/Admin
export const deleteTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

  if (tender) {
    // Delete all documents from Cloudinary
    const deletePromises = tender.documents.map(async (doc) => {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryId);
      } catch (error) {
        console.error(`Error deleting document ${doc.cloudinaryId}:`, error);
      }
    });

    await Promise.all(deletePromises);

    // Delete tender from database
    await tender.deleteOne();
    res.json({ message: 'Tender removed' });
  } else {
    res.status(404);
    throw new Error('Tender not found');
  }
});

// @desc    Delete specific document from tender
// @route   DELETE /api/tenders/:id/documents/:documentId
// @access  Private/Admin or Owner
export const deleteDocument = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

  if (!tender) {
    res.status(404);
    throw new Error('Tender not found');
  }

  // Check if user is admin or owner
  if (req.user.role !== 'admin' && tender.submittedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this tender');
  }

  const documentId = req.params.documentId;
  const documentIndex = tender.documents.findIndex(doc => doc._id.toString() === documentId);

  if (documentIndex === -1) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Don't allow deletion if it's the last document
  if (tender.documents.length === 1) {
    res.status(400);
    throw new Error('Cannot delete the last document. At least one document is required.');
  }

  const documentToDelete = tender.documents[documentIndex];

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(documentToDelete.cloudinaryId);
    
    // Remove from tender documents array
    tender.documents.splice(documentIndex, 1);
    await tender.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500);
    throw new Error('Failed to delete document');
  }
});