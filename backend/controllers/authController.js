const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const buildVerificationCode = () => crypto.randomInt(100000, 1000000).toString();
const buildResetToken = () => crypto.randomBytes(32).toString('hex');

exports.signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        console.log(`Auth: Signup request for ${email}`);

        // Check if user already exists
        const userExists = await User.findOne({ email });
        console.log(`Auth: userExists check complete for ${email}`);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const emailVerificationToken = buildVerificationCode();
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationToken,
            emailVerificationExpires,
            passwordResetToken: null,
            passwordResetExpires: null
        });

        try {
            await sendVerificationEmail(user.email, emailVerificationToken);
        } catch (mailError) {
            await User.deleteOne({ _id: user._id });
            throw mailError;
        }

        res.status(201).json({
            message: 'Account created. Please check your email and enter the OTP to verify your account.',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: "Login successful",
            token,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const newToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({
            message: 'Invalid refresh token'
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body.email ? req.body : req.query;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({
            email,
            emailVerificationToken: otp,
            emailVerificationExpires: { $gt: new Date() }
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return res.status(400).json({ message: 'OTP is invalid or expired.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        user.emailVerificationToken = buildVerificationCode();
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(user.email, user.emailVerificationToken);

        res.json({ message: 'A new verification email has been sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

        if (user) {
            user.passwordResetToken = buildResetToken();
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            await sendPasswordResetEmail(user.email, user.passwordResetToken);
        }

        res.json({
            message: 'If that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Reset token and new password are required.' });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        }).select('+passwordResetToken +passwordResetExpires +password');

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
