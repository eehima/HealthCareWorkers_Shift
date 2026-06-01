import express from 'express';
import * as authControllers from '../controllers/authControllers.js';

const router = express.Router();

// Authentication routes for workers and facilities
router.post('/register', authControllers.registerUser);
router.post('/verify-email', authControllers.verifyEmail);
router.post('/resend-email-otp', authControllers.resendVerificationOTP);
router.post('/forgot-password', authControllers.forgotPassword);
router.post('/reset-password', authControllers.resetPassword);
router.post('/login', authControllers.loginUser);

export default router;
