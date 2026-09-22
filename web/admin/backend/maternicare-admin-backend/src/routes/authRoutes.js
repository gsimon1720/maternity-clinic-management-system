import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.put(
  '/profile',
  authenticate,
  validate(schemas.updateProfile),
  authController.updateProfile
);
router.post(
  '/change-password',
  authenticate,
  validate(schemas.changePassword),
  authController.changePassword
);

export default router;
