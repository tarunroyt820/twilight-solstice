/**
 * Service Worker for Push Notifications
 * Handles incoming push notifications and displays them to the user
 */

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('[Service Worker] Push event received but no data');
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, data: notificationData } = data;

    const options = {
      body: body || 'You have a new notification from Nextaro',
      icon: icon || '/images/logo.png',
      badge: badge || '/images/badge.png',
      tag: tag || 'nextaro-notification',
      requireInteraction: true,
      data: notificationData || {},
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/images/open-icon.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/images/close-icon.png',
        },
      ],
    };

    console.log('[Service Worker] Displaying notification:', title);
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[Service Worker] Error handling push event:', error);
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
});
