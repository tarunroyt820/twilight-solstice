/**
 * Push Notification Settings Component
 * Allows users to toggle push notifications
 */

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { Bell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your browser doesn't support push notifications. Try updating to the latest version.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Browser Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? 'You will receive notifications for important events'
            : 'Get notified about overdue milestones and plan updates'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="p-4 rounded-lg border border-border/50 bg-card/40">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Permission Status</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {permission === 'granted'
                  ? 'Notifications enabled'
                  : permission === 'denied'
                    ? 'Notifications blocked'
                    : 'Not asked yet'}
              </p>
            </div>
            {permission === 'granted' && (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
            {permission === 'denied' && (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="p-4 rounded-lg border border-border/50 bg-card/40">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Subscription Status</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isSubscribed ? 'Receiving notifications' : 'Not subscribed'}
              </p>
            </div>
            {isSubscribed && (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {!isSubscribed ? (
            <Button
              onClick={subscribe}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={unsubscribe}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable Notifications'
              )}
            </Button>
          )}

          {permission === 'denied' && !isSubscribed && (
            <p className="text-xs text-muted-foreground text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              Notifications are blocked in your browser settings. You'll need to enable them manually.
            </p>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-2">What you'll receive:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Milestone due soon reminders</li>
            <li>Overdue milestone alerts</li>
            <li>Plan AI completion updates</li>
            <li>Recommendation notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
