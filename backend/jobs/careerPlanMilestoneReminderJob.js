/**
 * Career Plan Milestone Reminder Job
 * Checks for upcoming and overdue milestones, creates notifications and sends emails
 */

const CareerPlan = require('../models/CareerPlan');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  sendMilestoneDueSoonEmail,
  sendMilestoneOverdueEmail,
} = require('../services/emailService');

const runCareerPlanReminderJob = async () => {
  try {
    const now = new Date();

    // Find all active career plans with milestones
    const activePlans = await CareerPlan.find({
      status: 'ACTIVE',
      milestones: { $exists: true, $ne: [] }
    })
      .select('userId milestones title targetRole')
      .lean();

    console.log(
      `[Career Plan Reminder Job] Checking ${activePlans.length} active plans...`
    );

    for (const plan of activePlans) {
      for (const milestone of plan.milestones) {
        // Skip completed milestones
        if (milestone.completed) continue;
        if (!milestone.dueDate) continue;

        const daysUntilDue = Math.ceil(
          (new Date(milestone.dueDate) - now) / (1000 * 60 * 60 * 24)
        );

        // Check for overdue milestones (more than 1 day overdue)
        if (daysUntilDue < -1) {
          await createOrUpdateNotification(
            plan.userId,
            'milestone_overdue',
            {
              planId: plan._id,
              milestoneId: milestone._id,
              milestoneName: milestone.title,
              planTitle: plan.title,
              daysOverdue: Math.abs(daysUntilDue)
            },
            `Milestone "${milestone.title}" in "${plan.title}" is ${Math.abs(daysUntilDue)} days overdue`,
            {
              type: 'overdue',
              milestone,
              plan,
              daysOverdue: Math.abs(daysUntilDue)
            }
          );
        }
        // Check for milestones due soon (1-3 days)
        else if (daysUntilDue > 0 && daysUntilDue <= 3) {
          await createOrUpdateNotification(
            plan.userId,
            'milestone_due_soon',
            {
              planId: plan._id,
              milestoneId: milestone._id,
              milestoneName: milestone.title,
              planTitle: plan.title,
              daysUntilDue
            },
            `Milestone "${milestone.title}" is due in ${daysUntilDue} days`,
            {
              type: 'due_soon',
              milestone,
              plan,
              daysUntilDue
            }
          );
        }
      }
    }

    console.log('[Career Plan Reminder Job] Completed successfully');
  } catch (error) {
    console.error('[Career Plan Reminder Job] Failed:', error.message);
    // Never throw - reminders should not break core flow
  }
};

/**
 * Create or update notification to avoid duplicates AND send email
 * Only create one notification per milestone per day
 */
const createOrUpdateNotification = async (
  userId,
  type,
  relatedData,
  message,
  emailData = null
) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if notification for this milestone already exists today
    const existingNotification = await Notification.findOne({
      userId,
      type,
      'relatedId.milestoneId': relatedData.milestoneId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (!existingNotification) {
      // Create notification
      await Notification.create({
        userId,
        type,
        relatedId: relatedData,
        message,
        read: false
      });

      console.log(`[Career Plan Reminder Job] Created notification: ${message}`);

      // Send email if configured
      if (emailData) {
        try {
          const user = await User.findById(userId).select('email').lean();
          if (user?.email) {
            if (emailData.type === 'overdue') {
              await sendMilestoneOverdueEmail(
                user.email,
                emailData.milestone,
                emailData.plan,
                emailData.daysOverdue
              );
            } else if (emailData.type === 'due_soon') {
              await sendMilestoneDueSoonEmail(
                user.email,
                emailData.milestone,
                emailData.plan,
                emailData.daysUntilDue
              );
            }
          }
        } catch (emailError) {
          console.error(
            '[Career Plan Reminder Job] Error sending email:',
            emailError.message
          );
          // Continue even if email fails - notification is more important
        }
      }
    }
  } catch (error) {
    console.error(
      '[Career Plan Reminder Job] Error creating notification:',
      error.message
    );
  }
};

module.exports = { runCareerPlanReminderJob };
