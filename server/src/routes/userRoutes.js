import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createAdminUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, admin, getUsers);

router
  .route('/admin')
  .post(protect, admin, createAdminUser);

router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;