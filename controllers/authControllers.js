import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import Worker from '../model/workersModel.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        console.log(`authControllers.registerUser called: ${req.method} ${req.originalUrl}`);
        const { email, password, firstName, lastName, phoneNumber, specialty, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const userRole = role ? role.toLowerCase() : 'worker'; // default to worker if not provided

        // Only allow worker or facility registrations here
        if (!['worker', 'facility'].includes(userRole)) {
            return res.status(400).json({ message: 'Invalid role. Allowed roles: worker, facility' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        };

        // generate email verification OTP
        const emailVerificationOTP = generateOTP();
        const hashedEmailVerificationOTP = crypto.createHash('sha256').update(emailVerificationOTP).digest('hex');

        // create Base user
        const newUser = await User.create({
            email,
            password,
            role: userRole,
            emailVerificationOTP: hashedEmailVerificationOTP,
            emailVerificationOTPExpires: Date.now() + 10 * 60 * 1000
        });

        // If registering a worker, create a Worker profile
        if (userRole === 'worker') {
            await Worker.create({
                user: newUser._id,
                firstName,
                lastName,
                phoneNumber,
                specialty
            });
        }

        await sendVerificationEmail({
            to: email,
            otp: emailVerificationOTP,
        });

        res.status(201).json({
            message: 'User registered successfully. A verification OTP has been sent to your email.',
            userId: newUser._id,
            role: userRole
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// verify email
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.emailVerificationOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.emailVerificationOTPExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        if (hashedOTP !== user.emailVerificationOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const resendVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const emailVerificationOTP = generateOTP();
        const hashedEmailVerificationOTP = crypto.createHash('sha256').update(emailVerificationOTP).digest('hex');

        user.emailVerificationOTP = hashedEmailVerificationOTP;
        user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        await sendVerificationEmail({
            to: email,
            otp: emailVerificationOTP,
        });

        res.status(200).json({ message: 'A new verification OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If that email exists, a password reset OTP has been sent.' });
        }

        const passwordResetOTP = generateOTP();
        const hashedPasswordResetOTP = crypto.createHash('sha256').update(passwordResetOTP).digest('hex');

        user.passwordResetOTP = hashedPasswordResetOTP;
        user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        await sendPasswordResetEmail({
            to: email,
            otp: passwordResetOTP,
        });

        res.status(200).json({ message: 'If that email exists, a password reset OTP has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.passwordResetOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.passwordResetOTPExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        if (hashedOTP !== user.passwordResetOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.password = password;
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        };
        if (!user.isEmailVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in' });
        };
        const token = signToken(user._id);
        res.status(200).json({"status": "success", token});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

