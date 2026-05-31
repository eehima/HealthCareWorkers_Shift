import express from 'express';
import * as authControllers from '../controllers/authControllers.js';

const router = express.Router();

// Authentication routes for workers and facilities
router.post('/register', authControllers.registerUser);
router.get('/verify-email', authControllers.verifyEmail);
router.post('/login', authControllers.loginUser);

export default router;
