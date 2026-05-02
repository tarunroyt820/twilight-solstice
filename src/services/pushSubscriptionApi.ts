/**
 * Push Subscription API Client
 * Frontend API integration for push notification subscriptions
 */

import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${VITE_API_URL || 'http://localhost:5000'}/api/push-subscriptions`;

export interface PushSubscriptionResponse {
  subscriptionId: string;
  isActive: boolean;
}

export interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  createdAt?: string;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  subscription: PushSubscription
) {
  const response = await axios.post<{
    success: boolean;
    data: PushSubscriptionResponse;
  }>(`${API_BASE}/subscribe`, { subscription });

  if (!response.data.success) {
    throw new Error('Failed to subscribe');
  }

  return response.data.data;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  const response = await axios.post<{
    success: boolean;
    data: { unsubscribed: boolean };
  }>(`${API_BASE}/unsubscribe`);

  if (!response.data.success) {
    throw new Error('Failed to unsubscribe');
  }

  return response.data.data;
}

/**
 * Get push subscription status
 */
export async function getPushSubscriptionStatus() {
  const response = await axios.get<{
    success: boolean;
    data: SubscriptionStatusResponse;
  }>(`${API_BASE}/status`);

  if (!response.data.success) {
    throw new Error('Failed to get subscription status');
  }

  return response.data.data;
}
