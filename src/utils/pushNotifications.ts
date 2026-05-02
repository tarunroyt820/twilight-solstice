/**
 * Push Notifications Utility
 * Handles browser push notification registration and permissions
 */

/**
 * Check if browser supports push notifications
 */
export const isPushNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Check current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
};

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notifications] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[Push Notifications] Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[Push Notifications] Service worker registration failed:', error);
    return null;
  }
};

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notifications] Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push Notifications] Permission request result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[Push Notifications] Permission request failed:', error);
    return false;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notifications] Push notifications not supported');
    return null;
  }

  try {
    // Register service worker if not already registered
    let registration: ServiceWorkerRegistration | null =
      (await navigator.serviceWorker.getRegistration()) ?? null;
    if (!registration) {
      registration = await registerServiceWorker();
    }

    if (!registration) {
      throw new Error('Failed to register service worker');
    }

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('[Push Notifications] Already subscribed');
      return subscription;
    }

    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    console.log('[Push Notifications] Subscribed:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push Notifications] Subscription failed:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return true;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push Notifications] Unsubscribed');
    }

    return true;
  } catch (error) {
    console.error('[Push Notifications] Unsubscribe failed:', error);
    return false;
  }
};

/**
 * Show local notification (doesn't require permission)
 * Useful for testing or showing notifications when service worker is active
 */
export const showLocalNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notifications] Push notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        icon: '/images/logo.png',
        badge: '/images/badge.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('[Push Notifications] Failed to show notification:', error);
  }
};

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get current push subscription
 */
export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Push Notifications] Failed to get subscription:', error);
    return null;
  }
};
