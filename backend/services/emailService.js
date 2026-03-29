const nodemailer = require('nodemailer');

const isEmailEnabled = (process.env.EMAIL_ENABLED || 'false').toLowerCase() === 'true';

const transporter = isEmailEnabled
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    })
    : null;

exports.sendVerificationEmail = async (to, otp) => {
    if (!isEmailEnabled) {
        console.log(`Email disabled: skipped verification email for ${to}`);
        return;
    }

    await transporter.sendMail({
        from: `"Nextaro" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Nextaro verification code',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#140C30;color:#fff;border-radius:16px">
                <h2 style="color:#16A085">Verify Your Email</h2>
                <p>Use this OTP to verify your email address:</p>
                <div style="display:inline-block;padding:16px 24px;background:rgba(22,160,133,0.15);color:#fff;border-radius:12px;font-weight:bold;font-size:28px;letter-spacing:6px;margin:16px 0">
                    ${otp}
                </div>
                <p style="color:#BDD8E9;font-size:12px">This code expires in 24 hours. If you didn't create an account, ignore this email.</p>
            </div>
        `
    });
};

exports.sendPasswordResetEmail = async (to, token) => {
    if (!isEmailEnabled) {
        console.log(`Email disabled: skipped password reset email for ${to}`);
        return;
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Nextaro" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your Nextaro password',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#140C30;color:#fff;border-radius:16px">
                <h2 style="color:#16A085">Reset Your Password</h2>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#16A085;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold;margin:16px 0">
                    Reset Password
                </a>
                <p style="color:#BDD8E9;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>
        `
    });
};
