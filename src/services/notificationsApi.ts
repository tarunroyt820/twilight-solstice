/**
 * Notifications API Client
 * Frontend API integration for notifications
 */

import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${VITE_API_URL || 'http://localhost:5000'}/api/notifications`;

export interface Notification {
  _id: string;
  type:
    | 'request_received'
    | 'request_accepted'
    | 'request_declined'
    | 'session_reminder'
    | 'noshow_alert'
    | 'dispute_filed'
    | 'credits_awarded'
    | 'exchange_completed'
    | 'milestone_due_soon'
    | 'milestone_overdue'
    | 'plan_ai_ready'
    | 'recommendation_generated';
  message: string;
  relatedId?: {
    planId?: string;
    milestoneId?: string;
    milestoneName?: string;
    planTitle?: string;
    daysUntilDue?: number;
    daysOverdue?: number;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

/**
 * Get all notifications with pagination
 */
export async function getNotifications(limit = 20, skip = 0) {
  const response = await axios.get<{
    success: boolean;
    data: NotificationListResponse;
  }>(`${API_BASE}?limit=${limit}&skip=${skip}`);

  if (!response.data.success) {
    throw new Error('Failed to fetch notifications');
  }

  return response.data.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  const response = await axios.get<{
    success: boolean;
    data: { unreadCount: number };
  }>(`${API_BASE}/unread-count`);

  if (!response.data.success) {
    throw new Error('Failed to fetch unread count');
  }

  return response.data.data.unreadCount;
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const response = await axios.patch<{
    success: boolean;
    data: Notification;
  }>(`${API_BASE}/${notificationId}/read`);

  if (!response.data.success) {
    throw new Error('Failed to mark notification as read');
  }

  return response.data.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const response = await axios.patch<{
    success: boolean;
    data: { modifiedCount: number };
  }>(`${API_BASE}/read-all`);

  if (!response.data.success) {
    throw new Error('Failed to mark all notifications as read');
  }

  return response.data.data;
}

/**
 * Delete a specific notification
 */
export async function deleteNotification(notificationId: string) {
  const response = await axios.delete<{
    success: boolean;
    data: { deletedId: string };
  }>(`${API_BASE}/${notificationId}`);

  if (!response.data.success) {
    throw new Error('Failed to delete notification');
  }

  return response.data.data;
}
