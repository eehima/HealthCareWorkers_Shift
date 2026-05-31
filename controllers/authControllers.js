import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import Worker from '../model/workersModel.js';

// generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        console.log(`authControllers.registerUser called: ${req.method} ${req.originalUrl}`);
        const { email, password, firstName, lastName, phoneNumber, specialty, role } = req.body;

        const userRole = role ? role.toLowerCase() : 'worker';

        // Only allow worker or facility registrations here
        if (!['worker', 'facility'].includes(userRole)) {
            return res.status(400).json({ message: 'Invalid role. Allowed roles: worker, facility' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        };

        // generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const hashedEmailVerificationToken = crypto.createHash('sha256').update(emailVerificationToken).digest('hex');

        // create Base user
        const newUser = await User.create({
            email,
            password,
            role: userRole,
            emailVerificationToken: hashedEmailVerificationToken,
            emailVerificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
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

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            emailVerificationToken,
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
        const hashedToken = crypto.createHash('sha256').update(req.query.token).digest('hex');
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
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

