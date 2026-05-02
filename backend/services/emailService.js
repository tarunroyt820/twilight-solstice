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

/**
 * Send milestone due soon notification email
 */
exports.sendMilestoneDueSoonEmail = async (to, milestone, plan, daysUntilDue) => {
    if (!isEmailEnabled) {
        console.log(`Email disabled: skipped milestone due soon email for ${to}`);
        return;
    }

    await transporter.sendMail({
        from: `"Nextaro" <${process.env.EMAIL_USER}>`,
        to,
        subject: `⏰ Milestone Reminder: "${milestone.title}" due in ${daysUntilDue} days`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#140C30;color:#fff;border-radius:16px">
                <h2 style="color:#667eea;margin-top:0">⏰ Milestone Due Soon</h2>
                <p>Your milestone <strong>"${milestone.title}"</strong> in the plan <strong>"${plan.title}"</strong> is due in <strong>${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}</strong>!</p>
                
                <div style="background:rgba(102,126,234,0.1);padding:16px;border-left:4px solid #667eea;margin:20px 0;border-radius:6px;">
                    <h3 style="color:#667eea;margin-top:0">Milestone Details</h3>
                    <ul style="margin:10px 0;padding-left:20px;color:#BDD8E9;">
                        <li><strong>Type:</strong> ${milestone.type}</li>
                        <li><strong>Estimated Effort:</strong> ${milestone.estimateHours} hours</li>
                        <li><strong>Priority:</strong> <span style="color:#f5576c;font-weight:bold;">${milestone.priority}</span></li>
                        <li><strong>Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString()}</li>
                    </ul>
                    ${milestone.notes ? `<p style="color:#BDD8E9;"><strong>Notes:</strong> ${milestone.notes}</p>` : ''}
                </div>
                
                <p>Start working on this milestone to stay on track with your career path!</p>
                <p style="color:#BDD8E9;font-size:12px;margin-top:20px">This is an automated message from Nextaro. Please do not reply to this email.</p>
            </div>
        `
    });
};

/**
 * Send milestone overdue notification email
 */
exports.sendMilestoneOverdueEmail = async (to, milestone, plan, daysOverdue) => {
    if (!isEmailEnabled) {
        console.log(`Email disabled: skipped milestone overdue email for ${to}`);
        return;
    }

    await transporter.sendMail({
        from: `"Nextaro" <${process.env.EMAIL_USER}>`,
        to,
        subject: `⚠️ OVERDUE: Milestone "${milestone.title}" is ${daysOverdue} days late`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#140C30;color:#fff;border-radius:16px">
                <h2 style="color:#f5576c;margin-top:0">⚠️ Milestone Overdue</h2>
                <p>Your milestone <strong>"${milestone.title}"</strong> in the plan <strong>"${plan.title}"</strong> is <strong style="color:#f5576c">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>.</p>
                
                <div style="background:rgba(245,87,108,0.1);padding:16px;border-left:4px solid #f5576c;margin:20px 0;border-radius:6px;">
                    <h3 style="color:#f5576c;margin-top:0">Milestone Details</h3>
                    <ul style="margin:10px 0;padding-left:20px;color:#BDD8E9;">
                        <li><strong>Title:</strong> ${milestone.title}</li>
                        <li><strong>Type:</strong> ${milestone.type}</li>
                        <li><strong>Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString()}</li>
                        <li><strong>Days Overdue:</strong> <span style="color:#f5576c;font-weight:bold">${daysOverdue}</span></li>
                    </ul>
                    ${milestone.notes ? `<p style="color:#BDD8E9;"><strong>Notes:</strong> ${milestone.notes}</p>` : ''}
                </div>
                
                <p>Please prioritize completing this milestone to get back on track with your career development.</p>
                <p style="color:#BDD8E9;font-size:12px;margin-top:20px">This is an automated message from Nextaro. Please do not reply to this email.</p>
            </div>
        `
    });
};

/**
 * Send plan AI ready notification email
 */
exports.sendPlanAIReadyEmail = async (to, plan) => {
    if (!isEmailEnabled) {
        console.log(`Email disabled: skipped plan AI ready email for ${to}`);
        return;
    }

    await transporter.sendMail({
        from: `"Nextaro" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🎯 Your Career Plan "${plan.title}" is Ready!`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#140C30;color:#fff;border-radius:16px">
                <h2 style="color:#667eea;margin-top:0">🎯 Your AI Career Plan is Ready</h2>
                <p>Exciting news! Your AI-generated career plan <strong>"${plan.title}"</strong> targeting <strong>${plan.targetRole}</strong> is now ready.</p>
                
                <div style="background:rgba(102,126,234,0.1);padding:16px;border-left:4px solid #667eea;margin:20px 0;border-radius:6px;">
                    <h3 style="color:#667eea;margin-top:0">Plan Summary</h3>
                    <ul style="margin:10px 0;padding-left:20px;color:#BDD8E9;">
                        <li><strong>Target Role:</strong> ${plan.targetRole}</li>
                        <li><strong>Milestones:</strong> ${plan.milestones?.length || 0}</li>
                        <li><strong>Recommendations:</strong> ${plan.recommendations?.length || 0}</li>
                        <li><strong>Overall Progress:</strong> ${plan.overallProgress}%</li>
                    </ul>
                </div>
                
                <p>Start working on your milestones to accelerate your career growth!</p>
                <p style="color:#BDD8E9;font-size:12px;margin-top:20px">This is an automated message from Nextaro. Please do not reply to this email.</p>
            </div>
        `
    });
};
