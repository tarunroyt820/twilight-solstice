# Notification System Setup Guide

Complete setup guide for notifications, email notifications, and push notifications in Nextaro.

## Overview

The notification system has three components:

1. **In-App Notifications** - Stored in database, shown in notification bell
2. **Email Notifications** - Sent via Nodemailer (Gmail, SendGrid, or custom SMTP)
3. **Browser Push Notifications** - Service Worker-based push notifications

---

## 1. In-App Notifications (Built-in, No Setup Required)

### How It Works
- Backend job checks for overdue/upcoming milestones every 30 minutes
- Creates notifications in database
- Frontend polls unread count every 10 seconds
- Notifications appear in the bell icon dropdown

### Configuration
No special configuration needed. The system uses:
- MongoDB for storage
- BullMQ queue (installed via `npm install bullmq redis`)
- Nodemailer (already in package.json)

---

## 2. Email Notifications

### Prerequisites
- Gmail account OR SendGrid API key OR custom SMTP server

### Setup Instructions

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to myaccount.google.com → Security
   - App passwords → Select Mail and Device (Windows Computer)
   - Generate password (16 characters)

3. **Set Environment Variables** in `backend/.env`:
```bash
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-16-chars
```

#### Option B: SendGrid

1. **Create SendGrid Account** at sendgrid.com
2. **Generate API Key** with Mail Send permission
3. **Install SendGrid Transport**:
```bash
cd backend && npm install nodemailer-sendgrid-transport
```

4. **Update backend/services/emailService.js** transporter:
```javascript
const sgTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sgTransport({
  auth: { api_key: process.env.SENDGRID_API_KEY }
}));
```

5. **Set Environment Variable**:
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_ENABLED=true
```

#### Option C: Custom SMTP (e.g., Outlook, Office 365)

1. **Update backend/services/emailService.js**:
```javascript
transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

2. **Set Environment Variables**:
```bash
EMAIL_ENABLED=true
SMTP_HOST=smtp.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Testing Email Setup

Run this command to test:
```bash
node -e "
const emailService = require('./services/emailService');
emailService.sendMilestoneDueSoonEmail(
  'your-test-email@gmail.com',
  { title: 'Test Milestone', type: 'skill', estimateHours: 10, priority: 'HIGH', dueDate: new Date(), notes: 'Test' },
  { title: 'Test Plan', targetRole: 'Backend Developer' },
  2
);
"
```

---

## 3. Browser Push Notifications

### Prerequisites
- HTTPS URL (push notifications require HTTPS, even localhost is fine in dev)
- VAPID key pair (one-time generation)
- Node.js back-end service to send push messages

### Step 1: Generate VAPID Keys

Run this command once:
```bash
cd backend && node -e "
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
"
```

Or install web-push globally:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

### Step 2: Install Required Packages

Backend:
```bash
cd backend && npm install web-push
```

Frontend: (Already included via public/service-worker.js)

### Step 3: Set Environment Variables

**Backend (.env):**
```bash
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

**Frontend (.env or .env.local):**
```bash
VITE_VAPID_PUBLIC_KEY=your-public-key
```

### Step 4: Register Service Worker

In `src/main.tsx`, add at app startup:
```typescript
import { registerServiceWorker } from '@/utils/pushNotifications';

// After App mounts
registerServiceWorker().catch(err => 
  console.error('[App] Service worker registration failed:', err)
);
```

### Step 5: Add Notification Settings to UI

Add to user settings page or dashboard:
```tsx
import PushNotificationSettings from '@/components/settings/PushNotificationSettings';

// In settings page
<PushNotificationSettings />
```

### Testing Push Notifications

1. Click "Enable Notifications" in settings
2. Browser will ask for permission
3. Grant permission
4. You should see a test notification
5. Later, milestone reminders will appear as push notifications

---

## Backend Notification Sending (Advanced)

To send push notifications from backend:

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const PushSubscription = require('../models/PushSubscription');

// Send to all subscribed users
async function sendPushNotification(userId, notification) {
  const subscription = await PushSubscription.findOne({ 
    userId, 
    isActive: true 
  });
  
  if (subscription) {
    try {
      await webpush.sendNotification(
        subscription.subscription,
        JSON.stringify(notification)
      );
    } catch (error) {
      if (error.statusCode === 410) {
        // Subscription expired, mark as inactive
        subscription.isActive = false;
        await subscription.save();
      }
    }
  }
}
```

---

## Environment Variables Summary

### Backend (.env)

```bash
# Notifications (Optional - defaults disabled)
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Database & Redis (Required)
MONGODB_URI=mongodb://...
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)

```bash
# Push Notifications (Optional)
VITE_VAPID_PUBLIC_KEY=your-public-key
```

---

## Testing Checklist

- [ ] Backend starts: `npm run dev` (from backend)
- [ ] Frontend starts: `npm run dev` (from root)
- [ ] In-app notifications appear in bell icon
- [ ] Email notifications received (if EMAIL_ENABLED=true)
- [ ] Service worker registered (check DevTools → Application → Service Workers)
- [ ] Push notifications enabled (browser asks for permission)
- [ ] Test notification appears when enabling push notifications
- [ ] Milestone reminder emails sent (check spam folder)

---

## Troubleshooting

### Email Not Sending
1. Check `EMAIL_ENABLED=true` in backend/.env
2. Verify email credentials are correct
3. Check Gmail 2FA and app password (if using Gmail)
4. Review backend logs for errors: `[Email Service]`

### Service Worker Not Registering
1. Check browser console for errors
2. Ensure `/public/service-worker.js` exists
3. Service workers require HTTPS (or localhost for dev)
4. Clear browser cache and reload

### Push Notifications Not Appearing
1. Grant browser permission when prompted
2. Check VITE_VAPID_PUBLIC_KEY is set correctly
3. Ensure VAPID_PUBLIC_KEY matches in backend
4. Check browser DevTools → Application → Notifications

### Push Subscription Failed
1. Ensure backend has `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`
2. MongoDB PushSubscription collection exists
3. Check backend logs: `[Push Subscription Controller]`

---

## Notes

- **In-App Notifications**: Always work (no setup required)
- **Email Notifications**: Optional, requires email service configuration
- **Push Notifications**: Optional, requires VAPID keys and HTTPS
- **Fallback Queue**: If Redis/BullMQ unavailable, jobs run synchronously
- **Email Disabled by Default**: Set `EMAIL_ENABLED=true` to activate
- **Notifications Fire Every 30 minutes**: Adjust in `backend/server.js` if needed

---

## Next Steps

1. Install BullMQ and Redis: ✅ Done
2. Configure email service (optional): Follow Step 2
3. Generate VAPID keys: Follow Step 3
4. Enable push notifications: Follow Step 3
5. Add notification UI: Add `<NotificationBell />` to navbar
6. Test all notification types

Done! 🎉
