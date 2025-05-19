import express from 'express';
import {
  getTenders,
  getTenderById,
  createTender,
  updateTenderStatus,
  uploadTenderDocument,
  deleteTender,
} from '../controllers/tenderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getTenders)
  .post(protect, upload.single('document'), createTender);

router
  .route('/:id')
  .get(protect, getTenderById)
  .delete(protect, admin, deleteTender);

router
  .route('/:id/status')
  .patch(protect, admin, updateTenderStatus);

router
  .route('/:id/documents')
  .post(protect, upload.single('document'), uploadTenderDocument);

export default router;