/**
 * Notification Hooks
 * React Query integration for notifications
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  Notification,
  NotificationListResponse,
} from '@/services/notificationsApi';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'];

/**
 * Get paginated notifications with infinite scroll support
 */
export function useGetNotifications() {
  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) => getNotifications(20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.skip + lastPage.pagination.limit
        : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get unread notification count with auto-polling
 * Polls every 10 seconds to keep unread count fresh
 */
export function useGetUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: getUnreadCount,
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 5000, // 5 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mark a notification as read
 */
export function useMarkNotificationRead(notificationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markNotificationRead(notificationId),
    onSuccess: (updatedNotification) => {
      // Optimistically update the notification in the cache
      queryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: NotificationListResponse) => ({
              ...page,
              notifications: page.notifications.map((n: Notification) =>
                n._id === notificationId ? updatedNotification : n
              ),
              unreadCount: Math.max(0, page.unreadCount - 1),
            })),
          };
        }
      );

      // Invalidate unread count to refetch
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate all notifications to refetch
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Delete a notification
 */
export function useDeleteNotification(notificationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Utility to clear all notification queries from cache
 */
export function useClearNotificationCache() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    queryClient.removeQueries({ queryKey: UNREAD_COUNT_KEY });
  };
}
