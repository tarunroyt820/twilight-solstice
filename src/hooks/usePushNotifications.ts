/**
 * Push Notifications Hook
 * React hook for managing push notification subscriptions
 */

import { useEffect, useState, useCallback } from 'react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  showLocalNotification,
} from '@/utils/pushNotifications';
import { toast } from 'sonner';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  requestPermission: () => Promise<void>;
}

/**
 * Hook to manage push notifications
 * Handles registration, subscription, and permission requests
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported] = useState(() => isPushNotificationSupported());
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) return;

      try {
        const subscription = await getPushSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('[Push Notifications Hook] Failed to check subscription:', error);
      }
    };

    checkSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported on this device');
      return;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          toast.error('Permission denied. Enable notifications in settings.');
          setPermission(getNotificationPermission());
          return;
        }
        setPermission('granted');
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      // Get VAPID public key from environment
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error('Push notification setup incomplete. Contact support.');
        console.error('[Push Notifications] VITE_VAPID_PUBLIC_KEY not set');
        return;
      }

      // Subscribe to push
      const subscription = await subscribeToPushNotifications(vapidPublicKey);
      if (subscription) {
        setIsSubscribed(true);
        toast.success('Notifications enabled successfully!');

        // Show test notification
        await showLocalNotification('Notifications Enabled', {
          body: "You'll now receive notifications for important events",
        });
      } else {
        throw new Error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      console.error('[Push Notifications Hook] Subscription error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to enable notifications'
      );
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('[Push Notifications Hook] Unsubscribe error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!isSupported) return;

      try {
        await showLocalNotification(title, options);
      } catch (error) {
        console.error('[Push Notifications Hook] Show notification error:', error);
      }
    },
    [isSupported]
  );

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    try {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermission());

      if (granted) {
        toast.success('Permission granted');
      } else {
        toast.error('Permission denied');
      }
    } catch (error) {
      console.error('[Push Notifications Hook] Permission request error:', error);
      toast.error('Failed to request permission');
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    showNotification,
    requestPermission,
  };
}
