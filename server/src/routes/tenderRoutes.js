import express from 'express';
import {
  getTenders,
  getTenderById,
  createTender,
  updateTender,
  updateTenderStatus,
  deleteTender,
} from '../controllers/tenderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getTenders)
  .post(protect, upload.array('documents', 5), createTender);

router
  .route('/:id')
  .get(protect, getTenderById)
  .put(protect, upload.array('documents', 5), updateTender)
  .delete(protect, admin, deleteTender);

router
  .route('/:id/status')
  .patch(protect, admin, updateTenderStatus);

export default router;