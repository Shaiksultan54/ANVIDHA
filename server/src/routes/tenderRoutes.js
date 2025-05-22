import express from 'express';
import {
  getTenders,
  getTenderById,
  createTender,
  updateTender,
  updateTenderStatus,
  deleteTender,
  deleteDocument,
} from '../controllers/tenderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadMultiple, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/tenders
// @desc    Get all tenders with pagination and filtering
// @access  Private
router.get('/', protect, getTenders);

// @route   POST /api/tenders
// @desc    Create a new tender with multiple documents
// @access  Private
router.post(
  '/',
  protect,
  uploadMultiple,
  handleMulterError,
  createTender
);

// @route   GET /api/tenders/:id
// @desc    Get single tender by ID
// @access  Private
router.get('/:id', protect, getTenderById);

// @route   PUT /api/tenders/:id
// @desc    Update tender (admin or owner only)
// @access  Private
router.put(
  '/:id',
  protect,
  uploadMultiple,
  handleMulterError,
  updateTender
);

// @route   PATCH /api/tenders/:id/status
// @desc    Update tender status (admin only)
// @access  Private/Admin
router.patch('/:id/status', protect, admin, updateTenderStatus);

// @route   DELETE /api/tenders/:id
// @desc    Delete tender (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteTender);

// @route   DELETE /api/tenders/:id/documents/:documentId
// @desc    Delete specific document from tender (admin or owner)
// @access  Private
router.delete('/:id/documents/:documentId', protect, deleteDocument);

export default router;