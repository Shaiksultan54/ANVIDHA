import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import Tender from '../models/tenderModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all tenders
// @route   GET /api/tenders
// @access  Private
export const getTenders = asyncHandler(async (req, res) => {
  const tenders = await Tender.find({});
  res.json(tenders);
});

// @desc    Get single tender
// @route   GET /api/tenders/:id
// @access  Private
export const getTenderById = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

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
  const { organization, description, dueDate, price } = req.body;

  // Check if file exists
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a document');
  }

  // Upload file to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'tenders',
    resource_type: 'auto',
  });

  // Remove file from server after upload
  fs.unlinkSync(req.file.path);

  const tender = await Tender.create({
    organization,
    description,
    dueDate,
    price,
    documentUrl: result.secure_url,
    submittedBy: req.user._id,
  });

  res.status(201).json(tender);
});

// @desc    Update tender status
// @route   PATCH /api/tenders/:id/status
// @access  Private/Admin
export const updateTenderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const tender = await Tender.findById(req.params.id);

  if (tender) {
    tender.status = status;
    const updatedTender = await tender.save();
    res.json(updatedTender);
  } else {
    res.status(404);
    throw new Error('Tender not found');
  }
});

// @desc    Upload document to tender
// @route   POST /api/tenders/:id/documents
// @access  Private
export const uploadTenderDocument = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

  if (!tender) {
    res.status(404);
    throw new Error('Tender not found');
  }

  // Check if file exists
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a document');
  }

  // Upload file to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'tenders',
    resource_type: 'auto',
  });

  // Remove file from server after upload
  fs.unlinkSync(req.file.path);

  // Update tender with new document URL
  tender.documentUrl = result.secure_url;
  const updatedTender = await tender.save();

  res.json(updatedTender);
});

// @desc    Delete a tender
// @route   DELETE /api/tenders/:id
// @access  Private/Admin
export const deleteTender = asyncHandler(async (req, res) => {
  const tender = await Tender.findById(req.params.id);

  if (tender) {
    // Extract public ID from Cloudinary URL
    const publicId = tender.documentUrl
      .split('/')
      .slice(-1)[0]
      .split('.')[0];

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(`tenders/${publicId}`);

    // Delete tender from database
    await tender.deleteOne();
    res.json({ message: 'Tender removed' });
  } else {
    res.status(404);
    throw new Error('Tender not found');
  }
});