import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import Tender from '../models/tenderModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all tenders
// @route   GET /api/tenders
// @access  Private
export const getTenders = asyncHandler(async (req, res) => {
  try {
    const tenders = await Tender.find({})
      .sort({ dueDate: 1 })
      .populate('submittedBy', 'name email');
    
    console.log('Fetched tenders:', tenders);
    res.json(tenders);
  } catch (error) {
    console.error('Error in getTenders:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single tender
// @route   GET /api/tenders/:id
// @access  Private
export const getTenderById = asyncHandler(async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('submittedBy', 'name email');

    if (!tender) {
      res.status(404);
      throw new Error('Tender not found');
    }

    console.log('Fetched tender:', tender);
    res.json(tender);
  } catch (error) {
    console.error('Error in getTenderById:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// @desc    Create a tender
// @route   POST /api/tenders
// @access  Private
export const createTender = asyncHandler(async (req, res) => {
  try {
    const { tenderId, organization, description, dueDate, price, attributes } = req.body;

    // Validate tender ID
    const tenderExists = await Tender.findOne({ tenderId });
    if (tenderExists) {
      res.status(400);
      throw new Error('Tender ID already exists');
    }

    // Handle multiple file uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tenders',
          resource_type: 'auto',
        });

        // Add document info
        documents.push({
          url: result.secure_url,
          name: file.originalname,
          size: file.size,
        });

        // Remove file from server after upload
        fs.unlinkSync(file.path);
      }
    }

    // Create tender with or without attributes based on user role
    const tenderData = {
      tenderId,
      organization,
      description,
      dueDate,
      price: Number(price),
      documents,
      submittedBy: req.user._id,
    };

    // Only add attributes if user is admin and attributes were provided
    if (req.user.role === 'admin' && attributes) {
      tenderData.attributes = JSON.parse(attributes);
    }

    const tender = await Tender.create(tenderData);
    const populatedTender = await tender.populate('submittedBy', 'name email');
    
    console.log('Created tender:', populatedTender);
    res.status(201).json(populatedTender);
  } catch (error) {
    console.error('Error in createTender:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// @desc    Update tender
// @route   PUT /api/tenders/:id
// @access  Private
export const updateTender = asyncHandler(async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      res.status(404);
      throw new Error('Tender not found');
    }

    // Check if user has permission to update
    if (tender.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin'||req.user.role !== 'user') {
      res.status(403);
      throw new Error('Not authorized to update this tender');
    }

    // Handle document updates if files were uploaded
    const documents = [...tender.documents];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tenders',
          resource_type: 'auto',
        });

        documents.push({
          url: result.secure_url,
          name: file.originalname,
          size: file.size,
        });

        fs.unlinkSync(file.path);
      }
    }

    // Update basic tender information
    tender.tenderId = req.body.tenderId || tender.tenderId;
    tender.organization = req.body.organization || tender.organization;
    tender.description = req.body.description || tender.description;
    tender.dueDate = req.body.dueDate || tender.dueDate;
    tender.price = req.body.price || tender.price;
    tender.documents = documents;

    // Only update attributes if user is admin and attributes were provided
    if (req.user.role === 'admin' && req.body.attributes) {
      tender.attributes = JSON.parse(req.body.attributes);
    }

    const updatedTender = await tender.save();
    const populatedTender = await updatedTender.populate('submittedBy', 'name email');
    
    console.log('Updated tender:', populatedTender);
    res.json(populatedTender);
  } catch (error) {
    console.error('Error in updateTender:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// @desc    Update tender status
// @route   PATCH /api/tenders/:id/status
// @access  Private/Admin
export const updateTenderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      res.status(404);
      throw new Error('Tender not found');
    }

    tender.status = status;
    const updatedTender = await tender.save();
    const populatedTender = await updatedTender.populate('submittedBy', 'name email');
    
    console.log('Updated tender status:', populatedTender);
    res.json(populatedTender);
  } catch (error) {
    console.error('Error in updateTenderStatus:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// @desc    Delete a tender
// @route   DELETE /api/tenders/:id
// @access  Private/Admin
export const deleteTender = asyncHandler(async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);

    if (!tender) {
      res.status(404);
      throw new Error('Tender not found');
    }

    // Delete all associated documents from Cloudinary
    for (const doc of tender.documents) {
      const publicId = doc.url.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`tenders/${publicId}`);
    }

    await tender.deleteOne();
    console.log('Tender deleted:', req.params.id);
    res.json({ message: 'Tender removed' });
  } catch (error) {
    console.error('Error in deleteTender:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
});